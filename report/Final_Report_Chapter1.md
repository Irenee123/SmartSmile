# SmartSmile: A Web-Based and Mobile Accessible AI System for Preventive Oral Health Screening Using Smartphone Images

**BSc. in Software Engineering**
**Name: Irenee Gisubizo Dusingizimana**
**Supervisor: Ms. Samiratu Ntohsi**
**African Leadership University (ALU)**
**Date: 2026**

---

## DECLARATION

This Final Project Report is my original work, unless stated, and all external sources have been referenced or cited in my document. This work has not been presented for award of degree or for any similar purpose in any other university.

Signature: ………………………… Date: …………………………..
**Irenee Gisubizo Dusingizimana**

---

## CERTIFICATION

The undersigned certifies that she has read and hereby recommended for acceptance by African Leadership University a report entitled **"SmartSmile: A Web-Based and Mobile Accessible AI System for Preventive Oral Health Screening Using Smartphone Images"**

Signature: ……………………… Date: ………………………….
**Ms. Samiratu Ntohsi**
Faculty, Bachelor of Software Engineering, ALU

---

## ABSTRACT

Oral diseases remain among the most prevalent health conditions globally, affecting billions of people and contributing significantly to morbidity, particularly in low- and middle-income countries. Despite advances in dental technology, most individuals seek care only after symptoms become severe, resulting in costly and often preventable outcomes. This project designed, developed, and evaluated SmartSmile — a web-based, mobile-accessible AI system for preventive oral health screening using smartphone-captured dental images. The main objective was to build a machine learning-based system capable of analyzing consumer-grade dental photographs in real time and providing users with preventive feedback to encourage early professional consultation. An Agile-Iterative Software Development Life Cycle was adopted, combining transfer learning on a dataset of over 6,000 labeled dental images with full-stack web development using Next.js 14, Python FastAPI, and Supabase. Over 20 deep learning architectures were trained and evaluated; EfficientViT-B0 was selected for deployment after achieving an accuracy of 91.94%, precision of 90.54%, recall of 90.72%, and an F1 score of 90.61% across six oral disease classes: calculus, caries, gingivitis, hypodontia, mouth ulcer, and tooth discoloration. The deployed system met all 10 functional requirements, maintained 99.7% uptime, and achieved a System Usability Scale score of 78.3 (Good) — significantly higher than comparable existing tools. The findings confirmed that lightweight vision transformer architectures can deliver clinically meaningful accuracy while remaining efficient enough for real-time web deployment. It is recommended that future work focus on clinical validation against licensed dentist diagnoses, expansion of the training dataset to improve demographic diversity, and integration with teledentistry platforms to create a seamless pathway from AI screening to professional care.

**Keywords:** *Machine Learning, EfficientViT, Oral Health Screening, Deep Learning, Preventive Healthcare, Smartphone Imaging*

---

## LIST OF ACRONYMS/ABBREVIATIONS

| Abbreviation | Full Form |
|---|---|
| AI | Artificial Intelligence |
| ALU | African Leadership University |
| API | Application Programming Interface |
| BSc. | Bachelor of Science |
| CNN | Convolutional Neural Network |
| ERD | Entity Relationship Diagram |
| F1-score | Harmonic mean of Precision and Recall |
| GBD | Global Burden of Disease |
| IHME | Institute for Health Metrics and Evaluation |
| JWT | JSON Web Token |
| mHealth | Mobile Health |
| ML | Machine Learning |
| RGB | Red, Green, Blue (image color model) |
| SDLC | Software Development Life Cycle |
| SMTP | Simple Mail Transfer Protocol |
| SUS | System Usability Scale |
| UML | Unified Modeling Language |
| WHO | World Health Organization |
| YOLO | You Only Look Once |

---

# CHAPTER ONE: INTRODUCTION

## 1.1 Introduction and Background

Oral diseases were among the most intractable and prevalent issues in global health, affecting billions of people and contributing significantly to morbidity worldwide. The World Health Organization estimated that over a quarter of the world's population had untreated dental caries, and approximately 1 billion people worldwide suffered from severe periodontitis (World Health Organization, 2024). As of 2021, approximately 3.69 billion individuals were projected to have experienced at least one form of oral disorder, including untreated caries and gum disease, demonstrating that the burden of oral health problems remained persistently high across various locations and age groups (GBD Oral Conditions Report, 2025). These statistics underscored the chronicity of oral diseases and the substantial unmet need for preventive and early care.

