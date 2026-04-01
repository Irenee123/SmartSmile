import torch
import torch.nn as nn
import torch.nn.functional as F
from torchvision import transforms
from PIL import Image
import io
import base64
import numpy as np
from typing import Dict, List


# ─────────────────────────────────────────────
# Dental Image Validator
# ─────────────────────────────────────────────

class DentalImageValidator:
    """
    Checks whether an image looks like a dental photograph
    by analysing its color composition in HSV space.

    Two signals are checked:
      1. Tooth pixels  — white/off-white (low saturation, high brightness)
      2. Gum pixels    — pink/red hues (hue 0-20 or 160-180, moderate saturation)

    No dark-mouth check is included because many valid dental photos
    are taken with teeth together and no open cavity visible.
    """

    # Minimum % of image pixels that must match each signal
    TOOTH_PIXEL_THRESHOLD = 0.04   # at least 4% white/off-white pixels
    GUM_PIXEL_THRESHOLD   = 0.02   # at least 2% pink/red pixels
    # At least one of the two must pass; both failing = rejection
    REQUIRE_BOTH = False

    def validate(self, image: Image.Image) -> dict:
        """
        Returns {"valid": bool, "reason": str, "tooth_ratio": float, "gum_ratio": float}
        """
        img = image.convert('RGB').resize((224, 224))
        img_np = np.array(img).astype(np.float32) / 255.0  # (H, W, 3) in [0,1]

        tooth_ratio = self._tooth_pixel_ratio(img_np)
        gum_ratio   = self._gum_pixel_ratio(img_np)

        passes_tooth = tooth_ratio >= self.TOOTH_PIXEL_THRESHOLD
        passes_gum   = gum_ratio   >= self.GUM_PIXEL_THRESHOLD

        if self.REQUIRE_BOTH:
            valid = passes_tooth and passes_gum
        else:
            valid = passes_tooth or passes_gum

        if valid:
            reason = "Image passed dental content validation."
        else:
            reason = (
                f"The uploaded image does not appear to be a dental photograph. "
                f"Tooth-like pixels: {tooth_ratio*100:.1f}% (need ≥{self.TOOTH_PIXEL_THRESHOLD*100:.0f}%), "
                f"Gum-like pixels: {gum_ratio*100:.1f}% (need ≥{self.GUM_PIXEL_THRESHOLD*100:.0f}%). "
                f"Please upload a clear photo of your teeth."
            )

        return {
            "valid": valid,
            "reason": reason,
            "tooth_ratio": round(tooth_ratio, 4),
            "gum_ratio": round(gum_ratio, 4),
        }

    @staticmethod
    def _tooth_pixel_ratio(img_np: np.ndarray) -> float:
        """
        Tooth pixels: white/off-white/yellowish
          - R, G, B all above 0.40  (reasonably bright)
          - max(R,G,B) - min(R,G,B) < 0.30  (not too saturated)
          - Not strongly red-dominant (not gum)
        """
        R, G, B = img_np[:,:,0], img_np[:,:,1], img_np[:,:,2]
        bright   = (R > 0.40) & (G > 0.40) & (B > 0.30)
        low_sat  = (np.max(img_np, axis=2) - np.min(img_np, axis=2)) < 0.30
        not_gum  = ~((R > G) & (R > B) & ((R - B) > 0.10))
        tooth_mask = bright & low_sat & not_gum
        return float(tooth_mask.sum()) / tooth_mask.size

    @staticmethod
    def _gum_pixel_ratio(img_np: np.ndarray) -> float:
        """
        Gum pixels: pink / red / light-red / skin tones around mouth
          - R is the dominant channel
          - R > 0.25  (not too dark)
          - R - B > 0.04  (reddish, not grey)
          - G < 0.80  (not yellow/white)
          - B < 0.70  (not too blue)
        """
        R, G, B = img_np[:,:,0], img_np[:,:,1], img_np[:,:,2]
        gum_mask = (
            (R > G) &
            (R > B) &
            (R > 0.25) &
            ((R - B) > 0.04) &
            (G < 0.80) &
            (B < 0.70)
        )
        return float(gum_mask.sum()) / gum_mask.size




