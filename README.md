# 🎓 Smart Assignment Assessment Tool (SAAT) – 24-25J-295

> A comprehensive AI-powered platform to automate the assessment of student submissions, including code, reports, videos, and viva questions. Designed to improve fairness, accuracy, and feedback quality in academic evaluations.

## 🌟 Project Overview

SAAT leverages cutting-edge AI technologies to transform traditional assessment methods. It supports diverse submission types from GitHub repositories to video presentations and provides tailored feedback to both students and educators through an intuitive, centralized interface.

## 📌 Key Features

### ✅ Code Assessment
- GitHub repository integration
- File structure visualization with Monaco Editor
- Code review with naming convention checks, comment accuracy, and line-by-line feedback
- Team contribution evaluation via commit history

### 📝 Report Evaluation
- Automated checks for compliance with lecturer’s requirements
- AI-generated content and plagiarism detection
- Structured feedback and originality scoring

### 🎥 Video Analysis
- Audio transcription using Whisper + FFmpeg
- Visual keyframe extraction using OpenCV & Florence2-large
- Video segmentation and content summarization
- Timestamp-based feedback by teachers

### 🎤 Viva Question Generator
- Contextual viva questions from reports, code, and video submissions
- Powered by Gemini 1.5 Flash API
- Adaptive and personalized using prompt engineering techniques

---

## 📊 System Architecture

The platform is divided into four key components:
1. **Code Analysis Module**
2. **Report Analysis Module**
3. **Video Assessment Module**
4. **Viva Question Generation Module**

Each module integrates seamlessly with the central web app and Firebase backend.

---

## 💻 Tech Stack

| Layer         | Technology                        |
|--------------|------------------------------------|
| Frontend     | React, Tailwind CSS                |
| Backend      | Python, Flask                      |
| Database     | Firebase                           |
| AI/ML Models | Gemini 1.5 Flash, Whisper, RoBERTa, Florence2-large |
| Tools & APIs | GitHub API, OpenCV, FFmpeg, HuggingFace, Google Generative AI |

---

## 📈 Project Highlights

- Teacher Dashboard with assignment-based performance view
- Grading logic based on weighted score calculation
- Hidden marks until teacher approval
- Role-based access and authentication
- Hosted on: [https://www.saat.42web.io](https://www.saat.42web.io)

---

## 💡 Research Questions Addressed

- How can advanced technologies ensure fairness and consistency in assessments?
- How to evaluate programming and written submissions using NLP and static code analysis?
- How can LLMs generate personalized viva questions?

---

## 🔬 AI Models Used

| Use Case                     | Model / Tool                                |
|-----------------------------|----------------------------------------------|
| Code Naming Feedback        | Custom rule-based engine                     |
| Report Analysis             | OpenAI GPT-3.5, RoBERTa, Toxic-BERT          |
| Video Transcription         | Whisper + FFmpeg                             |
| Visual Analysis             | Florence2-large, OpenCV, ResNet-18           |
| Viva Question Generation    | Gemini 1.5 Flash, T5-small QG, BLIP-2        |

---

## 📅 Development Timeline

Key milestones completed:
- ✅ Functional MVP for each module
- ✅ User testing and teacher feedback integration
- ✅ Hosted version with real-time feedback
- ✅ Dashboard and grading logic implementation

---

## 👥 Authors

- **Jayathilaka A.G.K.D.** (IT21252990) – Code Assessment Module  [![Kalinga's GitHub](https://img.shields.io/badge/@kalingajayathilaka-181717?logo=github&logoColor=white)](https://github.com/IT21252990)
- **Liyanage U.S.P.** (IT21306754) – Report Analysis Module  [![Sithara's GitHub](https://img.shields.io/badge/@sitharapramodini-181717?logo=github&logoColor=white)](https://github.com/SitharaPramodini)
- **Gunasekara W.M.A.S.** (IT21373916) – Video Analysis Module  [![Ashen's GitHub](https://img.shields.io/badge/@ashensavinda-181717?logo=github&logoColor=white)](https://github.com/Ashen-Savinda)
- **Rathnayake R.M.U.V.** (IT21271182) – Viva Question Generation  [![Vihangi's GitHub](https://img.shields.io/badge/@vihangirathnayake-181717?logo=github&logoColor=white)](https://github.com/IT21271182)

---

## 📢 Access the App

🔗 [Click here to try the app](https://www.saat.42web.io)

---

## 📄 License

MIT License – see the `LICENSE` file for details.

---
