# SmartSmile: A Web-Based and Mobile Accessible AI System for Preventive Oral Health Screening Using Smartphone Images

**BSc. in Software Engineering**
**Name: Irenee Gisubizo Dusingizimana**
**Supervisor: Ms. Samiratu Ntohsi**
**African Leadership University (ALU)**
**Date: 2026**

---

> **Note on Page Numbering:**
> Preliminary pages (Declaration through List of Figures) are numbered using lowercase Roman numerals (i, ii, iii, iv, v...).
> Main chapter pages begin at Arabic numeral 1 from Chapter One onward.

---

## TABLE OF CONTENTS

| Section | Page |
|---|---|
| Declaration | i |
| Certification | i |
| Abstract | ii |
| List of Acronyms/Abbreviations | ii |
| Table of Contents | iii |
| List of Tables | iv |
| List of Figures | v |
| **CHAPTER ONE: Introduction** | **1** |
| 1.1 Introduction and Background | 1 |
| 1.2 Problem Statement | 3 |
| 1.3 Project's Main Objective | 5 |
| 1.3.1 List of Specific Objectives | 5 |
| 1.4 Research Questions | 5 |
| 1.5 Project Scope | 6 |
| 1.5.1 Geographic and Population Scope | 6 |
| 1.5.2 Temporal Scope | 6 |
| 1.5.3 Technological Scope | 7 |
| 1.5.4 Methodological Scope | 7 |
| 1.6 Significance and Justification | 7 |
| 1.6.1 Academic and Research Significance | 8 |
| 1.6.2 Technological Significance | 8 |
| 1.6.3 Social and Public Health Significance | 8 |
| 1.7 Research Budget | 9 |
| 1.8 Research Timeline | 9 |
| **CHAPTER TWO: Literature Review** | **10** |
| 2.1 Introduction | 10 |
| 2.2 Historical Background of the Research Topic | 10 |
| 2.3 Overview of Existing Systems | 11 |
| 2.3.1 AI-Based Mobile-Accessible Dental Screening Systems | 11 |
| 2.3.2 Usability-Focused Oral Health Applications | 12 |
| 2.3.3 Prototype and Research Tools | 12 |
| 2.4 Review of Related Work | 13 |
| 2.5 Summary of Reviewed Literature | 14 |
| 2.6 Strengths and Weaknesses of Existing Systems | 14 |
| 2.7 General Comment and Conclusion | 16 |
| **CHAPTER THREE: System Analysis and Design** | **17** |
| 3.1 Introduction | 17 |
| 3.2 Research Design (Including the SDLC Model Used) | 17 |
| 3.2.1 Dataset and Dataset Description | 18 |
| 3.3 Functional and Non-Functional Requirements | 19 |
| 3.4 System Architecture | 21 |
| 3.2.1 Proposed System Architecture Diagram | 22 |
| 3.5 UML Diagrams | 23 |
| 3.6 Development Tools | 27 |
| **CHAPTER FOUR: System Implementation and Testing** | **29** |
| 4.1 Implementation and Coding | 29 |
| 4.1.1 Introduction | 29 |
| 4.1.2 Description of Implementation Tools and Technology | 29 |
| 4.2 Graphical View of the Project | 31 |
| 4.2.1 Screenshots with Description | 31 |
| 4.3 Testing | 35 |
| 4.3.1 Introduction to Testing | 35 |
| 4.3.2 Objective of Testing | 35 |
| 4.3.3 Unit Testing Outputs | 36 |
| 4.3.4 Validation Testing Outputs | 37 |
| 4.3.5 Integration Testing Outputs | 38 |
| 4.3.6 Functional and System Testing Results | 38 |
| 4.3.7 Acceptance Testing Report | 39 |
| **CHAPTER FIVE: Description of Results** | **41** |
| 5.1 Introduction | 41 |
| 5.2 Model Selection and Comparative Analysis | 41 |
| 5.2.1 Full Model Comparison Results | 41 |
| 5.2.2 Top 5 Models Comparison | 43 |
| 5.2.3 Rationale for Selecting EfficientViT-B0 | 43 |
| 5.3 Model Training Results | 44 |
| 5.3.1 Training and Validation Accuracy | 44 |
| 5.3.2 Training and Validation Loss | 44 |
| 5.3.3 Confusion Matrix Analysis | 45 |
| 5.4 System Performance Results | 45 |
| 5.4.1 Response Time Analysis | 45 |
| 5.4.2 System Uptime | 46 |
| 5.4.3 User Acceptance Results | 46 |
| 5.5 Comparison with Related Systems | 47 |
| 5.6 Summary of Results | 47 |
| **CHAPTER SIX: Conclusions and Recommendations** | **49** |
| 6.1 Conclusion | 49 |
| 6.2 Limitations of the Study | 51 |
| 6.3 Recommendations | 52 |
| References | 54 |

