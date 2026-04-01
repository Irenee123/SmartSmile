# SmartSmile — System Diagrams

> All diagrams are written in **Mermaid** syntax.
> To render them: open in VS Code with the "Markdown Preview Mermaid Support" extension, or paste any diagram into https://mermaid.live

---

## Diagram 1 — System Architecture (3-Tier)

```mermaid
graph TD
    subgraph CLIENT["Tier 1 — Presentation Layer"]
        A["User Browser / Smartphone\nNext.js 14 Frontend\nTypeScript + Tailwind CSS"]
    end

    subgraph APP["Tier 2 — Application Layer"]
        B["Next.js API Routes\nAuth · History · Email"]
        C["Python FastAPI Server\nAI Inference · Heatmap\nport 8000"]
        D["EfficientViT-B0 Model\nPyTorch · timm\n.pth file"]
    end

    subgraph DATA["Tier 3 — Data Layer"]
        E["Supabase PostgreSQL\nusers · screenings · analysis_results"]
        F["Supabase Auth\nJWT Sessions"]
    end

    A -->|"HTTPS POST /api/analyze"| B
    A -->|"HTTPS /api/auth/*"| B
    B -->|"HTTP POST /predict + Bearer JWT"| C
    C --> D
    D -->|"prediction + confidence + heatmap"| C
    C -->|"JSON response"| B
    B -->|"INSERT screening result"| E
    B <-->|"verify / manage sessions"| F
    A <-->|"Supabase JS Client"| F
```

---

## Diagram 2 — Entity Relationship Diagram (ERD)

```mermaid
erDiagram
    USERS {
        uuid id PK
        text name
        text email
        text phone
        text role
        boolean email_verified
        timestamp created_at
    }

    SCREENINGS {
        uuid id PK
        uuid user_id FK
        text image_path
        text risk_level
        float confidence_score
        text_array indicators
        text model_version
        boolean is_deleted
        timestamp created_at
    }

    ANALYSIS_RESULTS {
        uuid id PK
        uuid screening_id FK
        text overall_condition
        float confidence_score
        jsonb findings
        text_array recommendations
        text summary
        text heatmap_image
        text primary_prediction
        jsonb all_scores
        timestamp created_at
    }

    USERS ||--o{ SCREENINGS : "performs"
    SCREENINGS ||--|| ANALYSIS_RESULTS : "produces"
```

---

## Diagram 3 — Class Diagram

```mermaid
classDiagram
    class User {
        +uuid id
        +string name
        +string email
        +string phone
        +string role
        +boolean emailVerified
        +register()
        +login()
        +updateProfile()
        +changePassword()
    }

    class ModelLoader {
        +string modelPath
        +device device
        +list classLabels
        +loadModel()
        +getModel()
        +getDevice()
        +getClassLabels()
    }

    class ImagePreprocessor {
        +int imageSize
        +transforms transform
        +decodeBase64Image(base64) Image
        +preprocess(image) Tensor
    }

    class GradCAM {
        +model model
        +string targetLayerName
        +Tensor gradients
        +Tensor activations
        +findTargetLayer()
        +registerHooks(layer)
        +generate(tensor, targetClass) ndarray
        -generateGradCAM(tensor, targetClass) ndarray
        -generateImageAttention(tensor) ndarray
    }

    class OralDiseasePredictor {
        +model model
        +device device
        +list classLabels
        +ImagePreprocessor preprocessor
        +predictFromBase64(base64) dict
        +generateHeatmap(base64) dict
        +predictFromFile(path) dict
    }

    class AnalysisResult {
        +string overallCondition
        +float confidenceScore
        +list findings
        +list recommendations
        +string summary
        +string heatmapImage
        +string primaryPrediction
        +dict allScores
        +save()
        +getHistory()
    }

    class PreventiveFeedback {
        +dict conditionInfo
        +mapPredictionToAnalysis(prediction, confidence, scores) AnalysisResult
        +getRiskLevel(severity, confidence) string
        +generateRecommendations(condition) list
    }

    class EmailService {
        +string smtpUsername
        +string smtpPassword
        +sendWelcomeEmail(email, name)
        +sendVerificationEmail(email, name, link)
        +sendPasswordResetEmail(email, name, link)
        +sendPasswordChangedEmail(email, name)
        +sendScreeningResultEmail(email, name, data)
    }

    ModelLoader --> OralDiseasePredictor : provides model
    ImagePreprocessor --> OralDiseasePredictor : used by
    GradCAM --> OralDiseasePredictor : used by
    OralDiseasePredictor --> AnalysisResult : produces
    PreventiveFeedback --> AnalysisResult : maps to
    User "1" --> "0..*" AnalysisResult : owns
    EmailService --> User : notifies
```

