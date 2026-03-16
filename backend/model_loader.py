import torch
import torch.nn as nn
from pathlib import Path
import os

# Define the class labels for oral diseases
# Note: The actual number of classes will be detected from the model
CLASS_LABELS = ['calculus', 'caries', 'gingivitis', 'hypodontia', 'mouth_ulcer', 'tooth_discoloration']

class ModelLoader:
    def __init__(self, model_path: str = "best_model/efficientvit_b0_oral_disease_classifier.pth"):
        """
        Initialize the model loader
        
        Args:
            model_path: Path to the trained model file
        """
        self.model_path = Path(model_path)
        self.device = torch.device("cpu")
        self.model = None
        self.class_labels = CLASS_LABELS
        
        print(f"Using device: {self.device}")
        
    def load_model(self):
        """
        Load the trained EfficientViT model
        """
        try:
            # Check if model file exists
            if not self.model_path.exists():
                raise FileNotFoundError(f"Model file not found at {self.model_path}")
            
            print(f"Loading model from {self.model_path}...")
            
            # Load the model state dict
            checkpoint = torch.load(self.model_path, map_location=torch.device('cpu'))
            
            # Try to load the model architecture from checkpoint first
            # The checkpoint should contain the full model or state dict
            if isinstance(checkpoint, nn.Module):
                # Full model saved
                self.model = checkpoint
                print("Loaded full model from checkpoint")
            elif isinstance(checkpoint, dict):
                # Try different checkpoint formats
                if 'model' in checkpoint:
                    self.model = checkpoint['model']
                    print("Loaded model from checkpoint['model']")
                else:
                    # Detect number of classes from checkpoint
                    # Look for the final classifier layer - find the one with smallest output dimension
                    num_classes = len(CLASS_LABELS)
                    min_output_dim = float('inf')
                    detected_layer = None
                    
                    for key in checkpoint.keys():
                        if ('classifier' in key or 'fc' in key) and 'weight' in key:
                            shape = checkpoint[key].shape
                            if len(shape) == 2:  # Linear layer
                                output_dim = shape[0]
                                # The final classification layer typically has the smallest output dimension
                                if output_dim < min_output_dim and output_dim < 1000:  # Reasonable class count
                                    min_output_dim = output_dim
                                    num_classes = output_dim
                                    detected_layer = key
                    
                    if detected_layer:
                        print(f"Detected {num_classes} classes from layer '{detected_layer}'")
                    else:
                        print(f"Could not detect classes from checkpoint, using default: {num_classes}")
                    
                    # Try to create model using timm as fallback
                    try:
                        import timm
                        print("Creating EfficientViT model using timm...")
                        # Create a base model with detected number of classes
                        self.model = timm.create_model('efficientvit_b0', pretrained=False, num_classes=num_classes)
                        print(f"Created EfficientViT-B0 model with {num_classes} classes")
                        
                        # Update class labels if needed
                        if num_classes != len(CLASS_LABELS):
                            print(f"Warning: Model has {num_classes} classes but only {len(CLASS_LABELS)} labels defined")
                            # Pad with generic labels if needed
                            while len(self.class_labels) < num_classes:
                                self.class_labels.append(f"class_{len(self.class_labels)}")
                    except Exception as e:
                        print(f"Could not create model with timm: {e}")
                        raise ImportError("Cannot load model architecture. Checkpoint format not recognized.")
            
            # Load the trained weights
            if isinstance(checkpoint, dict):
                if 'model_state_dict' in checkpoint:
                    self.model.load_state_dict(checkpoint['model_state_dict'])
                elif 'state_dict' in checkpoint:
                    self.model.load_state_dict(checkpoint['state_dict'])
                else:
                    self.model.load_state_dict(checkpoint)
            else:
                self.model = checkpoint
            
            # Move model to device and set to evaluation mode
            self.model = self.model.to(self.device)
            self.model.eval()
            
            print(f"Model loaded successfully on {self.device}")
            print(f"Number of classes: {len(CLASS_LABELS)}")
            print(f"Classes: {CLASS_LABELS}")
            
            return self.model
            
        except Exception as e:
            print(f"Error loading model: {str(e)}")
            raise
    
    def get_model(self):
        """
        Get the loaded model, load it if not already loaded
        """
        if self.model is None:
            self.load_model()
        return self.model
    
    def get_device(self):
        """
        Get the device being used (CPU or CUDA)
        """
        return self.device
    
    def get_class_labels(self):
        """
        Get the list of class labels
        """
        return self.class_labels


# Global model loader instance
_model_loader = None

def get_model_loader():
    """
    Get or create the global model loader instance
    """
    global _model_loader
    if _model_loader is None:
        _model_loader = ModelLoader()
    return _model_loader
