# Sensitive Data Detection & Compliance Assistant

## Overview
An AI-assisted application that uploads documents (PDF/TXT/CSV), detects sensitive/confidential information, classifies risk level, generates a compliance summary, and answers user questions about the document via Retrieval-Augmented Generation (RAG).

## Architecture

```
Document [PDF/CSV/TXT]
        |
        v
Scanning Agent
  - Detect file type & page count
  - Detect scanned vs digital PDF
  - Digital -> PyMuPDF text extraction
  - Scanned -> OCR (pytesseract + pdf2image) -> extraction
        |
        v
Pattern Matching Agent
  - Regex: Aadhaar, PAN, email, phone, credit card, IFSC, API keys/passwords, employee IDs
  - spaCy NER: person names, organizations, confidential business context
        |
        v
Masking Agent
  - Redacts/masks all detected sensitive values BEFORE any AI/LLM exposure
        |
        v
Risk Scorer
  - Weighted rule-based scoring -> Low / Medium / High Risk
        |
        v
RAG Agent (LlamaIndex)
  - VectorStoreIndex for targeted Q&A ("how many emails exist?")
  - SummaryIndex for compliance summary generation
        |
        v
Streamlit Dashboard
  - Multi-document upload, tabs: Detection Report, Risk Dashboard, Compliance Summary, Ask Questions
```

## Design Principles (Why This Architecture)
- **Data minimization first**: Masking happens before any text reaches the LLM/RAG layer. Raw sensitive values (Aadhaar, PAN, card numbers) never leave the local detection layer.
- **Deterministic core, AI at the edges**: Detection, extraction, and masking are rule-based (regex + spaCy), not LLM-based, for auditability and explainability. AI/LLM is only used for summarization and open-ended Q&A over already-masked text.
- **Conditional OCR**: Native text extraction (PyMuPDF) is attempted first; OCR only triggers when a page returns near-empty text, avoiding unnecessary compute on digital PDFs.
- **Explainable risk scoring**: A weighted rule-based score (not a black-box classifier or LLM judgment) so every risk label is traceable back to specific findings.
- **Agent-based, microservice-ready**: Four independent modules (Scanning, Pattern Matching, Masking, RAG) each expose a single clear method, making future Dockerization/microservice separation straightforward.

## AI/ML Approach
1. **Detection**: Hybrid regex (structured PII: Aadhaar/PAN/email/phone/card/IFSC/API keys) + spaCy NER (unstructured entities: names, orgs, confidential context) — regex alone misses contextual entities; NLP alone misses precise structured formats.
2. **Risk Classification**: Rule-based weighted scoring, not ML classification — chosen for explainability in a compliance context where auditors need to trace *why* a score was assigned.
3. **Summarization & Q&A**: RAG pattern using LlamaIndex — chunk masked text, embed with a local HuggingFace sentence-transformer, index with VectorStoreIndex (targeted lookup) and SummaryIndex (broad summarization), then generate grounded responses via an LLM (Gemini/Groq) using only masked content — reduces hallucination and prevents sensitive data leakage to third-party APIs.

## Setup Instructions
```bash
git clone <repo-url>
cd sensitive-data-compliance-assistant
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
python -m spacy download en_core_web_sm

# System dependencies (required for OCR)
# Ubuntu/Colab: sudo apt-get install tesseract-ocr poppler-utils
# Streamlit Cloud: add packages.txt with lines: tesseract-ocr, poppler-utils

streamlit run app.py
```

## Environment Variables
```
GEMINI_API_KEY=your_key_here
# or GROQ_API_KEY=your_key_here
```

## Repository Structure
```
app.py                     # Streamlit UI entrypoint
agents/
  scanning_agent.py
  pattern_matching_agent.py
  masking_agent.py
  rag_agent.py
risk_scorer.py
requirements.txt
packages.txt                # system deps for Streamlit Cloud
README.md
docs/
  CODING_STANDARDS.md
  NAMING_STANDARDS.md
  COMPONENTS_AND_FUNDAMENTALS.md
```

## Challenges Faced
- Balancing OCR compute cost against extraction accuracy for mixed digital/scanned documents.
- Preventing false positives/negatives in regex (e.g., 16-digit numbers that aren't credit cards) — mitigated with context-window checks and optional Luhn validation.
- Ensuring masked text retains enough structure for the LLM to answer meaningfully without exposing real values.
- Coordinating four independent agents' outputs into a single coherent Streamlit session state, especially for multi-document mode.

## Future Improvements
- True role-based access control (Admin vs Analyst views) with authentication.
- Full Dockerization of each agent as an independent microservice with a FastAPI gateway.
- Audit logging of every detection/masking event for compliance traceability.
- Luhn-algorithm validation for credit card matches to reduce false positives.
- Support for DOCX and image-only file uploads.
- Fine-tuned NER model instead of generic spaCy model for higher accuracy on Indian-specific entities.

## Demo & Deployment
- GitHub Repository: <link>
- Demo Video (2-5 min): <link>
- Live Deployment: <link>