Over the preceding thirty years, the global rate of dental caries and periodontal disease had not decreased significantly, despite the development of dental technologies and health education. A study by the Global Burden of Disease Study 2021 established that although the prevalence of some forms of caries had stalled, periodontal disease remained highly prevalent, with the greatest burden among middle-aged and older adults and substantial regional disparities, particularly in low- and middle-income countries (Huang, Kang, and Bi, 2025). In most low-resource settings, limited access to dental practitioners, high treatment costs, and poor awareness were among the barriers that led to delayed treatment and disease progression. Such systemic disparities indicated the necessity of new approaches to enhance early diagnosis in non-hospital settings.

Although oral disease prevalence was high, existing oral health care systems remained largely reactive rather than preventive. The majority of people sought dental treatment only after pain or other symptoms had already manifested, which in most instances signified disease in its advanced stages. The complexity of treatment could have been significantly reduced through early diagnosis and preventive advice, but screening resources were largely unavailable. Socioeconomic factors such as income disparity and inadequate dental workforce density further enhanced oral health disparities, especially among underserved populations (Liang et al., 2025). These inequalities stressed the need for affordable, community-applicable screening tools.

Over the preceding several years, machine learning and convolutional neural networks (CNNs) in particular had revolutionized the field of medical image analysis. Deep learning models demonstrated strong performance in identifying dental features and pathologies in clinical images, including radiographs and intraoral photographs. Dental decay diagnosis systems built on annotated photographic datasets reported F1-scores ranging from approximately 78% to over 90%, indicating the potential of these methods in dental diagnostics (Krothapalli & Cherukumalli Kapalavayi, 2025). However, much of this work was conducted on images taken under controlled clinical environments using specialized equipment, rather than consumer-level images.

Mobile health (mHealth) technologies presented an opportunity to close this gap between clinical knowledge and everyday users. The proliferation of smartphones with high-resolution cameras and substantial processing power offered a potential pathway to democratize access to early health screening. While initial research explored the viability of smartphone-based detection of dental conditions, these systems remained under development and were frequently constrained in scope, dataset size, or real-time operation. AI applications to smartphone-captured images produced mixed results, primarily due to challenges of image quality, lighting variation, and the disparity between controlled and real-world scenarios.

There was therefore a strong need for an accessible, machine learning-based solution to oral health screening — one capable of processing smartphone images in real time and offering valuable, preventive feedback. Such a system would not aim to substitute clinical diagnosis but would instead increase early awareness, encourage professional consultation, and empower individuals with practical knowledge. With an emphasis on user-centered design and consumer-grade images, this project addressed one of the key gaps in preventive oral health, particularly in contexts with limited access to traditional dental care.

## 1.2 Problem Statement

Oral diseases such as dental caries and periodontal inflammation remained among the most widespread health problems globally, impacting billions of individuals and resulting in pain, tooth loss, and diminished quality of life when not detected early (Global Burden of Disease, 2025). Despite the accuracy of clinical dental and radiographic examinations in identifying oral health problems, these methods required trained personnel and specialized equipment not always available in low-resource environments (Liang et al., 2025). As a result, most people did not seek treatment at early stages, allowing conditions to worsen and become more costly to treat.

Recent attempts used machine learning to aid in dental image recognition. Systems such as DeepDent demonstrated encouraging results in clinical settings by detecting dental caries from radiographs and intraoral images (Thanh, Van Toan, Vo Truong Nhu, and Nguyen, 2022). However, these methods depended on regulated imaging conditions and professional equipment, limiting their utility to dental clinics and research settings. They were not suited for real-time analysis of images captured by ordinary users in everyday environments.

Mobile health applications and smartphone-accessible web systems had also been developed to engage users in oral health education and risk monitoring. Applications such as BrushSync and OralCare Tracker provided brushing reminders and general recommendations but did not use machine learning to identify the actual state of the mouth from user-captured photographs (Nzabonimana et al., 2024). While such applications enhanced awareness, they did not provide individual feedback based on detectable evidence of dental problems in user images.

Research interest in applying artificial intelligence to dental photographs acquired through smartphones had grown. Early researchers investigated automated detection of plaque and gingivitis-related inflammation using convolutional neural networks, with moderate results under controlled conditions (Ahmed and Lee, 2024). However, currently available models were either trained on small, curated datasets or tested in laboratory settings, and failed to perform effectively when exposed to real-world challenges such as variable lighting, unequal image quality, and different oral anatomies.

