# CHAPTER SIX: CONCLUSIONS AND RECOMMENDATIONS

## 6.1 Conclusion

This project set out to design, develop, and evaluate SmartSmile — a web-based, mobile-accessible AI system for preventive oral health screening using smartphone-captured dental images. The work was motivated by a clear and well-documented global problem: oral diseases affect billions of people worldwide, yet the majority of individuals in low- and middle-income settings do not seek dental care until conditions have progressed to painful, costly, and often irreversible stages. Existing AI-based dental screening tools, while promising in controlled clinical environments, consistently failed to translate their performance to real-world, consumer-grade settings — leaving a significant gap in accessible, preventive oral health technology.

SmartSmile addressed this gap through three interconnected contributions.

**First, a rigorous model selection process.** Over 20 deep learning architectures were trained and evaluated on a dataset of 6,000+ labeled dental images across six oral disease classes. The results demonstrated that EfficientViT-B0, while not the highest-accuracy model in absolute terms (91.94% vs. InceptionResNetV2's 92.54%), was the optimal choice for real-world deployment due to its 4x faster inference speed, 88% smaller model size, and well-balanced performance across all six classes. This finding has practical implications beyond this project: it demonstrates that for real-time health screening applications, computational efficiency must be weighed alongside raw accuracy in model selection decisions.

**Second, a complete, functional web application.** The SmartSmile system was fully implemented and deployed, integrating the EfficientViT-B0 model into a Next.js 14 frontend and Python FastAPI backend, with Supabase handling authentication and data management. The system supported the complete user journey — from registration and email verification, through dental image upload and AI analysis, to results display with Grad-CAM heatmap visualization, screening history, and educational content. All 10 functional requirements were met, and the system maintained 99.7% uptime during the evaluation period with response times well within the 5-second requirement.

**Third, validated user acceptance.** Acceptance testing with 15 participants from the target user group yielded a System Usability Scale score of 78.3 (Good) — significantly higher than the 56.2 reported for TestMyTeeth, the most comparable existing system. Users found the results clear, the heatmap visualization helpful, and expressed willingness to use the system regularly. These results confirmed that SmartSmile was not only technically accurate but genuinely usable and valuable to non-clinical users.

Taken together, these results demonstrated that SmartSmile successfully achieved its main objective: to provide an accessible, accurate, real-time preventive oral health screening tool for everyday smartphone users. The system addressed all the gaps identified in the literature review — consumer-grade image compatibility, real-time processing, actionable preventive feedback, and good usability — in a single integrated platform.

The project also confirmed the broader hypothesis that motivated it: that the combination of modern lightweight deep learning architectures (specifically the EfficientViT family) with mobile-accessible web technology can produce health screening tools that are simultaneously accurate enough to be clinically meaningful and efficient enough to be practically deployable. This has implications for other domains of preventive health screening beyond oral health.

It is important to note what SmartSmile is not. It is not a diagnostic tool and does not replace professional dental examination. Its purpose is to raise awareness, encourage early care-seeking behavior, and empower individuals with information about their oral health — particularly in settings where access to dental professionals is limited. The system's recommendations consistently directed users toward professional consultation when conditions were detected, reinforcing this preventive rather than diagnostic role.

## 6.2 Limitations of the Study

While the results were encouraging, several limitations must be acknowledged:

**1. Dataset Limitations:**
The training dataset, while comprising over 6,000 images, was sourced from publicly available repositories and may not fully represent the diversity of dental presentations across different ethnicities, age groups, and geographic regions. The model's performance on populations significantly different from the training data distribution has not been validated.

**2. Consumer Image Quality:**
Although the system was designed for consumer-grade smartphone images, the training dataset consisted primarily of professionally captured dental photographs. Real-world smartphone images may exhibit greater variability in lighting, angle, focus, and image quality than the training data, potentially affecting model performance in practice.

**3. Limited Clinical Validation:**
The system was evaluated through user acceptance testing and technical performance metrics, but was not validated against clinical diagnoses by licensed dental professionals. A formal clinical validation study comparing SmartSmile's predictions against dentist diagnoses on the same images would be necessary before any clinical deployment.

**4. Sample Size:**
The acceptance testing involved 15 participants, which, while appropriate for an initial feasibility study, is insufficient to draw statistically robust conclusions about usability and user satisfaction across the broader target population.

**5. Single-Condition Output:**
The current system outputs a single predicted condition per image. In reality, a patient may present with multiple concurrent oral health conditions. A multi-label classification approach would better reflect clinical reality.

**6. No Longitudinal Data:**
The evaluation focused on short-term outcomes. The system's effectiveness in actually changing oral health behaviors and encouraging professional consultation over time was not measured.

## 6.3 Recommendations

Based on the findings of this project and the limitations identified above, the following recommendations are made for future development and research:

**1. Clinical Validation Study:**
The most important next step is a formal clinical validation study in which SmartSmile's predictions are compared against diagnoses made by licensed dentists on the same set of images. This would establish the system's clinical sensitivity and specificity and provide the evidence base needed for responsible deployment in health settings.

**2. Multi-Label Classification:**
The model should be extended to support multi-label classification, allowing it to detect multiple concurrent oral health conditions in a single image. This would better reflect clinical reality and provide more comprehensive screening results.

**3. Dataset Expansion and Diversification:**
The training dataset should be expanded to include a greater diversity of images — different ethnicities, age groups, lighting conditions, smartphone models, and image qualities. This would improve the model's generalizability and robustness in real-world deployment.

**4. Longitudinal Behavioral Study:**
A longitudinal study should be conducted to measure whether regular use of SmartSmile actually changes oral health behaviors — specifically, whether users who receive alerts about detected conditions are more likely to seek professional dental care. This would provide evidence of the system's preventive impact beyond technical performance.

**5. Integration with Teledentistry Platforms:**
SmartSmile could be integrated with existing teledentistry platforms, allowing users to share their screening results directly with dental professionals for remote consultation. This would create a seamless pathway from AI screening to professional care, particularly valuable in rural and underserved areas.

**6. Offline Capability:**
For deployment in areas with limited internet connectivity, a lightweight offline version of the model (using TensorFlow Lite or ONNX Runtime) should be developed and integrated into a Progressive Web App (PWA) or native mobile application.

**7. Multilingual Support:**
To maximize accessibility in Rwanda and other Sub-Saharan African contexts, the system should be extended to support local languages including Kinyarwanda, French, and Swahili.

**8. Expanded Condition Coverage:**
Future versions should expand the number of detectable conditions beyond the current six classes to include other common oral health issues such as oral cancer lesions, dental fluorosis, and periodontal disease staging.

**9. Pediatric Adaptation:**
A specialized version of the system adapted for pediatric oral health screening could be developed, with age-appropriate interfaces and condition categories relevant to children and adolescents.

**10. Government and NGO Partnerships:**
For large-scale deployment, partnerships with government health ministries, NGOs, and community health worker programs should be pursued. SmartSmile could be integrated into existing community health programs as a low-cost, scalable screening tool.

---

# REFERENCES (APA 7th Edition)

Adnan, N., Ahmed, S. F., Das, J. K., et al. (2025). Developing an AI-based application for caries index detection on intraoral photographs. *Scientific Reports, 14*(1), 26752. https://doi.org/10.1038/s41598-024-78184-x

Al-Jallad, N., Ly-Mapes, O., Hao, P., et al. (2022). Artificial intelligence-powered smartphone application improves at-home dental caries screening in children: Moderated and unmoderated usability test. *PLOS Digital Health, 1*(6), e0000093. https://doi.org/10.1371/journal.pdig.0000046

Al-Zubaidy, S., Ahmed, F., & Li, T. (2025). Usability evaluation of AI-based smartphone application for at-home dental plaque detection. *British Dental Journal, 239*(4), 211–218. https://doi.org/10.1038/s41415-025-8502-0

Azimi, S., Bennamoun, B., Mehdizadeh, M., Vignarajan, J., Xiao, D., Huang, B., Spallek, H., Irving, M., Kruger, E., Tennant, M., & Estai, M. (2025). Teledentistry improves access to oral care: A cluster randomised controlled trial. *Healthcare, 13*(18), Article 2282. https://doi.org/10.3390/healthcare13182282

Brooke, J. (1996). SUS: A "quick and dirty" usability scale. In P. W. Jordan, B. Thomas, B. A. Weerdmeester, & A. L. McClelland (Eds.), *Usability evaluation in industry* (pp. 189–194). Taylor & Francis.

Chau, R. C. W., Thu, K. M., Chaurasia, A., Hsung, R. T. C., & Lam, W. Y.-H. (2023). A systematic review of the use of mHealth in oral health education among older adults. *Dentistry Journal, 11*(8), 189. https://doi.org/10.3390/dj11080189

Estai, M., Bunt, S., Kanagasingam, Y., & Tennant, M. (2022). Artificial intelligence in dentistry: A review of current applications and future perspectives. *Journal of Dental Research, 101*(4), 392–401.

European Commission. (2023). *AI in health: Opportunities and challenges*. Brussels: European Commission. https://health.ec.europa.eu/ehealth-digital-health-and-care/artificial-intelligence-healthcare_en

Garg, A., Lu, J., & Maji, A. (2023). Towards earlier detection of oral diseases on smartphones using oral and dental RGB images. https://doi.org/10.48550/arXiv.2308.15705

Global Burden of Disease Study. (2025). *GBD 2021 Oral Conditions Report*. Institute for Health Metrics and Evaluation (IHME). Volume 405, Issue 10482. https://doi.org/10.1016/S0140-6736(24)02811-3

Huang, X., Kang, L., & Bi, J. (2025). Epidemiology of oral health in older adults aged 65 or over: Prevalence, risk factors and prevention. *Aging Clinical and Experimental Research, 37*(1), 193. https://doi.org/10.1007/s40520-025-03110-8

International Telecommunication Union. (2023). *Measuring digital development: Facts and figures 2023*. ITU Publications. https://www.itu.int/en/ITU-D/Statistics/Pages/facts/default.aspx

Krothapalli, N., & Cherukumalli Kapalavayi, N. (2025). Deep learning in dental diagnostics: Caries detection through smartphone photographs – A systematic review. *Journal of Global Oral Health, 8*(2), 91–97. https://doi.org/10.25259/JGOH_30_2025

Liang, Y., Fan, H.-W., Fang, Z., et al. (2020). OralCam: Enabling self-examination and awareness of oral health using a smartphone camera. https://doi.org/10.1145/3313831.3376238

Liang, Y., Zhang, H., & Chen, X. (2025). Socioeconomic determinants of oral health disparities in low- and middle-income countries: A systematic review. *Community Dentistry and Oral Epidemiology, 53*(1), 45–58.

Mehri, A., & Hamed, K. (2025). Development of a computer-aided diagnosis system for dental caries detection applying radiographic images. *Computer Methods and Programs in Biomedicine, 196*, 110966. https://doi.org/10.1016/j.compbiomed.2025.110966

Nzabonimana, E., Malele-Kolisa, Y., Hlongwa, P., & Mudenge, B. (2024). The feasibility and acceptability of a mobile application for oral health education among adults in Rwanda. *Clinical, Cosmetic and Investigational Dentistry, 16*, 359–369. https://doi.org/10.2147/CCIDE.S481599

Park, Y., Purcell Jackson, G., Foreman, M. A., Gruen, D., Hu, J., & Das, A. K. (2020). Evaluating artificial intelligence in medicine: Phases of clinical research. *JAMIA Open, 3*(3), 326–331. https://doi.org/10.1093/jamiaopen/ooaa033

Peres, M., Macpherson, L. M. D., Weyant, R. J., et al. (2023). Oral diseases: Prevention and management in low-resource settings. *The Lancet, 401*(10385), 1345–1358. https://doi.org/10.1016/S0140-6736(19)31146-8

Shams, W. K., Htike, Z. Z., & Ismail, M. A. (2024). Deep learning for dental caries detection: A systematic review. *Journal of Dental Research, 103*(2), 112–124.

Thanh, M. T. G., Van Toan, N., Vo Truong Nhu, N., Nguyen, T. T., Giap, C. N., & Nguyen, D. M. (2022). Deep learning application in dental caries detection using intraoral photos taken by smartphones. *Applied Sciences, 12*(11), 5504. https://doi.org/10.3390/app12115504

Vach, K., Schulz, G., & Hellwig, E. (2024). Systematic review of AI-based dental caries detection: Performance metrics and clinical applicability. *Caries Research, 58*(1), 1–18.

Väyrynen, T., Koskinen, J., & Laine, M. (2023). mHealth applications for oral health: A scoping review of features and clinical evidence. *Journal of Dentistry, 128*, 104358.

World Health Organization. (2023). *Oral health: Key facts*. Geneva: WHO. https://www.who.int/news-room/fact-sheets/detail/oral-health

World Health Organization. (2024). *Oral health fact sheet*. Geneva: WHO. https://www.who.int/news-room/fact-sheets/detail/oral-health

Zhu, Y., McGrath, C., & Li, S. (2024). Early life oral health behaviors and their long-term impact: A longitudinal cohort study. *Community Dentistry and Oral Epidemiology, 52*(3), 201–212.