---

## Diagram 4 — Use Case Diagram

```mermaid
graph LR
    U(["Regular User"])
    A(["Admin"])

    subgraph SYSTEM["SmartSmile System"]
        UC1["Register Account"]
        UC2["Verify Email"]
        UC3["Login"]
        UC4["Upload Dental Image"]
        UC5["View AI Analysis Results"]
        UC6["View Heatmap Visualization"]
        UC7["View Screening History"]
        UC8["Update Profile Settings"]
        UC9["Change Password"]
        UC10["Access Education Content"]
        UC11["Forgot Password"]
        UC12["View All Users"]
        UC13["Monitor Platform Usage"]
        UC14["Manage Maintenance Mode"]
    end

    U --> UC1
    U --> UC2
    U --> UC3
    U --> UC4
    U --> UC5
    U --> UC6
    U --> UC7
    U --> UC8
    U --> UC9
    U --> UC10
    U --> UC11

    A --> UC3
    A --> UC12
    A --> UC13
    A --> UC14
    A --> UC7
```

---

## Diagram 5 — Sequence Diagram (Image Analysis Flow)

```mermaid
sequenceDiagram
    actor User
    participant Browser as Next.js Frontend
    participant NextAPI as Next.js API Route /api/analyze
    participant FastAPI as Python FastAPI /predict
    participant Model as EfficientViT-B0 Model
    participant GradCAM as GradCAM Heatmap Generator
    participant DB as Supabase PostgreSQL

    User->>Browser: Upload dental image
    Browser->>Browser: Convert image to Base64
    Browser->>Browser: Get JWT token from Supabase session
    Browser->>NextAPI: POST /api/analyze {image, Authorization: Bearer JWT}
    NextAPI->>FastAPI: POST /predict {image, Authorization: Bearer JWT}
    FastAPI->>FastAPI: Validate JWT token
    FastAPI->>FastAPI: Decode Base64 to PIL Image
    FastAPI->>FastAPI: Resize 224x224, Normalize ImageNet stats
    FastAPI->>Model: Forward pass tensor [1,3,224,224]
    Model-->>FastAPI: Logits [1,6]
    FastAPI->>FastAPI: Softmax → probabilities, argmax → class + confidence
    FastAPI->>GradCAM: generate(tensor, target_class)
    GradCAM->>Model: Forward + Backward pass for gradients
    GradCAM-->>FastAPI: heatmap ndarray
    FastAPI->>FastAPI: Overlay heatmap on original image → Base64
    FastAPI-->>NextAPI: {prediction, confidence, all_scores, heatmap_image}
    NextAPI->>NextAPI: mapPredictionToAnalysis()
    NextAPI->>DB: INSERT INTO screenings (user_id, risk_level, confidence_score, indicators)
    NextAPI-->>Browser: {analysis: {overallCondition, findings, recommendations, heatmapImage}}
    Browser->>Browser: Store in sessionStorage
    Browser->>User: Redirect to /results page
```

---

## Diagram 6 — Authentication Flow Sequence

```mermaid
sequenceDiagram
    actor User
    participant Browser as Next.js Frontend
    participant NextAPI as Next.js API Routes
    participant Supabase as Supabase Auth
    participant FastAPI as Python FastAPI
    participant Email as Gmail SMTP

    User->>Browser: Fill signup form (name, email, password)
    Browser->>NextAPI: POST /api/auth/signup
    NextAPI->>Supabase: createUser(email, password)
    Supabase-->>NextAPI: {user: {id, email}}
    NextAPI->>FastAPI: POST /email/send-verification {email, name, link}
    FastAPI->>Email: Send via SMTP
    Email-->>User: Verification email with link
    NextAPI-->>Browser: {success: true}
    Browser->>User: Show "Check your email" message

    User->>Browser: Click verification link
    Browser->>NextAPI: POST /api/auth/verify {token}
    NextAPI->>Supabase: verifyOtp(token)
    Supabase-->>NextAPI: {session: {access_token, user}}
    NextAPI-->>Browser: Redirect to /dashboard

    User->>Browser: Login (email, password)
    Browser->>Supabase: signInWithPassword(email, password)
    Supabase-->>Browser: {session: {access_token, refresh_token}}
    Browser->>User: Redirect to /dashboard
```