---

## LIST OF TABLES

| Table No. | Title | Page |
|---|---|---|
| Table 1.1 | Research Budget | 9 |
| Table 1.2 | Research Timeline (Gantt Chart) | 9 |
| Table 3.1 | Oral Disease Dataset Class Distribution | 18 |
| Table 3.2 | Functional Requirements | 19 |
| Table 3.3 | Non-Functional Requirements | 20 |
| Table 3.4 | Machine Learning and Image Analysis Tools | 27 |
| Table 3.5 | Backend Development Tools | 28 |
| Table 3.6 | Frontend Development Tools | 28 |
| Table 3.7 | Database and Authentication Tools | 28 |
| Table 3.8 | System Design and Documentation Tools | 28 |
| Table 4.1 | EfficientViT-B0 Training Configuration | 29 |
| Table 4.2 | FastAPI Backend Endpoints | 30 |
| Table 4.3 | Validation Testing — Per-Class Performance Metrics | 37 |
| Table 4.4 | Functional Requirements Testing Results | 38 |
| Table 4.5 | System Response Time Under Various Load Conditions | 39 |
| Table 4.6 | User Acceptance Questionnaire Results | 40 |
| Table 5.1 | Full Model Comparison Results (All 29 Architectures) | 41 |
| Table 5.2 | Top 5 Models Comparison | 43 |
| Table 5.3 | EfficientViT-B0 Training Accuracy by Epoch | 44 |
| Table 5.4 | System Response Time Analysis | 45 |
| Table 5.5 | User Satisfaction Metrics | 46 |
| Table 5.6 | Comparison of SmartSmile with Related Systems | 47 |

---

## LIST OF FIGURES

| Figure No. | Title | Page |
|---|---|---|
| Figure 3.1 | SmartSmile Three-Tier System Architecture Diagram | 22 |
| Figure 3.2 | Entity Relationship Diagram (ERD) | 23 |
| Figure 3.3 | Class Diagram | 24 |
| Figure 3.4 | Use Case Diagram | 25 |
| Figure 3.5 | Sequence Diagram — Image Analysis Flow | 26 |
| Figure 3.6 | Sequence Diagram — Authentication Flow | 27 |
| Figure 4.1 | Screenshot — Landing Page | 31 |
| Figure 4.2 | Screenshot — User Registration and Email Verification | 32 |
| Figure 4.3 | Screenshot — User Login Page | 32 |
| Figure 4.4 | Screenshot — User Dashboard | 33 |
| Figure 4.5 | Screenshot — Dental Image Upload (Screening Page) | 33 |
| Figure 4.6 | Screenshot — Analysis Results with Grad-CAM Heatmap | 34 |
| Figure 4.7 | Screenshot — Screening History Page | 34 |
| Figure 4.8 | Screenshot — Profile Settings Page | 35 |
| Figure 4.9 | Screenshot — Education Page | 35 |
| Figure 4.10 | Screenshot — Admin Panel | 35 |
| Figure 5.1 | EfficientViT-B0 Training and Validation Accuracy Curves | 44 |
| Figure 5.2 | EfficientViT-B0 Training and Validation Loss Curves | 44 |
| Figure 5.3 | EfficientViT-B0 Confusion Matrix | 45 |
