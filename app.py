import streamlit as st
import os
import io
import logging
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

import importlib
import agents.scanning_agent
import agents.pattern_matching_agent
import agents.masking_agent
import agents.rag_agent
import risk_scorer

importlib.reload(agents.scanning_agent)
importlib.reload(agents.pattern_matching_agent)
importlib.reload(agents.masking_agent)
importlib.reload(agents.rag_agent)
importlib.reload(risk_scorer)

from agents.scanning_agent import ScanningAgent
from agents.pattern_matching_agent import PatternMatchingAgent
from agents.masking_agent import MaskingAgent
from risk_scorer import RiskScorer, RISK_WEIGHTS
from agents.rag_agent import RAGAgent

# Set page config with a modern title and icon
st.set_page_config(
    page_title="Proteccio - Sensitive Data & Compliance",
    page_icon="🛡️",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Premium UI Styling via Custom CSS
st.markdown("""
<style>
    /* Main container and typography */
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap');
    
    html, body, [class*="css"] {
        font-family: 'Outfit', sans-serif;
    }
    
    /* Custom header styling */
    .header-container {
        padding: 1.5rem 0rem;
        background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
        border-radius: 12px;
        margin-bottom: 2rem;
        text-align: center;
        color: white;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
    }
    
    .header-title {
        font-size: 2.2rem;
        font-weight: 700;
        margin: 0;
        letter-spacing: 0.5px;
    }
    
    .header-subtitle {
        font-size: 1rem;
        opacity: 0.9;
        margin-top: 0.5rem;
    }
    
    /* Risk Tags styling */
    .risk-badge {
        font-size: 1rem;
        font-weight: 600;
        padding: 0.35rem 0.8rem;
        border-radius: 50px;
        display: inline-block;
        text-align: center;
    }
    
    .risk-high {
        background-color: #ffe5e5;
        color: #cc0000;
        border: 1px solid #ffcccc;
    }
    
    .risk-medium {
        background-color: #fff9e6;
        color: #b38600;
        border: 1px solid #ffe699;
    }
    
    .risk-low {
        background-color: #e6f7ed;
        color: #00802b;
        border: 1px solid #b3e6c3;
    }
    
    /* Card design */
    .dashboard-card {
        background-color: #ffffff;
        border-radius: 10px;
        padding: 1.5rem;
        border: 1px solid #e0e0e0;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
        margin-bottom: 1rem;
    }
    
    .dashboard-card h3 {
        margin-top: 0;
        font-size: 1.2rem;
        font-weight: 600;
        color: #333333;
    }
    
    /* Masked text area styling */
    .masked-text-container {
        font-family: 'Courier New', Courier, monospace;
        background-color: #f8f9fa;
        border-radius: 8px;
        padding: 1.5rem;
        border: 1px solid #ced4da;
        white-space: pre-wrap;
        max-height: 450px;
        overflow-y: auto;
        font-size: 0.95rem;
        line-height: 1.5;
        color: #212529;
    }
    
    /* Stat cards */
    .stat-box {
        text-align: center;
        padding: 1rem;
        background-color: #f8f9fa;
        border-radius: 8px;
        border: 1px solid #e9ecef;
    }
    .stat-number {
        font-size: 1.8rem;
        font-weight: 700;
        color: #1e3c72;
    }
    .stat-label {
        font-size: 0.85rem;
        color: #6c757d;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }
</style>
""", unsafe_allow_html=True)

# App Title Header
st.markdown("""
<div class="header-container">
    <div class="header-title">🛡️ PROTECCIO</div>
    <div class="header-subtitle">Sensitive Data Detection & Compliance Assistant</div>
</div>
""", unsafe_allow_html=True)

# Sidebar settings and file uploader
st.sidebar.image("https://img.icons8.com/color/96/shield.png", width=70)
st.sidebar.title("Configuration & Upload")

# API Key handling
api_key = os.environ.get("GEMINI_API_KEY", "")
if not api_key:
    api_key = st.sidebar.text_input(
        "Enter Gemini API Key", 
        type="password", 
        placeholder="AIzaSy...", 
        key="gemini_api_key_input",
        help="Required for RAG-based Compliance Summary and Q&A features."
    )
else:
    st.sidebar.success("Gemini API Key loaded from environment.")

# Initialise session state containers
if "documents" not in st.session_state:
    st.session_state.documents = {}
if "rag_agents" not in st.session_state:
    st.session_state.rag_agents = {}
if "chat_history" not in st.session_state:
    st.session_state.chat_history = {}

# File Uploader
uploaded_files = st.sidebar.file_uploader(
    "Upload Documents",
    type=["pdf", "txt", "csv"],
    accept_multiple_files=True,
    key="document_uploader_widget"
)

# Process newly uploaded files
if uploaded_files:
    scanner = ScanningAgent()
    detector = PatternMatchingAgent()
    masker = MaskingAgent()
    scorer = RiskScorer()
    
    for uploaded_file in uploaded_files:
        doc_id = uploaded_file.name
        
        # Only process if not already in session state
        if doc_id not in st.session_state.documents:
            with st.spinner(f"Analyzing {doc_id}..."):
                try:
                    # 1. Text Extraction
                    file_extension = os.path.splitext(doc_id)[1]
                    raw_text = scanner.process(uploaded_file, file_extension)
                    
                    # 2. Sensitive Data Detection
                    findings = detector.detect(raw_text)
                    
                    # 3. Data Masking
                    masked_text = masker.mask(raw_text, findings)
                    
                    # 4. Risk Classification
                    risk_label, risk_score = scorer.classify(findings)
                    
                    # Store in session state
                    st.session_state.documents[doc_id] = {
                        "raw_text": raw_text,
                        "findings": findings,
                        "masked_text": masked_text,
                        "risk_label": risk_label,
                        "risk_score": risk_score
                    }
                    
                    # Initialize chat history
                    st.session_state.chat_history[doc_id] = []
                    
                    st.toast(f"Successfully processed {doc_id}!", icon="✅")
                except Exception as e:
                    st.error(f"Error processing {doc_id}: {str(e)}")
                    logger.error(f"Error processing document {doc_id}", exc_info=True)

# Main Screen Display logic
if not st.session_state.documents:
    st.markdown("""
    <div style="text-align: center; margin-top: 4rem; padding: 3rem; background-color: #fdfdfd; border-radius: 12px; border: 2px dashed #cccccc; color: #212529;">
        <img src="https://img.icons8.com/clouds/150/000000/safe-ok.png" />
        <h2 style="color: #212529; font-weight: 500;">No Documents Uploaded Yet</h2>
        <p style="color: #555555; max-width: 500px; margin: 0 auto 1.5rem auto;">
            Please upload document files (PDF, TXT, or CSV) using the sidebar file uploader to start detecting sensitive data and evaluating compliance risk.
        </p>
    </div>
    """, unsafe_allow_html=True)
else:
    # Document Selector dropdown
    st.subheader("Selected Document")
    selected_doc_id = st.selectbox(
        "Choose a document to inspect:", 
        options=list(st.session_state.documents.keys()),
        key="doc_selector_dropdown"
    )
    
    # Retrieve data for active document
    doc_data = st.session_state.documents[selected_doc_id]
    raw_text = doc_data["raw_text"]
    findings = doc_data["findings"]
    masked_text = doc_data["masked_text"]
    risk_label = doc_data["risk_label"]
    risk_score = doc_data["risk_score"]
    
    # Display risk summary at the top
    badge_class = f"risk-{risk_label.lower()}"
    st.markdown(f"""
    <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1.5rem; padding: 1rem; background-color: #f8f9fa; border-radius: 8px;">
        <span style="font-weight: 600; color: #495057;">Document Risk:</span>
        <span class="risk-badge {badge_class}">{risk_label} Risk (Score: {risk_score})</span>
    </div>
    """, unsafe_allow_html=True)
    
    # RAG Agent Lazy Initialization for Selected Document
    rag_agent_ready = False
    if api_key:
        if selected_doc_id not in st.session_state.rag_agents:
            with st.spinner("Building retrieval index..."):
                try:
                    rag_agent = RAGAgent(masked_text, findings, risk_label, api_key=api_key)
                    st.session_state.rag_agents[selected_doc_id] = rag_agent
                    rag_agent_ready = True
                except Exception as e:
                    st.sidebar.error(f"Error building RAGAgent: {str(e)}")
        else:
            rag_agent_ready = True
    
    # Tabs structure
    tab_report, tab_risk, tab_summary, tab_qa = st.tabs([
        "🔍 Detection Report", 
        "📊 Risk Dashboard", 
        "📝 Compliance Summary", 
        "💬 Ask Questions"
    ])
    
    # TABS: Detection Report
    with tab_report:
        col_left, col_right = st.columns([1, 2])
        
        with col_left:
            st.subheader("Detected Entities Summary")
            
            # Count findings
            regex_findings_found = False
            for cat in RISK_WEIGHTS.keys():
                count = len(findings.get(cat, []))
                if count > 0:
                    regex_findings_found = True
                    st.markdown(f"""
                    <div style="display: flex; justify-content: space-between; padding: 0.5rem 0; border-bottom: 1px solid #eee;">
                        <strong>{cat}:</strong>
                        <span style="background-color: #e2e3e5; padding: 0.15rem 0.5rem; border-radius: 4px; font-weight: 600; color: #212529;">{count}</span>
                    </div>
                    """, unsafe_allow_html=True)
            
            if not regex_findings_found:
                st.info("No standard PII patterns detected.")

            # Supplementary NER findings
            st.markdown("<br><h5>Supplementary Entities (NER)</h5>", unsafe_allow_html=True)
            ner_found = False
            for cat in ["PERSON", "ORG", "GPE"]:
                count = len(findings.get(cat, []))
                if count > 0:
                    ner_found = True
                    st.markdown(f"""
                    <div style="display: flex; justify-content: space-between; padding: 0.5rem 0; border-bottom: 1px solid #eee;">
                        <span>{cat}:</span>
                        <span style="background-color: #f1f3f5; padding: 0.15rem 0.5rem; border-radius: 4px; color: #212529;">{count}</span>
                    </div>
                    """, unsafe_allow_html=True)
            if not ner_found:
                st.info("No named entities detected.")

        with col_right:
            st.subheader("Masked Document View")
            st.markdown('<div class="masked-text-container">' + masked_text + '</div>', unsafe_allow_html=True)
            
            st.download_button(
                label="📥 Download Masked Document (TXT)",
                data=masked_text,
                file_name=f"masked_{selected_doc_id}.txt",
                mime="text/plain",
                key="download_masked_text_button"
            )

    # TABS: Risk Dashboard
    with tab_risk:
        st.subheader("Risk Weight Evaluation")
        
        # Grid of stat boxes
        col1, col2, col3, col4 = st.columns(4)
        with col1:
            st.markdown(f"""
            <div class="stat-box">
                <div class="stat-number">{risk_score}</div>
                <div class="stat-label">Total Risk Score</div>
            </div>
            """, unsafe_allow_html=True)
        with col2:
            high_pii_count = sum(len(findings.get(cat, [])) for cat in ["Aadhaar", "PAN", "CreditCard"] if cat in findings)
            st.markdown(f"""
            <div class="stat-box">
                <div class="stat-number">{high_pii_count}</div>
                <div class="stat-label">Critical PII items</div>
            </div>
            """, unsafe_allow_html=True)
        with col3:
            med_pii_count = sum(len(findings.get(cat, [])) for cat in ["IFSC", "APIKey"] if cat in findings)
            st.markdown(f"""
            <div class="stat-box">
                <div class="stat-number">{med_pii_count}</div>
                <div class="stat-label">Medium PII items</div>
            </div>
            """, unsafe_allow_html=True)
        with col4:
            low_pii_count = sum(len(findings.get(cat, [])) for cat in ["Phone", "Email", "EmployeeID"] if cat in findings)
            st.markdown(f"""
            <div class="stat-box">
                <div class="stat-number">{low_pii_count}</div>
                <div class="stat-label">Low PII items</div>
            </div>
            """, unsafe_allow_html=True)
            
        st.markdown("<br>", unsafe_allow_html=True)
        
        # Explanatory Audit Log for Risk Score
        st.subheader("Risk Score Audit Log")
        
        audit_data = []
        for category, weight in RISK_WEIGHTS.items():
            occurrences = findings.get(category, [])
            count = len(occurrences)
            if count > 0:
                subtotal = count * weight
                audit_data.append({
                    "Sensitive Category": category,
                    "Unit Weight": weight,
                    "Count": count,
                    "Subtotal Score": subtotal,
                    "Detected Matches": ", ".join([f"'{item}'" for item in occurrences])
                })
                
        if audit_data:
            st.table(audit_data)
            st.caption("Risk labels are derived from total score: Low Risk (< 5), Medium Risk (5 - 14), High Risk (>= 15).")
        else:
            st.success("No risk-weighted sensitive items were found in this document. Total Risk Score is 0.")

    # TABS: Compliance Summary
    with tab_summary:
        st.subheader("Grounded Compliance Summary")
        
        if not api_key:
            st.warning("Please provide a Gemini API Key in the sidebar to generate the compliance summary.")
        elif not rag_agent_ready:
            st.error("RAG Agent failed to build. Check API key and model config.")
        else:
            # Check if summary is already cached to avoid API rebuild costs on tab clicks
            summary_key = f"summary_{selected_doc_id}"
            if summary_key not in st.session_state:
                with st.spinner("Generating summary via RAGAgent..."):
                    try:
                        agent = st.session_state.rag_agents[selected_doc_id]
                        st.session_state[summary_key] = agent.summarize()
                    except Exception as e:
                        st.error(f"Error generating summary: {str(e)}")
            
            if summary_key in st.session_state:
                summary_text = st.session_state[summary_key]
                st.markdown(f"""
                <div style="background-color: #f1f3f9; border-left: 5px solid #1e3c72; padding: 1.5rem; border-radius: 4px; font-size: 1.05rem; line-height: 1.6; color: #212529;">
                    {summary_text}
                </div>
                """, unsafe_allow_html=True)
                
                st.download_button(
                    label="📥 Export Compliance Report (TXT)",
                    data=summary_text,
                    file_name=f"compliance_report_{selected_doc_id}.txt",
                    mime="text/plain",
                    key="download_summary_text_button"
                )

    # TABS: Ask Questions
    with tab_qa:
        st.subheader("Document targeted Q&A")
        
        if not api_key:
            st.warning("Please provide a Gemini API Key in the sidebar to ask questions.")
        elif not rag_agent_ready:
            st.error("RAG Agent is not available. Check API key and configuration.")
        else:
            st.info("Ask specific questions about the document. Downstream RAG only operates over masked data, preventing sensitive leakages.")
            
            # Display chat messages from session state
            for msg in st.session_state.chat_history[selected_doc_id]:
                with st.chat_message(msg["role"]):
                    st.write(msg["content"])
            
            # Input for new message
            if user_question := st.chat_input("Ask a question about this document:", key="qa_chat_input"):
                # Display user message
                with st.chat_message("user"):
                    st.write(user_question)
                st.session_state.chat_history[selected_doc_id].append({"role": "user", "content": user_question})
                
                # Query RAGAgent
                with st.spinner("Searching document..."):
                    try:
                        agent = st.session_state.rag_agents[selected_doc_id]
                        answer = agent.query(user_question)
                        
                        # Display assistant response
                        with st.chat_message("assistant"):
                            st.write(answer)
                        st.session_state.chat_history[selected_doc_id].append({"role": "assistant", "content": answer})
                    except Exception as e:
                        st.error(f"Error querying RAGAgent: {str(e)}")