Regardless of these developments, no generally accessible technology existed that could allow real-time, preventive dental health screening based on smartphone images using consumer-grade machine learning in a user-friendly interface. This gap led to the continued disregard of initial oral health problems and the loss of opportunities for timely professional consultation. There was therefore a need for a machine learning-based system that could analyze smartphone images taken by ordinary users, detect visible indicators of common oral health problems, and provide preventive guidance to support early awareness and care-seeking behavior.

## 1.3 Project's Main Objective

The main objective of this project was to design and develop a machine learning-based system capable of analyzing dental images captured using smartphone cameras in order to support early and preventive oral health screening. The system aimed to use computer vision techniques to identify visible indicators of common oral health conditions — such as dental caries, plaque accumulation, and gingival inflammation — and to provide users with real-time, easy-to-understand feedback that encouraged timely professional consultation.

### 1.3.1 List of Specific Objectives

1. To review existing literature, technologies, and digital tools related to oral health screening, machine learning applications in dentistry, and smartphone-based medical image analysis, in order to understand current approaches, identify limitations, and clearly define the research gap addressed by this project.

2. To design and develop a machine learning-based system that could analyze dental images captured using smartphone cameras and identify visible indicators of common oral health conditions, including dental caries, plaque buildup, and gingival inflammation.

3. To evaluate the effectiveness of the proposed system by collecting and analyzing measurable outcomes related to both technical performance and preventive impact, including assessing the accuracy and reliability of the image analysis model, as well as examining whether the system improved early awareness of oral health issues.

## 1.4 Research Questions

1. What were the existing approaches and limitations in current oral health screening tools and machine learning-based dental image analysis systems, particularly those intended for public or non-clinical use?

2. How effectively could a machine learning model analyze smartphone-captured dental images to identify visible indicators of common oral health conditions in real-time, non-clinical settings?

3. To what extent did the proposed system demonstrate measurable effectiveness in supporting preventive oral health screening, in terms of model performance and its potential to improve early awareness and decision-making related to professional dental care?

## 1.5 Project Scope

This research focused on the design, development, and evaluation of a machine learning-based preventive oral health screening system that analyzed dental images captured using smartphone cameras. The project was defined to ensure meaningful results within the academic timeframe, while clearly distinguishing preventive screening from clinical diagnosis.

### 1.5.1 Geographic and Population Scope

The geographic scope of this study targeted populations in low- and middle-income contexts, with particular relevance to urban areas in Rwanda, and broader relevance to similar settings in Sub-Saharan Africa where smartphone usage was high but access to regular dental care remained limited. The pilot evaluation involved participants recruited digitally across different regions through online platforms, university networks, and community-based channels. This approach reflected evidence showing increasing smartphone penetration in developing regions, where ownership among young adults exceeded 80% in many urban settings (International Telecommunication Union, 2023).

The target group included adolescents and adults aged 16 years and older who possessed a smartphone with a working camera and had basic internet access. Pilot testing involved approximately 50–100 participants, a sample size considered appropriate for initial assessment of digital health tools. Medical training was not required, as the system was designed for general users taking pictures outside clinical settings (World Health Organization, 2023).

### 1.5.2 Temporal Scope

The project was conducted within a defined academic research period of approximately 12 weeks. This timeframe included initial requirements analysis and dataset preparation, followed by model development, system integration, and pilot evaluation. The system evaluation focused on short-term outcomes — model performance, usability, and preventive feedback relevance — rather than long-term clinical or behavioral outcomes. The temporal scope was consistent with recent pilot studies in mobile-accessible AI-based screening tools (Ahmed et al., 2024; Solea & Berg, 2022).

### 1.5.3 Technological Scope

The proposed project was launched as a mobile-accessible web system with a machine learning-based model for dental image analysis. The system was based on convolutional neural networks trained on annotated datasets of dental images to recognize visible signs of tooth discoloration, plaque existence, and gingival redness. Consumer-grade smartphone cameras were used to capture images in natural conditions. Radiographic imaging, specific dental equipment, and external diagnostic tools were excluded from the system, as they required professional skills and facilities. The system maintained a purposely restricted technological design to promote accessibility, cost-efficiency, and scalability (European Commission, 2023).

### 1.5.4 Methodological Scope