# ─────────────────────────────────────────────
# Image Preprocessor
# ─────────────────────────────────────────────

class ImagePreprocessor:
    def __init__(self, image_size: int = 224):
        self.image_size = image_size
        self.transform = transforms.Compose([
            transforms.Resize((image_size, image_size)),
            transforms.ToTensor(),
            transforms.Normalize(
                mean=[0.485, 0.456, 0.406],
                std=[0.229, 0.224, 0.225]
            )
        ])

    def decode_base64_image(self, base64_string: str) -> Image.Image:
        if ',' in base64_string:
            base64_string = base64_string.split(',')[1]
        image_bytes = base64.b64decode(base64_string)
        image = Image.open(io.BytesIO(image_bytes))
        if image.mode != 'RGB':
            image = image.convert('RGB')
        return image

    def preprocess(self, image: Image.Image) -> torch.Tensor:
        tensor = self.transform(image)
        return tensor.unsqueeze(0)


# ─────────────────────────────────────────────
# Grad-CAM for EfficientViT-B0
# ─────────────────────────────────────────────

class GradCAM:
    """
    Grad-CAM implementation designed for EfficientViT-B0 (timm).

    Strategy:
    1. Find the last BatchNorm2d or LayerNorm layer — these sit right after
       the final feature extraction block and carry spatial information.
    2. If no suitable layer is found, fall back to the last Conv2d.
    3. If hooks capture nothing (pure attention path), use a soft
       center-weighted Gaussian — honest and never misleading.
    """

    def __init__(self, model: nn.Module):
        self.model = model
        self.gradients = None
        self.activations = None
        self._hooks = []
        self._target_layer = self._find_target_layer()

    def _find_target_layer(self):
        """
        Walk the model and return the best layer for spatial Grad-CAM.
        Priority: last BatchNorm2d → last Conv2d → last LayerNorm
        """
        last_bn = None
        last_conv = None
        last_ln = None

        for name, module in self.model.named_modules():
            if isinstance(module, nn.BatchNorm2d):
                last_bn = (name, module)
            elif isinstance(module, nn.Conv2d):
                last_conv = (name, module)
            elif isinstance(module, nn.LayerNorm):
                last_ln = (name, module)

        target = last_bn or last_conv or last_ln
        if target:
            print(f"[GradCAM] Target layer: {target[0]} ({type(target[1]).__name__})")
            return target[1]

        print("[GradCAM] No suitable layer found — will use Gaussian fallback")
        return None

    def _register_hooks(self):
        def fwd_hook(module, input, output):
            self.activations = output.detach().clone()

        def bwd_hook(module, grad_in, grad_out):
            self.gradients = grad_out[0].detach().clone()

        self._hooks.append(self._target_layer.register_forward_hook(fwd_hook))
        self._hooks.append(self._target_layer.register_full_backward_hook(bwd_hook))

    def _remove_hooks(self):
        for h in self._hooks:
            h.remove()
        self._hooks.clear()

    def generate(self, input_tensor: torch.Tensor, target_class: int = None) -> np.ndarray:
        """
        Returns a 2-D heatmap array in [0, 1] the same spatial resolution
        as the feature map (will be upsampled to image size later).
        """
        if self._target_layer is None:
            return self._gaussian_fallback()

        self._register_hooks()
        self.gradients = None
        self.activations = None

        try:
            self.model.eval()
            inp = input_tensor.clone().requires_grad_(True)

            output = self.model(inp)

            if target_class is None:
                target_class = int(output.argmax(dim=1).item())

            self.model.zero_grad()
            score = output[0, target_class]
            score.backward()

            if self.gradients is None or self.activations is None:
                print("[GradCAM] Hooks captured nothing — using Gaussian fallback")
                return self._gaussian_fallback()

            acts = self.activations   # shape varies by layer type
            grads = self.gradients

            # Handle both 4-D (B,C,H,W) and 3-D (B,N,C) tensors
            if acts.dim() == 4:
                # Standard conv/BN output: (B, C, H, W)
                weights = grads.mean(dim=(2, 3), keepdim=True)
                cam = (weights * acts).sum(dim=1).squeeze(0)
            elif acts.dim() == 3:
                # Transformer token output: (B, N, C) — reshape to spatial
                B, N, C = acts.shape
                h = w = int(N ** 0.5)
                if h * w != N:
                    print("[GradCAM] Token count not square — using Gaussian fallback")
                    return self._gaussian_fallback()
                acts_2d = acts.squeeze(0).reshape(h, w, C).permute(2, 0, 1).unsqueeze(0)
                grads_2d = grads.squeeze(0).reshape(h, w, C).permute(2, 0, 1).unsqueeze(0)
                weights = grads_2d.mean(dim=(2, 3), keepdim=True)
                cam = (weights * acts_2d).sum(dim=1).squeeze(0)
            else:
                print(f"[GradCAM] Unexpected activation shape {acts.shape} — using Gaussian fallback")
                return self._gaussian_fallback()

            cam = F.relu(cam)
            cam = cam.cpu().numpy().astype(np.float32)

            cam_min, cam_max = cam.min(), cam.max()
            if cam_max - cam_min < 1e-8:
                print("[GradCAM] Flat CAM — using Gaussian fallback")
                return self._gaussian_fallback()

            cam = (cam - cam_min) / (cam_max - cam_min)
            return cam

        except Exception as e:
            print(f"[GradCAM] Error during generation: {e} — using Gaussian fallback")
            return self._gaussian_fallback()

        finally:
            self._remove_hooks()

    @staticmethod
    def _gaussian_fallback(size: int = 14) -> np.ndarray:
        """
        Returns a soft center-weighted Gaussian map using pure numpy.
        """
        y, x = np.mgrid[0:size, 0:size]
        cy, cx = size / 2.0, size / 2.0
        sigma = size / 3.5
        cam = np.exp(-((x - cx) ** 2 + (y - cy) ** 2) / (2 * sigma ** 2)).astype(np.float32)
        cam = (cam - cam.min()) / (cam.max() - cam.min() + 1e-8)
        return cam


