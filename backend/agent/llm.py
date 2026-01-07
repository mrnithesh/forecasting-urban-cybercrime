"""
LLM configuration using OpenRouter (via ChatOpenAI).
"""

from langchain_openai import ChatOpenAI
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def get_llm(model: str = None, temperature: float = 0.7) -> ChatOpenAI:
    """
    Creates and returns a ChatOpenAI instance configured for OpenRouter.
    
    Args:
        model: The model to use (defaults to OPENROUTER_MODEL env var)
        temperature: Sampling temperature for response generation
        
    Returns:
        Configured ChatOpenAI instance
    """
    api_key = os.getenv("OPENROUTER_API_KEY")
    if not api_key:
        print("WARNING: OPENROUTER_API_KEY not found in environment variables.")

    # Use env var if model not provided
    if model is None:
        model = os.getenv("OPENROUTER_MODEL", "xiaomi/mimo-v2-flash:free")
        
    default_headers = {
        "HTTP-Referer": "http://localhost:5000",
        "X-Title": "Cyber Awareness Chatbot"
    }
    
    return ChatOpenAI(
        model=model,
        temperature=temperature,
        api_key=api_key,
        base_url="https://openrouter.ai/api/v1",
        default_headers=default_headers,
        max_retries=2,
        request_timeout=60,
    )

