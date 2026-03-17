# Training Presentation Script: Deep Learning for Oral Disease Classification

## Slide 1: Introduction to Oral Disease Classification
- **Problem**: Classify oral diseases (caries, calculus, etc.) from dental images
- **Dataset**: Oral_Dataset folder with labeled images
- **Approach**: Deep learning CNN/Vision Transformer models

---

## Slide 2: Training Pipeline Overview

### 2.1 Data Preparation
- **Data Loading**: Load images from Oral_Dataset/ directory
- **Preprocessing**:
  - Resize images to consistent dimensions (e.g., 224x224)
  - Normalize pixel values using ImageNet statistics
  - Data augmentation: rotation, flip, brightness adjustment
- **Split**: Training (70%), Validation (15%), Test (15%)

### 2.2 Model Architecture
- Base models: EfficientViT, InceptionResNetV2, DEIT Transformer
- Transfer learning from ImageNet pre-trained weights
- Custom classification head for oral disease classes

---

## Slide 3: Loss Function & Optimization

### 3.1 Loss Function
- **Cross-Entropy Loss**: Standard for multi-class classification
```
Loss = -Σ y_true * log(y_pred)
```
- For imbalanced datasets: Weighted Cross-Entropy or Focal Loss

### 3.2 Optimization Algorithms
1. **SGD (Stochastic Gradient Descent)**
   - Classic, momentum helps escape local minima
   - `momentum=0.9` commonly used

2. **Adam (Adaptive Moment Estimation)**
   - Combines momentum with RMSprop
   - Adaptive learning rates per parameter
   - Default: `lr=0.001`, `beta1=0.9`, `beta2=0.999`

3. **AdamW** (Recommended)
   - Adam with proper weight decay
   - Better regularization than Adam

---

## Slide 4: Learning Rate Scheduling

### 4.1 Why Learning Rate Matters
- Too high: Training diverges, loss explodes
- Too slow: Training takes forever
- Optimal: Fast convergence without oscillation

### 4.2 Scheduling Strategies
1. **Step Decay**: Reduce LR by factor every N epochs
2. **Cosine Annealing**: Smooth decay following cosine curve
3. **ReduceLROnPlateau**: Reduce when validation loss plateaus
4. **Warmup**: Start with small LR, gradually increase

```python
# Example: Cosine Annealing with Warmup
scheduler = CosineAnnealingWarmRestarts(optimizer, T_0=10, T_mult=2)
```

---

## Slide 5: Regularization Techniques

### 5.1 Preventing Overfitting
- **Dropout**: Randomly deactivate neurons during training
  - Typical: `dropout=0.3-0.5`
- **Weight Decay (L2)**: Penalize large weights
  - Typical: `weight_decay=1e-4`
- **Early Stopping**: Stop when validation loss increases
- **Batch Normalization**: Stabilize training

### 5.2 Data Augmentation (Regularization)
- Random horizontal flip
- Random rotation (±15 degrees)
- Color jittering (brightness, contrast)
- Random cropping
- Mixup/CutMix advanced techniques

---

## Slide 6: Training Loop Best Practices

### 6.1 Batch Training
- **Batch Size**: 16-64 (depending on GPU memory)
- Larger batches = faster but may hurt generalization
- Gradient accumulation for effective larger batches

### 6.2 Epoch Training
```python
for epoch in range(num_epochs):
    # Training phase
    model.train()
    for batch in train_loader:
        optimizer.zero_grad()
        outputs = model(batch.images)
        loss = criterion(outputs, batch.labels)
        loss.backward()
        optimizer.step()
    
    # Validation phase
    model.eval()
    with torch.no_grad():
        val_loss = evaluate(model, val_loader)
```

### 6.3 Monitoring
- Track: Training loss, validation loss, accuracy
- Save best model based on validation accuracy
- Use tensorboard for visualization

---

## Slide 7: Optimization for Training Speed

### 7.1 Hardware Optimization
- **GPU Acceleration**: Use CUDA/cuDNN
- **Mixed Precision Training**: FP16 for faster training
  ```python
  scaler = torch.cuda.amp.GradScaler()
  with torch.cuda.amp.autocast():
      outputs = model(images)
  ```

### 7.2 Data Loading Optimization
- **DataLoader workers**: Multiple CPU threads
- **Pin memory**: Faster GPU transfer
```python
DataLoader(dataset, num_workers=4, pin_memory=True)
```

### 7.3 Model Optimization
- **Gradient Checkpointing**: Trade compute for memory
- **Mobile/Compact models**: For deployment

---

## Slide 8: Advanced Optimization Techniques

### 8.1 Learning Rate Finder
- Automatically find optimal learning rate
- Use libraries like `torch-lr-finder`

### 8.2 Gradient Clipping
- Prevent exploding gradients
```python
torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)
```

### 8.3 Ensemble Methods
- Combine multiple models
- Knowledge distillation from larger models

### 8.4 Progressive Resizing
- Train on smaller images first, then larger
- Speeds up initial training

---

## Slide 9: Hyperparameter Tuning

### Key Hyperparameters
| Parameter | Typical Range |
|-----------|---------------|
| Learning Rate | 1e-4 to 1e-2 |
| Batch Size | 16 to 64 |
| Epochs | 20 to 100 |
| Dropout | 0.2 to 0.5 |
| Weight Decay | 1e-5 to 1e-3 |

### Tuning Strategies
1. **Grid Search**: Exhaustive but slow
2. **Random Search**: Often better efficiency
3. **Bayesian Optimization**: Smart search

---

## Slide 10: Evaluation Metrics

### Metrics to Report
- **Accuracy**: Overall correctness
- **Precision/Recall**: Per-class performance
- **F1-Score**: Harmonic mean of precision/recall
- **Confusion Matrix**: Class-wise breakdown
- **ROC-AUC**: For imbalanced datasets

---

## Slide 11: Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| Overfitting | More data, augmentation, dropout |
| Underfitting | Increase model capacity, train longer |
| Exploding gradients | Gradient clipping, lower LR |
| Vanishing gradients | BatchNorm, skip connections |
| Slow training | Mixed precision, DataLoader workers |
| GPU OOM | Reduce batch size, gradient accumulation |

---

## Slide 12: Summary - Key Takeaways

1. **Start Simple**: Baseline model first, then optimize
2. **Data is Key**: Quality data + augmentation > fancy models
3. **Learning Rate**: Most important hyperparameter
4. **Regularization**: Dropout, weight decay, early stopping
5. **Monitoring**: Track metrics, save best model
6. **Optimization**: Use AdamW, mixed precision, efficient data loading
7. **Transfer Learning**: Leverage pre-trained ImageNet models

---

## Recommended Training Configuration

```python
# Optimized settings for oral disease classification
config = {
    'model': 'efficientvit_b0',  # or 'deit_small'
    'optimizer': 'AdamW',
    'learning_rate': 1e-4,
    'weight_decay': 1e-4,
    'batch_size': 32,
    'epochs': 50,
    'scheduler': 'CosineAnnealingWarmRestarts',
    'augmentation': True,
    'dropout': 0.3,
    'early_stopping_patience': 10,
    'mixed_precision': True,
}
```

---

## References
- PyTorch Documentation
- "Deep Learning for Computer Vision" - Fast.ai
- "Vision Transformers for Oral Disease Classification" papers