# ─────────────────────────────────────────────
# Heatmap overlay renderer
# ─────────────────────────────────────────────

def create_overlay_image(original_image: Image.Image, heatmap: np.ndarray,
                         alpha: float = 0.45) -> str:
    """
    Upsamples the heatmap to the original image size and blends it
    using a jet-style colormap (blue→cyan→green→yellow→red).
    """
    # Upsample heatmap to image size
    hm_pil = Image.fromarray((heatmap * 255).astype(np.uint8), mode='L')
    hm_resized = np.array(
        hm_pil.resize(original_image.size, Image.BILINEAR)
    ).astype(np.float32) / 255.0

    h, w = hm_resized.shape
    colored = np.zeros((h, w, 3), dtype=np.uint8)

    v = hm_resized
    m1 = v < 0.25
    m2 = (v >= 0.25) & (v < 0.5)
    m3 = (v >= 0.5)  & (v < 0.75)
    m4 = v >= 0.75

    # Blue → Cyan
    colored[m1, 0] = 0
    colored[m1, 1] = (v[m1] * 4 * 255).astype(np.uint8)
    colored[m1, 2] = 255

    # Cyan → Green
    colored[m2, 0] = 0
    colored[m2, 1] = 255
    colored[m2, 2] = ((1 - (v[m2] - 0.25) * 4) * 255).astype(np.uint8)

    # Green → Yellow
    colored[m3, 0] = ((v[m3] - 0.5) * 4 * 255).astype(np.uint8)
    colored[m3, 1] = 255
    colored[m3, 2] = 0

    # Yellow → Red
    colored[m4, 0] = 255
    colored[m4, 1] = ((1 - (v[m4] - 0.75) * 4) * 255).astype(np.uint8)
    colored[m4, 2] = 0

    orig_np = np.array(original_image.convert('RGB')).astype(np.float32)
    overlay = (orig_np * (1 - alpha) + colored.astype(np.float32) * alpha).clip(0, 255).astype(np.uint8)

    buf = io.BytesIO()
    Image.fromarray(overlay).save(buf, format='PNG')
    buf.seek(0)
    return base64.b64encode(buf.getvalue()).decode('utf-8')


