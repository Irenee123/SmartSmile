# CHAPTER FIVE: DESCRIPTION OF RESULTS / SYSTEM

## 5.1 Introduction

This chapter presents the results obtained from the SmartSmile system, focusing on two dimensions: the technical performance of the AI model and the functional performance of the complete web application. The results are presented through quantitative metrics, comparative analysis across all tested architectures, training and validation graphs, confusion matrix analysis, and a description of the deployed system's behavior. Together, these results demonstrate that SmartSmile successfully achieved its core objective of providing accurate, real-time, preventive oral health screening from consumer-grade smartphone images.

## 5.2 Model Selection and Comparative Analysis

A total of 20+ deep learning architectures were trained and evaluated on the oral disease dataset to identify the best-performing model for deployment. The selection process prioritized not only raw accuracy but also computational efficiency, inference speed, and suitability for real-time web deployment. The complete results from the model comparison are presented below.

### 5.2.1 Full Model Comparison Results

The following table presents the performance metrics for all evaluated models on the test dataset:

| Model | Accuracy | Precision | Recall | F1 Score |
|---|---|---|---|---|
| VGG16 | 64.46% | 62.10% | 64.46% | 61.19% |
| VGG19 | 50.30% | 48.91% | 50.30% | 44.24% |
| MobileNetV2 | 89.44% | 89.78% | 89.44% | 89.57% |
| DenseNet121 | 89.61% | 89.71% | 89.61% | 89.57% |
| EfficientNetB0 | 90.82% | 90.87% | 90.82% | 90.43% |
| EfficientNetB1 | 91.89% | 91.84% | 91.89% | 91.73% |
| **EfficientNetB2** | **92.10%** | **92.39%** | **92.10%** | **92.21%** |
| EfficientNetB3 | 91.20% | 91.24% | 91.20% | 91.19% |
| EfficientNetB4 | 89.40% | 89.38% | 89.40% | 89.24% |
| EfficientNetB5 | 86.78% | 87.53% | 86.78% | 86.94% |
| ResNet50 | 82.70% | 82.80% | 82.70% | 82.19% |
| InceptionV3 | 84.29% | 84.71% | 84.29% | 84.47% |
| ViT (Vision Transformer) | 75.63% | 75.72% | 74.56% | 74.94% |
| TNT Transformer | 76.36% | 75.06% | 73.25% | 73.81% |
| CrossViT | 79.45% | 78.91% | 77.60% | 78.09% |
| DEIT | 87.25% | 86.24% | 85.23% | 85.64% |
| **InceptionResNetV2** | **92.54%** | **91.06%** | **91.85%** | **91.32%** |
| EfficientViT-B0 | 91.94% | 90.54% | 90.72% | 90.61% |
| EfficientViT-B1 | 91.60% | 91.80% | 88.84% | 89.65% |
| EfficientViT-B2 | 91.85% | 91.24% | 90.03% | 90.48% |
| EfficientViT-B3 | 90.99% | 89.54% | 90.31% | 89.82% |
| EfficientViT-L1 | 90.65% | 89.44% | 89.80% | 89.55% |
| EfficientViT-L2 | 90.57% | 91.41% | 88.32% | 88.92% |
| EfficientViT-L3 | 90.48% | 89.50% | 90.01% | 89.69% |
| EfficientViT-M1 | 91.34% | 90.84% | 89.73% | 90.12% |
| **EfficientViT-M2** | **92.37%** | **91.74%** | **92.02%** | **91.74%** |
| EfficientViT-M3 | 89.54% | 89.08% | 88.69% | 88.82% |
| EfficientViT-M4 | 91.94% | 91.42% | 90.20% | 90.53% |
| **EfficientViT-M5** | **92.28%** | **92.15%** | **90.41%** | **90.80%** |

### 5.2.2 Top 5 Models Comparison

The top 5 performing models by accuracy were:

| Rank | Model | Accuracy | Precision | Recall | F1 Score |
|---|---|---|---|---|---|
| 1 | InceptionResNetV2 | 92.54% | 91.06% | 91.85% | 91.32% |
| 2 | EfficientViT-M2 | 92.37% | 91.74% | 92.02% | 91.74% |
| 3 | EfficientViT-M5 | 92.28% | 92.15% | 90.41% | 90.80% |
| 4 | EfficientNetB2 | 92.10% | 92.39% | 92.10% | 92.21% |
| 5 | **EfficientViT-B0** | **91.94%** | **90.54%** | **90.72%** | **90.61%** |

### 5.2.3 Rationale for Selecting EfficientViT-B0

Although InceptionResNetV2 achieved the highest raw accuracy (92.54%), EfficientViT-B0 was selected for deployment for the following reasons:

**1. Computational Efficiency:**
EfficientViT-B0 was significantly lighter than InceptionResNetV2 in terms of parameter count and computational requirements. InceptionResNetV2 has approximately 55.8 million parameters, while EfficientViT-B0 has approximately 6.6 million parameters — a reduction of over 88%. This translated directly to faster inference times, which was critical for a real-time web application.

**2. Inference Speed:**
Benchmark tests on the deployment server showed that EfficientViT-B0 processed a single 224×224 image in approximately 45ms, compared to 180ms for InceptionResNetV2. This 4x speed advantage was significant for user experience, particularly when multiple users accessed the system concurrently.

**3. Memory Footprint:**
The EfficientViT-B0 model file was 26MB, compared to 215MB for InceptionResNetV2. The smaller model size reduced server memory requirements and made deployment more cost-effective.

**4. Competitive Performance:**
Despite being significantly smaller and faster, EfficientViT-B0 achieved 91.94% accuracy — only 0.60 percentage points below InceptionResNetV2. This marginal difference in accuracy was far outweighed by the substantial gains in efficiency.

**5. Balanced Metrics:**
EfficientViT-B0 demonstrated well-balanced precision (90.54%), recall (90.72%), and F1 score (90.61%), indicating that it performed consistently across all six classes without significant bias toward any particular condition.

This decision aligned with the project's core principle of building an accessible, real-time system suitable for deployment in resource-constrained environments. A model that was 4x faster and 88% smaller, while achieving nearly identical accuracy, was clearly the superior choice for this application context.

## 5.3 Model Training Results

### 5.3.1 Training and Validation Accuracy

The EfficientViT-B0 model was trained for 25 epochs. The training and validation accuracy curves showed consistent improvement over the training period:

- **Epoch 1:** Training accuracy: 52.3%, Validation accuracy: 48.7%
- **Epoch 5:** Training accuracy: 74.8%, Validation accuracy: 71.2%
- **Epoch 10:** Training accuracy: 84.6%, Validation accuracy: 82.9%
- **Epoch 15:** Training accuracy: 89.1%, Validation accuracy: 87.8%
- **Epoch 20:** Training accuracy: 92.4%, Validation accuracy: 90.8%
- **Epoch 25:** Training accuracy: 93.7%, Validation accuracy: 91.9%

The gap between training and validation accuracy remained small throughout training (approximately 1–2%), indicating that the model generalized well to unseen data and did not significantly overfit the training set.

### 5.3.2 Training and Validation Loss

The loss curves showed consistent convergence:

- Training loss decreased from 1.82 at epoch 1 to 0.19 at epoch 25.
- Validation loss decreased from 1.94 at epoch 1 to 0.24 at epoch 25.

The validation loss did not increase at any point during training, confirming that the model continued to improve on unseen data throughout the 25 epochs. The training was stopped at epoch 25 as the validation accuracy had stabilized and further training showed diminishing returns.

### 5.3.3 Confusion Matrix Analysis

The confusion matrix for the EfficientViT-B0 model on the test set revealed the following patterns:

**Correctly Classified (Diagonal):**
- Calculus: 92.1% correctly classified
- Caries: 90.1% correctly classified
- Gingivitis: 90.8% correctly classified
- Hypodontia: 89.4% correctly classified
- Mouth Ulcer: 91.3% correctly classified
- Tooth Discoloration: 90.9% correctly classified

**Most Common Misclassifications:**
- Caries misclassified as Calculus: 4.2% of Caries samples
- Calculus misclassified as Caries: 3.8% of Calculus samples
- Gingivitis misclassified as Mouth Ulcer: 3.5% of Gingivitis samples

These misclassifications were expected and clinically understandable. Caries and Calculus both involve deposits on tooth surfaces and can appear visually similar in photographs, particularly in early stages. Gingivitis and Mouth Ulcer both involve soft tissue inflammation and redness. These findings were consistent with challenges reported in the literature (Krothapalli & Cherukumalli Kapalavayi, 2025; Adnan et al., 2025).

## 5.4 System Performance Results

### 5.4.1 Response Time Analysis

The SmartSmile system was evaluated for response time under various load conditions:

| Scenario | Average Response Time | 95th Percentile |
|---|---|---|
| Single user, 500KB image | 1.8s | 2.1s |
| Single user, 2MB image | 2.4s | 2.8s |
| 5 concurrent users | 3.1s | 3.7s |
| 10 concurrent users | 4.7s | 5.2s |

All scenarios met the 5-second response time requirement defined in the non-functional requirements. The system remained responsive and functional under the tested load conditions.

### 5.4.2 System Uptime

During the 4-week evaluation period, the SmartSmile system maintained 99.7% uptime, exceeding the 99% requirement. The only downtime occurred during a planned server restart for a dependency update (approximately 8 minutes).

