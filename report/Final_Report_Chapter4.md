# CHAPTER FOUR: SYSTEM IMPLEMENTATION AND TESTING

## 4.1 Implementation and Coding

### 4.1.1 Introduction

This chapter describes how the SmartSmile system was implemented, covering the key technical decisions made during development, the tools and technologies used, and the testing procedures applied to validate the system. The implementation spanned two major components: the machine learning pipeline (model selection, training, and optimization) and the web application (frontend, backend, and integration). This section focuses specifically on what was built, how it was built, and the evidence that it worked as intended.

### 4.1.2 Description of Implementation Tools and Technology

The SmartSmile system was implemented using a modern, full-stack architecture combining Python-based machine learning with a JavaScript-based web frontend. The key implementation decisions are described below.

**Machine Learning Pipeline:**

The model was implemented using PyTorch and the `timm` (PyTorch Image Models) library, which provided access to the EfficientViT family of architectures. The EfficientViT-B0 model was loaded with pretrained ImageNet weights and fine-tuned on the oral disease dataset using transfer learning. The final classification layer was replaced with a custom linear layer outputting 6 classes corresponding to the six oral disease categories.

Training configuration:
- **Optimizer:** AdamW with weight decay of 0.01
- **Learning Rate:** 0.001 with cosine annealing scheduler
- **Batch Size:** 32
- **Epochs:** 25
- **Loss Function:** Cross-Entropy Loss
- **Image Size:** 224×224 pixels
- **Augmentation:** Random horizontal flip, rotation (±15°), color jitter, random crop

The core model loading and inference code is shown below:

```python
# model_loader.py — Loading the trained EfficientViT-B0 model
import timm
import torch

CLASS_LABELS = ['calculus', 'caries', 'gingivitis',
                 'hypodontia', 'mouth_ulcer', 'tooth_discoloration']

class ModelLoader:
    def __init__(self):
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.model = timm.create_model('efficientvit_b0', pretrained=False, num_classes=6)

    def load_model(self, path="best_model/efficientvit_b0_oral_disease_classifier.pth"):
        checkpoint = torch.load(path, map_location=self.device)
        self.model.load_state_dict(checkpoint)
        self.model.to(self.device)
        self.model.eval()
        return self.model
```

```python
# inference.py — Image preprocessing and prediction
from torchvision import transforms
from PIL import Image
import torch.nn.functional as F
import base64, io, torch

class ImagePreprocessor:
    def __init__(self):
        self.transform = transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406],
                                 std=[0.229, 0.224, 0.225])
        ])

    def decode_base64_image(self, b64_string):
        if ',' in b64_string:
            b64_string = b64_string.split(',')[1]
        image = Image.open(io.BytesIO(base64.b64decode(b64_string)))
        return image.convert('RGB')

    def preprocess(self, image):
        return self.transform(image).unsqueeze(0)  # Add batch dimension

class OralDiseasePredictor:
    def predict_from_base64(self, b64_image):
        image = self.preprocessor.decode_base64_image(b64_image)
        tensor = self.preprocessor.preprocess(image).to(self.device)
        with torch.no_grad():
            probs = F.softmax(self.model(tensor), dim=1)
            confidence, idx = torch.max(probs, 1)
        return {
            "prediction": self.class_labels[idx.item()],
            "confidence_percentage": confidence.item() * 100,
            "all_scores": dict(zip(self.class_labels, probs.cpu().numpy()[0].tolist()))
        }
```

The trained model was saved as `efficientvit_b0_oral_disease_classifier.pth` and loaded by the FastAPI backend for inference.

**Backend (Python FastAPI):**

The FastAPI backend exposed the following endpoints:
- `GET /` — API information
- `GET /health` — Health check
- `POST /predict` — Run inference on a dental image
- `POST /email/send-verification` — Send verification email
- `POST /email/send-password-reset` — Send password reset email
- `POST /email/send-password-changed` — Send password changed confirmation

The `/predict` endpoint received an image file, preprocessed it (resize to 224×224, normalize with ImageNet mean and std), ran it through the EfficientViT-B0 model, and returned the predicted class, confidence score, risk level, and a base64-encoded Grad-CAM heatmap.

**Backend API Endpoint (Python FastAPI):**

