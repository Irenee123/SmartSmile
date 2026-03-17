# 🦷 SmartSmile - Oral Health Analysis System

An AI powered dental image analysis application that uses a trained EfficientViT-B0 deep learning model to 6 detect common oral health conditions from dental photographs.

## 🎯 Features

### Core Features
- **AI-Powered Analysis**: Uses your custom-trained EfficientViT-B0 model
- **6 Condition Detection**:
  - Calculus (Tartar)
  - Caries (Cavities)
  - Gingivitis
  - Hypodontia (Missing Teeth)
  - Mouth Ulcer
  - Tooth Discoloration

### User Management
- **User Authentication**: Secure signup and login with Supabase
- **Email Verification**: Users must verify their email before accessing the dashboard
- **Password Management**: Forgot password and password change functionality
- **Profile Settings**: Update name, phone, and manage account

### Some of Application Pages
- **Home Page**: Landing page with system information
- **Dashboard**: View screening history and recent results
- **Screening**: Upload dental images for AI analysis
- **Results**: Detailed analysis with heatmap visualization
- **History**: View all past screening results
- **Settings**: Account and profile management
- **Education**: Oral health education articles
- **About**: Information about SmartSmile
- **Contact**: Contact form for inquiries
- **Privacy Policy**: Data handling and privacy information
- **Terms of Service**: User terms and conditions
- **Admin Panel**: Admin-only dashboard for platform management


## 📊 Model Performance Results

The EfficientViT-B0 model was selected after comparing 20+ deep learning architectures. Here are the results:

### EfficientViT-B0 Performance Metrics:
| Metric | Score |
|--------|-------|
| **Accuracy** | 91.94% |
| **Precision** | 90.54% |
| **Recall** | 90.72% |
| **F1 Score** | 90.61% |

### Model Comparison (Top 5):
| Model | Accuracy | Precision | Recall | F1 Score |
|-------|----------|-----------|--------|----------|
| InceptionResnetV2 | 92.54% | 91.06% | 91.85% | 91.32% |
| EfficientViT-M2 | 92.37% | 91.74% | 92.02% | 91.74% |
| EfficientViT-M5 | 92.28% | 92.15% | 90.41% | 90.80% |
| EfficientNetB2 | 92.10% | 92.39% | 92.10% | 92.21% |
| **EfficientViT-B0** | **91.94%** | **90.54%** | **90.72%** | **90.61%** |

> **Note**: EfficientViT-B0 was chosen for deployment due to its excellent balance of accuracy and computational efficiency, making it suitable for real-time applications.

### Training Details:
- **Framework**: PyTorch with timm library
- **Image Size**: 224x224 pixels
- **Training Epochs**: 25
- **Optimizer**: AdamW
- **Learning Rate**: 0.001
- **Dataset**: 6-class oral disease classification (6,000+ images)

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.8+
- pip
- Gmail account (for sending emails) or Supabase account

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd SmartSmile
```

2. **Install Python dependencies:**
```bash
cd backend
pip install -r requirements.txt
```

3. **Install Node.js dependencies:**
```bash
npm install
```

4. **Configure Environment Variables:**

Create a `.env.local` file in the root directory:
```env
# Python Backend API URL
PYTHON_API_URL=http://localhost:8000
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Supabase Configuration (get these from your Supabase project)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_JWT_SECRET=your-jwt-secret
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# SMTP Configuration for Custom Emails (Gmail)
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password
EMAIL_FROM_NAME=SmartSmile
EMAIL_FROM_EMAIL=your-email@gmail.com
```

### Running the Application

1. **Start the Python Backend** (Terminal 1):
```bash
cd backend
python app.py
```
Server runs at: http://localhost:8000

2. **Start the Frontend** (Terminal 2):
```bash
npm run dev
```
App runs at: http://localhost:3000

3. **Open Browser**: Go to http://localhost:3000
4. **Sign up** for a new account
5. **Verify** your email by clicking the link in the welcome email
6. **Log in** and start screening!

## 📁 Project Structure

```
├── app/                    # Next.js frontend (App Router)
│   ├── api/               # API routes
│   │   ├── analyze/       # Image analysis endpoint
│   │   ├── auth/          # Authentication endpoints
│   │   └── email/         # Email sending endpoint
│   ├── dashboard/         # User dashboard
│   ├── screening/         # Dental image upload & analysis
│   ├── results/           # Analysis results display
│   ├── history/           # Screening history
│   ├── settings/          # Account settings
│   ├── admin/             # Admin panel
│   ├── education/         # Educational content
│   ├── about/             # About page
│   ├── contact/           # Contact form
│   ├── privacy/           # Privacy policy
│   ├── terms/             # Terms of service
│   ├── login/             # Login page
│   ├── signup/            # Signup page
│   ├── verify/            # Email verification page
│   └── page.tsx           # Home/Landing page
├── backend/               # Python FastAPI backend
│   ├── app.py             # Main server with endpoints
│   ├── model_loader.py    # PyTorch model loading
│   ├── inference.py       # Image prediction logic
│   ├── email_service.py   # Gmail SMTP email service
│   ├── requirements.txt   # Python dependencies
│   └── best_model/        # Trained model files
│       └── efficientvit_b0_oral_disease_classifier.pth
├── components/            # React components
│   └── ui/                # UI component library
├── lib/                   # Utility functions
├── hooks/                 # React hooks
├── best_model/            # Trained model (backup location)
├── notebooks/            # Jupyter notebooks for model training
└── README.md            # This file
```

## 🎥 Video Demo

Watch the SmartSmile system in action:

**[Video Demo Link]**


## 🔧 How It Works

### Authentication Flow
1. User signs up with email and password
2. SmartSmile sends a verification email via Gmail SMTP
3. User clicks the verification link to confirm their email
4. After verification, user can log in and access the dashboard
5. User can update profile, change password, and manage their account

### Screening Flow
1. User logs in and navigates to the Screening page
2. User uploads a dental photograph
3. Image is sent to the Python backend for AI analysis
4. The EfficientViT-B0 model processes the image
5. Results are displayed with:
   - Detected condition
   - Confidence score
   - Risk level (Low/Moderate/High)
   - Professional recommendations
   - Heatmap visualization showing areas of concern
6. Results are saved to user's history

## 🛠️ Technology Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **UI Components**: Custom component library with Tailwind CSS
- **Authentication**: Supabase Auth
- **State Management**: React hooks and context

### Backend
- **Framework**: Python FastAPI
- **AI/ML**: PyTorch, timm library
- **Model**: EfficientViT-B0 (custom trained)
- **Email**: Gmail SMTP with custom templates

### Database & Auth
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth with email/password

## 📄 API Endpoints

### Backend (Python/FastAPI)
- `GET /` - API information
- `GET /health` - Health check
- `POST /predict` - Run inference on dental image
- `POST /email/send-verification` - Send verification email
- `POST /email/send-password-reset` - Send password reset email
- `POST /email/send-password-changed` - Send password changed confirmation

### Frontend (Next.js)
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/verify` - Email verification
- `POST /api/analyze` - Submit image for analysis
- `POST /api/email/send` - Send various email types

## ⚠️ Important Notes

- The trained model file must be in `backend/best_model/` directory
- Ensure both servers (frontend and backend) are running before using the application
- Gmail requires an "App Password" for SMTP - enable 2FA and create an app password
- Users must verify their email before accessing the dashboard (email verification required)

## 🔐 Security Features

- Email confirmation required before login access
- Password reset via email
- Password change notifications
- Secure Supabase authentication with JWT tokens
- Service role key used for admin operations only

## 📄 License

This project is for educational and demonstration purposes.

---