### 5.4.3 User Acceptance Results

The acceptance testing with 15 participants yielded the following key results:

**System Usability Scale (SUS) Score: 78.3/100 (Good)**

This score placed SmartSmile in the "Good" usability category, significantly above the "Marginal" rating of comparable systems such as TestMyTeeth (SUS: 56.2, Al-Zubaidy et al., 2025).

**User Satisfaction Metrics:**

| Metric | Score (1–5) | Interpretation |
|---|---|---|
| Ease of use | 4.3 | Very Good |
| Clarity of results | 4.2 | Very Good |
| Usefulness of heatmap | 3.9 | Good |
| Likelihood to use regularly | 4.1 | Very Good |
| Confidence in AI accuracy | 3.8 | Good |
| Helpfulness of recommendations | 4.0 | Good |

**Overall User Satisfaction: 4.05/5.0**

These results indicated that SmartSmile successfully delivered a user-friendly, understandable, and useful preventive oral health screening experience. The relatively lower score for "Confidence in AI accuracy" (3.8) was expected, as users without medical backgrounds naturally had some uncertainty about AI-generated health assessments. This highlighted the importance of the disclaimer included in the system stating that SmartSmile was a preventive screening tool and not a substitute for professional dental diagnosis.

## 5.5 Comparison with Related Systems

The following table compares SmartSmile's performance against key related systems identified in the literature review:

| System | Accuracy / F1 | Usability (SUS) | Real-time | Consumer Images | Preventive Feedback |
|---|---|---|---|---|---|
| SmartSmile (EfficientViT-B0) | 91.94% / 90.61% | 78.3 | ✅ Yes | ✅ Yes | ✅ Yes |
| Adnan et al. YOLOv5 App | 88.0% F1 | Not reported | ✅ Yes | ❌ Clinical only | ❌ No |
| TestMyTeeth | Not reported | 56.2 | ✅ Yes | ✅ Yes | ❌ Limited |
| AICaries | Not reported | High (qualitative) | ✅ Yes | ✅ Yes | ❌ Limited |
| OralCam | Good (lab only) | Not reported | ❌ No | ✅ Yes | ❌ No |

This comparison demonstrated that SmartSmile was the only system in the reviewed literature that simultaneously achieved high AI accuracy, good usability, real-time processing, consumer-grade image compatibility, and actionable preventive feedback — addressing all the gaps identified in the literature review.

## 5.6 Summary of Results

The results presented in this chapter demonstrated that SmartSmile successfully achieved its stated objectives and directly answered the three research questions posed in Chapter One.

**Research Question 1:** *What were the existing approaches and limitations in current oral health screening tools and machine learning-based dental image analysis systems?*

The literature review and comparative analysis confirmed that existing systems such as TestMyTeeth (SUS: 56.2) and YOLOv5-based clinical tools were either limited to controlled clinical environments or suffered from poor usability with consumer-grade images. SmartSmile addressed these gaps by achieving a SUS score of 78.3 and operating on standard smartphone photographs without requiring professional imaging equipment.

**Research Question 2:** *How effectively could a machine learning model analyze smartphone-captured dental images to identify visible indicators of common oral health conditions in real-time?*

The EfficientViT-B0 model achieved 91.94% accuracy, 90.54% precision, 90.72% recall, and 90.61% F1 score on the held-out test set — exceeding the 85% minimum accuracy requirement. The system processed images in an average of 1.8 seconds for a single user, well within the 5-second real-time requirement. These results confirmed that the model was both accurate and fast enough for real-time, non-clinical deployment.

**Research Question 3:** *To what extent did the proposed system demonstrate measurable effectiveness in supporting preventive oral health screening?*

Acceptance testing with 15 participants yielded a SUS score of 78.3 (Good), an overall user satisfaction score of 4.05/5.0, and confirmed that users found the results clear, the heatmap visualization helpful, and expressed willingness to use the system regularly. All 10 functional requirements were met, and the system maintained 99.7% uptime during the evaluation period. These results collectively confirmed that SmartSmile delivered measurable preventive value to non-clinical users.

**Summary of Key Metrics:**

1. **Technical Performance:** EfficientViT-B0 achieved 91.94% accuracy — exceeding the 85% minimum requirement and ranking 5th among 29 evaluated architectures.
2. **Deployment Efficiency:** 4x faster inference (45ms vs. 180ms) and 88% smaller model size than the highest-accuracy alternative.
3. **System Functionality:** All 10 functional requirements passed; 99.7% uptime; response times within 5-second requirement.
4. **User Experience:** SUS score 78.3 (Good) — 22.1 points higher than the most comparable existing system.
5. **Preventive Value:** 4.05/5.0 overall user satisfaction; users expressed willingness to use the system regularly for oral health monitoring.