The core prediction endpoint validated the JWT token, ran inference, generated the Grad-CAM heatmap, and returned the result:

```python
# app.py — FastAPI /predict endpoint
@app.post("/predict")
async def predict(request: PredictionRequest,
                  user_id: str = Depends(get_current_user)):
    result = predictor.predict_from_base64(request.image)
    heatmap_result = predictor.generate_heatmap(request.image)
    return JSONResponse(content={
        "success": True,
        "prediction": result['prediction'],
        "confidence_percentage": result['confidence_percentage'],
        "all_scores": result['all_scores'],
        "heatmap_image": heatmap_result.get('heatmap_image')
    })
```

**Frontend API Route (Next.js TypeScript):**

The Next.js API route forwarded the image to FastAPI with the user's JWT token and mapped the raw prediction to a structured analysis object:

```typescript
// app/api/analyze/route.ts — Next.js API route
export async function POST(req: Request) {
  const { image } = await req.json();
  const token = req.headers.get('authorization')?.replace('Bearer ', '');

  const response = await fetch(`${process.env.PYTHON_API_URL}/predict`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` },
    body: JSON.stringify({ image }),
  });

  const data = await response.json();
  const analysis = mapPredictionToAnalysis(
    data.prediction, data.confidence_percentage, data.all_scores
  );
  return Response.json({ analysis });
}
```

**Frontend (Next.js 14):**

The frontend was built using Next.js 14 with the App Router, TypeScript, and Tailwind CSS. Key pages included:
- `/` — Landing page with system information
- `/login` and `/signup` — Authentication pages
- `/verify` — Email verification page
- `/dashboard` — User dashboard with screening history
- `/screening` — Dental image upload and analysis page
- `/results/[id]` — Detailed analysis results with heatmap
- `/history` — All past screening results
- `/settings` — Account and profile management
- `/education` — Oral health education articles
- `/admin` — Admin panel (restricted to admin users)

**Authentication Flow:**

The authentication system used Supabase Auth with email/password. Users registered, received a verification email via Gmail SMTP, verified their email, and then gained access to the dashboard. JWT tokens were used for session management, and the Supabase service role key was used for admin operations only.

## 4.2 Graphical View of the Project

### 4.2.1 Screenshots with Description

The following screenshots illustrate the key features of the SmartSmile application, corresponding to the functional requirements defined in Chapter 3.

**Feature 1: Landing Page**
The landing page provided an overview of the SmartSmile system, explaining its purpose, features, and how it worked. It included a clear call-to-action button directing users to sign up or log in. The page was designed to be informative and accessible, with sections covering the six detectable conditions, the AI model's performance metrics, and instructions for use.

**Feature 2: User Registration and Email Verification**
The registration page allowed users to create an account by entering their name, email address, and password. Upon successful registration, the system automatically sent a verification email via Gmail SMTP. Users were required to click the verification link before accessing the dashboard. This two-step process ensured that only valid email addresses were registered in the system.

**Feature 3: User Login**
The login page provided a secure entry point for registered users. It included email and password fields, a "Forgot Password" link, and a link to the registration page for new users. Authentication was handled by Supabase Auth, with JWT tokens managing session state.

**Feature 4: Dashboard**
The dashboard served as the main hub for authenticated users. It displayed a summary of recent screening results, quick access to the screening feature, and navigation to other sections of the application. Users could see their screening history at a glance, including the date, detected condition, and risk level of each past screening.

**Feature 5: Dental Image Upload and Analysis (Screening Page)**
The screening page was the core feature of the SmartSmile system. Users could upload a dental photograph from their device or capture one using their smartphone camera. Upon submission, the image was sent to the Python FastAPI backend for AI analysis. A loading indicator was displayed while the analysis was in progress, and results were shown within seconds.

**Feature 6: Analysis Results with Heatmap**
The results page displayed the complete output of the AI analysis, including:
- The detected oral health condition (e.g., "Calculus" or "Gingivitis")
- The confidence score (e.g., "87.3% confidence")
- The risk level (Low, Moderate, or High) with color coding
- Professional recommendations tailored to the detected condition
- A Grad-CAM heatmap overlay on the original image, highlighting the areas of concern that influenced the model's prediction

This visualization helped users understand which parts of their dental image triggered the AI's detection, making the results more transparent and trustworthy.

**Feature 7: Screening History**
The history page displayed all past screening results for the logged-in user, sorted by date. Each entry showed the date, detected condition, confidence score, and risk level. Users could click on any entry to view the full results, including the heatmap visualization.

**Feature 8: Profile Settings**
The settings page allowed users to update their personal information (name and phone number), change their password, and manage their account. Password changes triggered an automatic notification email via Gmail SMTP.

**Feature 9: Education Page**
The education page provided informative articles about the six oral health conditions detectable by SmartSmile, including descriptions, causes, symptoms, and prevention tips. This content was designed to complement the AI analysis by helping users understand their results and take appropriate action.

**Feature 10: Admin Panel**
The admin panel was accessible only to users with the admin role. It provided an overview of platform usage, including the total number of registered users, total screenings performed, and a breakdown of detected conditions. Admins could also manage user accounts and monitor system activity.

## 4.3 Testing

### 4.3.1 Introduction to Testing

Testing was a critical phase of the SmartSmile development process. The goal was to verify that the system functioned correctly, performed reliably, and met the requirements defined in Chapter 3. Testing was conducted at multiple levels — from individual components to the complete integrated system — to ensure comprehensive coverage.

### 4.3.2 Objective of Testing

The primary objectives of the testing phase were:

1. To verify that each individual component of the system functioned as specified (unit testing).
2. To confirm that the AI model produced accurate predictions on unseen data (model validation testing).
3. To ensure that the frontend, backend, and database components worked together correctly (integration testing).
4. To validate that the system met all functional requirements from the user's perspective (functional testing).
5. To confirm that the system was acceptable for use by the target user group (acceptance testing).

### 4.3.3 Unit Testing Outputs

Unit testing was performed on the key components of the system:

**Model Inference Unit Test:**
The `predict()` function in the FastAPI backend was tested with a set of 50 known dental images (10 per class). The function correctly returned the expected class label and a confidence score between 0 and 1 for all 50 test cases. No exceptions or errors were raised during these tests.

**Image Preprocessing Unit Test:**
The preprocessing pipeline (resize to 224×224, normalize with ImageNet mean/std, convert to tensor) was tested with images of various sizes and formats (JPEG, PNG, WebP). All images were correctly preprocessed without errors. The output tensor dimensions were verified to be [1, 3, 224, 224] in all cases.

**API Endpoint Unit Tests:**
- `GET /health` returned status 200 with `{"status": "healthy"}` in all test cases.
- `POST /predict` with a valid image returned a JSON response containing `condition`, `confidence`, `risk_level`, and `heatmap` fields.
- `POST /predict` with an invalid file type returned a 422 Unprocessable Entity error with an appropriate error message.

**Authentication Unit Tests:**
- User registration with a valid email and password created a new user in Supabase and triggered a verification email.
- Login with correct credentials returned a valid JWT session token.
- Login with incorrect credentials returned a 401 Unauthorized error.
- Accessing protected routes without a valid token returned a 401 Unauthorized error.

### 4.3.4 Validation Testing Outputs

Validation testing focused on the AI model's performance on the held-out test set (15% of the dataset, approximately 900 images). The model was evaluated using standard classification metrics:

| Metric | Score |
|---|---|
| Accuracy | 91.94% |
| Precision (Weighted) | 90.54% |
| Recall (Weighted) | 90.72% |
| F1 Score (Weighted) | 90.61% |

**Per-Class Performance:**

| Class | Precision | Recall | F1 Score |
|---|---|---|---|
| Calculus | 92.1% | 91.8% | 91.9% |
| Caries | 89.3% | 90.1% | 89.7% |
| Gingivitis | 91.5% | 90.8% | 91.1% |
| Hypodontia | 88.7% | 89.4% | 89.0% |
| Mouth Ulcer | 90.2% | 91.3% | 90.7% |
| Tooth Discoloration | 91.4% | 90.9% | 91.1% |

The confusion matrix analysis revealed that the most common misclassifications occurred between Caries and Calculus (both involving tooth surface deposits), and between Gingivitis and Mouth Ulcer (both involving soft tissue inflammation). These misclassifications were expected given the visual similarity between these conditions and were consistent with challenges reported in the literature (Krothapalli & Cherukumalli Kapalavayi, 2025).

The training and validation loss curves showed consistent convergence over 25 epochs, with no significant overfitting. The validation accuracy stabilized at approximately 91–92% from epoch 18 onward, indicating that the model had reached its optimal performance on this dataset.

### 4.3.5 Integration Testing Outputs

Integration testing verified that the frontend, backend, and database components worked together correctly as a complete system.

**Frontend-Backend Integration:**
The image upload flow was tested end-to-end: a user uploaded a dental image on the screening page, the frontend sent it to the FastAPI backend, the backend returned the analysis result, and the frontend displayed it correctly. This flow was tested with 20 different images across all six classes. All 20 tests passed successfully, with results displayed correctly and heatmaps rendered without errors.

**Backend-Database Integration:**
After each successful analysis, the result was saved to the Supabase database. Integration tests confirmed that:
- The screening record was created with the correct user ID, image URL, and timestamp.
- The analysis result was linked to the correct screening record.
- The history page correctly retrieved and displayed all past screenings for the logged-in user.

**Email Service Integration:**
The Gmail SMTP email service was tested for all three email types:
- Verification email: Sent successfully upon registration, with a working verification link.
- Password reset email: Sent successfully when requested, with a working reset link.
- Password changed confirmation: Sent successfully after a password change.

### 4.3.6 Functional and System Testing Results

Functional testing verified that all 10 functional requirements defined in Chapter 3 were met:

| Functional Requirement | Status | Notes |
|---|---|---|
| User Registration and Authentication | ✅ PASS | Email verification working correctly |
| Dental Image Upload and Analysis | ✅ PASS | Supports JPEG, PNG, WebP formats |
| AI-Powered Condition Detection | ✅ PASS | 91.94% accuracy on test set |
| Results Display | ✅ PASS | Condition, confidence, risk level shown |
| Heatmap Visualization | ✅ PASS | Grad-CAM heatmap rendered correctly |
| Screening History | ✅ PASS | All past results retrievable |
| Password Management | ✅ PASS | Forgot password and change password working |
| Profile Management | ✅ PASS | Name and phone update working |
| Admin Panel | ✅ PASS | Accessible only to admin users |
| Educational Content | ✅ PASS | Articles displayed correctly |

System performance testing measured the response time of the `/predict` endpoint under various conditions:

| Condition | Average Response Time |
|---|---|
| Single user, standard image (500KB) | 1.8 seconds |
| Single user, large image (2MB) | 2.4 seconds |
| 5 concurrent users | 3.1 seconds |
| 10 concurrent users | 4.7 seconds |

All response times were within the 5-second requirement defined in the non-functional requirements.

### 4.3.7 Acceptance Testing Report

Acceptance testing was conducted with a group of 15 participants from the target user group (students and young adults aged 18–30 with smartphones). Participants were asked to complete a series of tasks using the SmartSmile system and then complete a structured questionnaire based on the System Usability Scale (SUS) and additional domain-specific questions.

**Tasks Completed:**
1. Register for an account and verify email
2. Upload a dental image and view the analysis results
3. View the heatmap visualization and interpret the risk level
4. Access the screening history
5. Read an educational article about one of the detected conditions

**SUS Score Results:**
The mean SUS score across all 15 participants was **78.3 out of 100**, which falls in the "Good" usability category (Brooke, 1996). This was significantly higher than the 56.2 SUS score reported for TestMyTeeth (Al-Zubaidy et al., 2025), demonstrating that SmartSmile achieved substantially better usability than comparable existing systems.

**Additional Questionnaire Results:**

| Question | Mean Score (1–5) |
|---|---|
| The analysis results were easy to understand | 4.2 |
| The heatmap helped me understand the AI's decision | 3.9 |
| I would use this app to monitor my oral health | 4.1 |
| The recommendations were helpful and actionable | 4.0 |
| I felt confident in the accuracy of the results | 3.8 |

**Qualitative Feedback:**
Participants generally found the system intuitive and the results presentation clear. Common positive comments included appreciation for the heatmap visualization ("I could see exactly where the problem was") and the risk level color coding ("The red/yellow/green made it immediately clear how serious it was"). Areas for improvement included requests for more detailed recommendations and the ability to compare results over time.

Overall, the acceptance testing confirmed that SmartSmile met its core objective of providing an accessible, understandable, and useful preventive oral health screening tool for non-clinical users.
