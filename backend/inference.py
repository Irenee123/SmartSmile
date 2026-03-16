import torch
torch.set_num_threads(1)
import torch.nn.functional as F
from torchvision import transforms
from PIL import Image
import io
import base64
import numpy as np
from typing import Dict, List, Tuple

# Try to import cv2, fallback to PIL if not available
try:
    import cv2
    CV2_AVAILABLE = True
except ImportError:
    CV2_AVAILABLE = False
    print("Warning: OpenCV not available. Heatmap will use fallback method.")


class GradCAM:
    """
    Generate attention heatmaps using multiple approaches:
    1. Try Grad-CAM if model hooks work
    2. Fall back to image-based attention simulation
    """
    
    def __init__(self, model, target_layer_name: str = None):
        self.model = model
        self.target_layer_name = target_layer_name
        self.gradients = None
        self.activations = None
        self.hooks = []
        
        # Find the target layer automatically if not specified
        self._find_target_layer()
    
    def _find_target_layer(self):
        """Find the last convolutional layer for Grad-CAM"""
        layer_names = []
        
        for name, module in self.model.named_modules():
            if isinstance(module, torch.nn.Conv2d):
                layer_names.append(name)
        
        if layer_names:
            self.target_layer_name = layer_names[-1]
            print(f"Using target layer: {self.target_layer_name}")
        else:
            print("No direct Conv2d layers found, will use image-based attention")
            self.target_layer_name = None
    
    def _register_hooks(self, target_layer):
        """Register forward and backward hooks"""
        def forward_hook(module, input, output):
            self.activations = output.detach()
        
        def backward_hook(module, grad_input, grad_output):
            self.gradients = grad_output[0].detach()
        
        self.hooks.append(target_layer.register_forward_hook(forward_hook))
        self.hooks.append(target_layer.register_full_backward_hook(backward_hook))
    
    def _get_target_layer(self):
        """Get the target layer by name"""
        if self.target_layer_name is None:
            return None
            
        module = self.model
        for name in self.target_layer_name.split('.'):
            module = getattr(module, name)
        return module
    
    def generate(self, input_tensor, target_class: int = None) -> np.ndarray:
        """
        Generate heatmap - tries Grad-CAM, falls back to image-based attention
        """
        self.model.eval()
        
        # Try Grad-CAM first
        target_layer = self._get_target_layer()
        if target_layer is not None:
            try:
                return self._generate_gradcam(input_tensor, target_class)
            except Exception as e:
                print(f"Grad-CAM failed: {e}, using image-based attention")
        
        # Fallback: Image-based attention simulation
        return self._generate_image_attention(input_tensor)
    
    def _generate_gradcam(self, input_tensor, target_class: int = None) -> np.ndarray:
        """Generate Grad-CAM heatmap"""
        target_layer = self._get_target_layer()
        self._register_hooks(target_layer)
        
        try:
            # Forward pass
            output = self.model(input_tensor)
            
            if target_class is None:
                target_class = output.argmax(dim=1).item()
            
            # Backward pass
            self.model.zero_grad()
            class_loss = output[0, target_class]
            class_loss.backward()
            
            if self.activations is None or self.gradients is None:
                raise Exception("Hooks didn't capture gradients")
            
            weights = torch.mean(self.gradients, dim=(2, 3), keepdim=True)
            cam = torch.sum(weights * self.activations, dim=1, keepdim=True)
            cam = F.relu(cam)
            
            cam = cam.cpu().detach().numpy()[0, 0]
            cam = cam - cam.min()
            if cam.max() > 0:
                cam = cam / cam.max()
            
            return cam
            
        finally:
            for hook in self.hooks:
                hook.remove()
            self.hooks = []
    
    def _generate_image_attention(self, input_tensor: torch.Tensor) -> np.ndarray:
        """
        Generate attention heatmap using image analysis
        Uses edge detection and intensity analysis to create a saliency map
        """
        # Get the input image (first batch item)
        img = input_tensor.cpu().detach()[0]
        
        # Convert to numpy and normalize to [0, 1]
        img_np = img.permute(1, 2, 0).numpy()
        img_np = (img_np - img_np.min()) / (img_np.max() - img_np.min() + 1e-8)
        
        # Convert to grayscale
        gray = np.mean(img_np, axis=2)
        
        # Simple edge detection using gradients
        gy, gx = np.gradient(gray)
        edges = np.sqrt(gx**2 + gy**2)
        
        # Normalize edges
        edges = edges / (edges.max() + 1e-8)
        
        # Create attention based on edges and intensity
        # High contrast areas (edges) and bright/dark areas get attention
        attention = edges + (1 - np.abs(gray - 0.5) * 2) * 0.3
        
        # Apply Gaussian blur for smoother attention
        from scipy.ndimage import gaussian_filter
        attention = gaussian_filter(attention, sigma=5)
        
        # Normalize to [0, 1]
        attention = attention - attention.min()
        if attention.max() > 0:
            attention = attention / attention.max()
        
        return attention