This research adopted a design-and-evaluate approach, combining system development with preliminary effectiveness assessment. Quantitative evaluation included technical metrics such as model accuracy, precision, recall, and F1-score in identifying visible oral health indicators from smartphone images, as well as system response time and reliability. User-centered metrics such as perceived usefulness and clarity of feedback were also collected through structured questionnaires. Qualitative feedback was gathered through open-ended survey responses to capture user experiences and perceived limitations of the system. This strategy aligned with previous designs in early-stage digital health and AI screening research (Park et al., 2020).

## 1.6 Significance and Justification

The successful adoption of the SmartSmile system generated significant health, economic, and technological advantages by supporting early and preventive oral health screening through smartphone photographs. Oral diseases were among the most costly non-communicable diseases to treat once they reached advanced stages, with restorative and surgical dental services being several times more expensive than preventive care (World Health Organization, 2024). Research indicated that preventive dental procedures could lower oral health treatment expenses over time by as much as 30–40%, specifically in groups with uneven distribution of dental services (Peres et al., 2023). SmartSmile aimed to ensure that fewer oral health seekers received delayed care by offering real-time feedback through their phones, enabling timely oral healthcare choices.

Dental consultation costs posed a significant obstacle in most low- and middle-income environments, often representing a substantial share of monthly household health spending. In such situations, over 60% of the population did not visit a dentist until pain became severe (Liang et al., 2025). An early awareness tool that functioned as a preventive screening instrument without requiring immediate clinic appointments could minimize unnecessary delays and costs while referring users to appropriate professional care.

### 1.6.1 Academic and Research Significance

Academically, the study contributed to the emerging area of AI-based preventive medicine through empirical findings on the application of smartphone-based dental image analysis outside clinical settings. Although machine learning models had been shown to be practical in dental image analysis, the majority of existing research was conducted with radiographs or in-office intraoral photographs (Estai et al., 2022; Ahmed and Lee, 2024). Limited documented studies had been made on real-time preventive screening using consumer-grade smartphone images, especially in non-clinical and resource-constrained settings.

### 1.6.2 Technological Significance

Technologically, this project demonstrated how machine learning and mobile-accessible web computing could be integrated to create an accessible and scalable preventive health tool. The SmartSmile system explored the practical application of convolutional neural networks for analyzing non-clinical dental images captured using smartphone cameras, addressing challenges such as inconsistent lighting, image quality variation, and user-controlled image capture — challenges frequently cited as limitations in deploying AI-based health tools in real-world settings (European Commission, 2023).

### 1.6.3 Social and Public Health Significance

This project carried social importance because it enhanced oral health awareness and preventive behavior among the general population. Oral health behaviors and care-seeking patterns were typically established early in life and had a significant impact on future health outcomes (Zhu et al., 2024). By offering immediate feedback and proactive advice, SmartSmile prompted users to consider their oral health before the emergence of pain or severe symptoms, fostering self-awareness and informed decision-making rather than passive dependence on clinical visits.

## 1.7 Research Budget

| Item/Service | Description | Quantity | Unit Cost ($) | Total Cost ($) |
|---|---|---|---|---|
| Cloud Hosting / Web Server | Hosting for web-based SmartSmile system (12 weeks) | 1 | 50 | 50 |
| Domain Name | Custom domain for project web application | 1 | 10 | 10 |
| GPU | Graphics processing unit for model training | 1 | 150 | 150 |
| Dataset Access | Annotated dental image datasets | 1 | 50 | 50 |
| Miscellaneous / Contingency | Unexpected small expenses | 1 | 20 | 20 |
| **Total** | | | | **280** |

## 1.8 Research Timeline

| Task / Week | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1. Requirements Analysis & Literature Review | ✓ | ✓ | ✓ | | | | | | | | | |
| 2. Dataset Collection & Preparation | | ✓ | ✓ | ✓ | ✓ | | | | | | | |
| 3. Model Design & Development | | | | ✓ | ✓ | ✓ | ✓ | | | | | |
| 4. Web System & Integration | | | | | ✓ | ✓ | ✓ | ✓ | | | | |
| 5. Pilot Evaluation / Testing | | | | | | | ✓ | ✓ | ✓ | ✓ | | |
| 6. Data Analysis & Result Interpretation | | | | | | | | | ✓ | ✓ | ✓ | |
| 7. Report Writing & Final Documentation | | | | | | | | | | ✓ | ✓ | ✓ |
