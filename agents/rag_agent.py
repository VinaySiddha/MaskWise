import os
from typing import Dict, List
import logging

from llama_index.core import Document, VectorStoreIndex, SummaryIndex, Settings
from llama_index.core.node_parser import SentenceSplitter
from llama_index.embeddings.huggingface import HuggingFaceEmbedding
from llama_index.llms.google_genai import GoogleGenAI

logger = logging.getLogger(__name__)

class RAGAgent:
    """Agent responsible for Vector indexing, Q&A, and summarization using LlamaIndex over masked text."""

    def __init__(self, masked_text: str, findings: Dict[str, List[str]], risk_label: str, api_key: str = None) -> None:
        """Initializes the RAGAgent, builds the Vector and Summary indexes.

        Args:
            masked_text (str): The document text with sensitive values masked.
            findings (Dict[str, List[str]]): Dictionary of detected sensitive findings.
            risk_label (str): The computed risk label ('Low', 'Medium', 'High').
            api_key (str, optional): The Gemini API key. Defaults to None.
        """
        self.masked_text = masked_text
        self.findings = findings
        self.risk_label = risk_label
        
        # 1. Configure settings (LLM and Embeddings)
        effective_api_key = api_key or os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY")
        if effective_api_key:
            Settings.llm = GoogleGenAI(model="gemini-2.5-flash", api_key=effective_api_key)
        else:
            logger.warning("No API key provided. LlamaIndex queries may fail.")
            # Set Settings.llm to GoogleGenAI to let it fallback to default environment variables if any
            Settings.llm = GoogleGenAI(model="gemini-2.5-flash")

        # Use a lightweight local embedding model
        try:
            Settings.embed_model = HuggingFaceEmbedding(model_name="sentence-transformers/all-MiniLM-L6-v2")
        except Exception as e:
            logger.error(f"Failed to load HuggingFaceEmbedding: {str(e)}")
            raise

        # 2. Build Document with metadata
        # Convert findings to simple string counts for metadata
        findings_summary = {k: len(v) for k, v in findings.items() if v}
        metadata = {
            "risk_label": risk_label,
            "findings_count": str(findings_summary)
        }
        
        doc = Document(text=masked_text, metadata=metadata)

        # 3. Chunk text and build indices
        parser = SentenceSplitter(chunk_size=512, chunk_overlap=50)
        self.nodes = parser.get_nodes_from_documents([doc])
        
        self.vector_index = VectorStoreIndex(self.nodes)
        self.summary_index = SummaryIndex(self.nodes)
        logger.info("RAGAgent vector and summary indexes built successfully.")

    def query(self, question: str) -> str:
        """Routes the question to the appropriate index and returns the answer.

        Args:
            question (str): The user's query about the document.

        Returns:
            str: The LLM generated answer.
        """
        # Keyword-based routing to select the best query engine
        summary_keywords = ["summary", "summarize", "overview", "outline", "all", "entire", "whole", "explain"]
        is_broad = any(kw in question.lower() for kw in summary_keywords)

        if is_broad:
            logger.info("Routing query to SummaryIndex")
            query_engine = self.summary_index.as_query_engine(response_mode="tree_summarize")
        else:
            logger.info("Routing query to VectorStoreIndex")
            query_engine = self.vector_index.as_query_engine(similarity_top_k=3)

        response = query_engine.query(question)
        return str(response)

    def summarize(self) -> str:
        """Generates a comprehensive compliance and security summary for the document.

        Returns:
            str: The summary text.
        """
        logger.info("Generating document compliance summary")
        query_engine = self.summary_index.as_query_engine(response_mode="tree_summarize")
        
        prompt = (
            "Generate a structured, professional compliance and security summary for this document. "
            "Address: \n"
            "1. Overall risk classification level (stated in metadata as: " + self.risk_label + ").\n"
            "2. Types of sensitive information that were found and masked (e.g. Aadhaar, PAN, Credit Cards).\n"
            "3. A brief summary of the primary subject matter of the document.\n"
            "Keep the summary concise and focused on compliance. Do not invent or reveal any raw sensitive data."
        )
        
        response = query_engine.query(prompt)
        return str(response)