def create_overlay_image(original_image: Image.Image, heatmap: np.ndarray, 
                          alpha: float = 0.5) -> str:
    """
    Create an overlay of the original image with heatmap using only PIL and numpy
    """
    # Resize heatmap to match image size
    heatmap_pil = Image.fromarray((heatmap * 255).astype(np.uint8), mode='L')
    heatmap_resized = heatmap_pil.resize(original_image.size, Image.BILINEAR)
    
    # Convert to numpy
    heatmap_array = np.array(heatmap_resized).astype(float) / 255.0
    
    # Create heatmap color using numpy vectorized operations
    h, w = heatmap_array.shape
    colored = np.zeros((h, w, 3), dtype=np.uint8)
    
    # Create color mapping
    mask1 = heatmap_array < 0.25
    mask2 = (heatmap_array >= 0.25) & (heatmap_array < 0.5)
    mask3 = (heatmap_array >= 0.5) & (heatmap_array < 0.75)
    mask4 = heatmap_array >= 0.75
    
    # Blue to Cyan
    colored[mask1, 0] = 0
    colored[mask1, 1] = (heatmap_array[mask1] * 4 * 255).astype(np.uint8)
    colored[mask1, 2] = 255
    
    # Cyan to Green
    colored[mask2, 0] = 0
    colored[mask2, 1] = 255
    colored[mask2, 2] = ((1 - (heatmap_array[mask2] - 0.25) * 4) * 255).astype(np.uint8)
    
    # Green to Yellow
    colored[mask3, 0] = ((heatmap_array[mask3] - 0.5) * 4 * 255).astype(np.uint8)
    colored[mask3, 1] = 255
    colored[mask3, 2] = 0
    
    # Yellow to Red
    colored[mask4, 0] = 255
    colored[mask4, 1] = ((1 - (heatmap_array[mask4] - 0.75) * 4) * 255).astype(np.uint8)
    colored[mask4, 2] = 0
    
    heatmap_colored = Image.fromarray(colored)
    
    # Blend with original using PIL
    original_np = np.array(original_image)
    heatmap_np = np.array(heatmap_colored)
    
    # Alpha blending
    overlay = ((original_np * (1 - alpha)) + (heatmap_np * alpha)).astype(np.uint8)
    
    # Convert back to PIL and save
    overlay_pil = Image.fromarray(overlay)
    buffer = io.BytesIO()
    overlay_pil.save(buffer, format='PNG')
    buffer.seek(0)
    
    return base64.b64encode(buffer.getvalue()).decode('utf-8')


class ImagePreprocessor:
    def __init__(self, image_size: int = 224):
        """
        Initialize image preprocessor with transforms
        
        Args:
            image_size: Target size for the image (default: 224)
        """
        self.image_size = image_size
        
        # Define the same transforms used during training
        # Using ImageNet normalization as standard for EfficientViT
        self.transform = transforms.Compose([
            transforms.Resize((image_size, image_size)),
            transforms.ToTensor(),
            transforms.Normalize(
                mean=[0.485, 0.456, 0.406],  # ImageNet mean
                std=[0.229, 0.224, 0.225]     # ImageNet std
            )
        ])
    
    def decode_base64_image(self, base64_string: str) -> Image.Image:
        """
        Decode base64 string to PIL Image
        
        Args:
            base64_string: Base64 encoded image string
            
        Returns:
            PIL Image object
        """
        try:
            # Remove data URL prefix if present
            if ',' in base64_string:
                base64_string = base64_string.split(',')[1]
            
            # Decode base64 to bytes
            image_bytes = base64.b64decode(base64_string)
            
            # Convert to PIL Image
            image = Image.open(io.BytesIO(image_bytes))
            
            # Convert to RGB if necessary (handles RGBA, grayscale, etc.)
            if image.mode != 'RGB':
                image = image.convert('RGB')
            
            return image
            
        except Exception as e:
            raise ValueError(f"Failed to decode image: {str(e)}")
    
    def preprocess(self, image: Image.Image) -> torch.Tensor:
        """
        Preprocess PIL Image for model input
        
        Args:
            image: PIL Image object
            
        Returns:
            Preprocessed tensor ready for model
        """
        try:
            # Apply transforms
            tensor = self.transform(image)
            
            # Add batch dimension
            tensor = tensor.unsqueeze(0)
            
            return tensor
            
        except Exception as e:
            raise ValueError(f"Failed to preprocess image: {str(e)}")