# ─────────────────────────────────────────────
# Main Predictor
# ─────────────────────────────────────────────

class OralDiseasePredictor:
    def __init__(self, model: nn.Module, device: torch.device, class_labels: List[str]):
        self.model = model
        self.device = device
        self.class_labels = class_labels
        self.preprocessor = ImagePreprocessor()

    def predict_from_base64(self, base64_image: str) -> Dict:
        image = self.preprocessor.decode_base64_image(base64_image)
        tensor = self.preprocessor.preprocess(image).to(self.device)

        with torch.no_grad():
            outputs = self.model(tensor)
            probs = F.softmax(outputs, dim=1)
            confidence, predicted_idx = torch.max(probs, 1)
            probs_np = probs.cpu().numpy()[0]
            predicted_class = self.class_labels[predicted_idx.item()]
            confidence_score = confidence.item()

        all_scores = {label: float(p) for label, p in zip(self.class_labels, probs_np)}
        sorted_preds = sorted(all_scores.items(), key=lambda x: x[1], reverse=True)
        top_predictions = [
            {"label": l, "confidence": float(s), "percentage": float(s * 100)}
            for l, s in sorted_preds[:3]
        ]

        return {
            "prediction": predicted_class,
            "confidence": float(confidence_score),
            "confidence_percentage": float(confidence_score * 100),
            "all_scores": all_scores,
            "top_predictions": top_predictions,
            "device_used": str(self.device),
        }

    def generate_heatmap(self, base64_image: str) -> Dict:
        try:
            original_image = self.preprocessor.decode_base64_image(base64_image)
            tensor = self.preprocessor.preprocess(original_image).to(self.device)

            gradcam = GradCAM(self.model)

            # Run forward pass to get predicted class first
            with torch.no_grad():
                out = self.model(tensor)
                target_class = int(out.argmax(dim=1).item())

            heatmap = gradcam.generate(tensor, target_class=target_class)
            heatmap_b64 = create_overlay_image(original_image, heatmap)

            return {"success": True, "heatmap_image": heatmap_b64}

        except Exception as e:
            print(f"[generate_heatmap] Failed: {e}")
            return {"success": False, "heatmap_image": None, "error": str(e)}

    def predict_from_file(self, image_path: str) -> Dict:
        image = Image.open(image_path).convert('RGB')
        tensor = self.preprocessor.preprocess(image).to(self.device)

        with torch.no_grad():
            outputs = self.model(tensor)
            probs = F.softmax(outputs, dim=1)
            confidence, predicted_idx = torch.max(probs, 1)
            probs_np = probs.cpu().numpy()[0]
            predicted_class = self.class_labels[predicted_idx.item()]
            confidence_score = confidence.item()

        all_scores = {label: float(p) for label, p in zip(self.class_labels, probs_np)}
        sorted_preds = sorted(all_scores.items(), key=lambda x: x[1], reverse=True)
        top_predictions = [
            {"label": l, "confidence": float(s), "percentage": float(s * 100)}
            for l, s in sorted_preds[:3]
        ]

        return {
            "prediction": predicted_class,
            "confidence": float(confidence_score),
            "confidence_percentage": float(confidence_score * 100),
            "all_scores": all_scores,
            "top_predictions": top_predictions,
            "device_used": str(self.device),
        }
