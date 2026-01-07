"""
LangChain tools for the Cyber Awareness Assistant.
"""

from typing import List
from langchain_core.tools import tool
from langchain_community.tools import DuckDuckGoSearchRun

@tool
def search_cyber_info(query: str) -> str:
    """
    Search the web for cyber security information, reporting portals, or crime trends.
    Use this when you need up-to-date information, helpline numbers, or specific URLs.
    """
    try:
        search = DuckDuckGoSearchRun()
        # Add context to the query for better results
        enhanced_query = f"{query} cyber crime India"
        return search.invoke(enhanced_query)
    except Exception as e:
        return f"Error performing web search: {str(e)}"

def get_tools() -> List:
    """
    Returns all available tools for the agent.
    
    Returns:
        List of LangChain tools
    """
    return [search_cyber_info]