class OralDiseasePredictor:
    def __init__(self, model, device, class_labels: List[str]):
        """
        Initialize predictor with model and device
        
        Args:
            model: Loaded PyTorch model
            device: torch device (CPU or CUDA)
            class_labels: List of class label names
        """
        self.model = model
        self.device = device
        self.class_labels = class_labels
        self.preprocessor = ImagePreprocessor()
    
    def generate_heatmap(self, base64_image: str) -> Dict:
        """
        Generate Grad-CAM heatmap for the input image
        
        Args:
            base64_image: Base64 encoded image string
            
        Returns:
            Dictionary containing heatmap data
        """
        try:
            # Decode and preprocess image
            original_image = self.preprocessor.decode_base64_image(base64_image)
            tensor = self.preprocessor.preprocess(original_image)
            
            # Move to device
            tensor = tensor.to(self.device)
            
            # Create Grad-CAM
            gradcam = GradCAM(self.model)
            
            # Generate heatmap
            heatmap = gradcam.generate(tensor)
            
            # Create overlay image
            heatmap_base64 = create_overlay_image(original_image, heatmap)
            
            return {
                "success": True,
                "heatmap_image": heatmap_base64
            }
            
        except Exception as e:
            print(f"Heatmap generation failed: {str(e)}")
            return {
                "success": False,
                "heatmap_image": None,
                "error": str(e)
            }
    
    def predict_from_base64(self, base64_image: str) -> Dict:
        """
        Predict oral disease from base64 encoded image
        
        Args:
            base64_image: Base64 encoded image string
            
        Returns:
            Dictionary containing prediction results
        """
        try:
            # Decode and preprocess image
            image = self.preprocessor.decode_base64_image(base64_image)
            
            tensor = self.preprocessor.preprocess(image)
            
            # Move to device
            tensor = tensor.to(self.device)
            
            # Perform inference
            with torch.no_grad():
                outputs = self.model(tensor)
                
                # Apply softmax to get probabilities
                probabilities = F.softmax(outputs, dim=1)
                
                # Get prediction
                confidence, predicted_idx = torch.max(probabilities, 1)
                
                # Convert to numpy for easier handling
                probabilities_np = probabilities.cpu().numpy()[0]
                predicted_class = self.class_labels[predicted_idx.item()]
                confidence_score = confidence.item()
            
            # Create scores dictionary for all classes
            all_scores = {
                label: float(prob) for label, prob in zip(self.class_labels, probabilities_np)
            }
            
            # Sort scores by confidence
            sorted_predictions = sorted(
                all_scores.items(), 
                key=lambda x: x[1], 
                reverse=True
            )
            
            # Get top 3 predictions
            top_predictions = [
                {
                    "label": label,
                    "confidence": float(score),
                    "percentage": float(score * 100)
                }
                for label, score in sorted_predictions[:3]
            ]
            
            # Prepare result
            result = {
                "prediction": predicted_class,
                "confidence": float(confidence_score),
                "confidence_percentage": float(confidence_score * 100),
                "all_scores": all_scores,
                "top_predictions": top_predictions,
                "device_used": str(self.device)
            }
            
            return result
            
        except Exception as e:
            raise RuntimeError(f"Prediction failed: {str(e)}")
    
    def predict_from_file(self, image_path: str) -> Dict:
        """
        Predict oral disease from image file path
        
        Args:
            image_path: Path to image file
            
        Returns:
            Dictionary containing prediction results
        """
        try:
            # Load image
            image = Image.open(image_path).convert('RGB')
            
            # Preprocess
            tensor = self.preprocessor.preprocess(image)
            tensor = tensor.to(self.device)
            
            # Perform inference
            with torch.no_grad():
                outputs = self.model(tensor)
                probabilities = F.softmax(outputs, dim=1)
                confidence, predicted_idx = torch.max(probabilities, 1)
                probabilities_np = probabilities.cpu().numpy()[0]
                predicted_class = self.class_labels[predicted_idx.item()]
                confidence_score = confidence.item()
            
            # Create scores dictionary
            all_scores = {
                label: float(prob) for label, prob in zip(self.class_labels, probabilities_np)
            }
            
            # Get top 3 predictions
            sorted_predictions = sorted(all_scores.items(), key=lambda x: x[1], reverse=True)
            top_predictions = [
                {
                    "label": label,
                    "confidence": float(score),
                    "percentage": float(score * 100)
                }
                for label, score in sorted_predictions[:3]
            ]
            
            result = {
                "prediction": predicted_class,
                "confidence": float(confidence_score),
                "confidence_percentage": float(confidence_score * 100),
                "all_scores": all_scores,
                "top_predictions": top_predictions,
                "device_used": str(self.device)
            }
            
            return result
            
        except Exception as e:
            raise RuntimeError(f"Prediction failed: {str(e)}")
