"""
LangGraph definition for the Cyber Awareness Assistant.
"""

from typing import TypedDict, Annotated, Sequence, Optional
from langchain_core.messages import BaseMessage, SystemMessage
from langgraph.graph import StateGraph, END
from langgraph.graph.message import add_messages
from langgraph.prebuilt import ToolNode

from .llm import get_llm
from .tools import get_tools
from .prompts import DEFAULT_SYSTEM_PROMPT

class AgentState(TypedDict):
    messages: Annotated[Sequence[BaseMessage], add_messages]

def create_cyber_agent():
    """
    Creates and returns a compiled LangGraph agent.
    """
    llm = get_llm()
    tools = get_tools()
    
    # Bind tools to the LLM
    llm_with_tools = llm.bind_tools(tools)
    
    # Define the agent node
    def agent_node(state: AgentState):
        messages = state["messages"]
        
        # Ensure system message is present
        # We check if the first message is a SystemMessage, if not we add one
        if not messages or not isinstance(messages[0], SystemMessage):
            system_msg = SystemMessage(content=DEFAULT_SYSTEM_PROMPT)
            messages_with_system = [system_msg] + list(messages)
        else:
            # If there is one, we might want to ensure it's ours, but for now let's assume session history handles it
            # Or we can force it to be the first message every time
            non_system_messages = [m for m in messages if not isinstance(m, SystemMessage)]
            messages_with_system = [SystemMessage(content=DEFAULT_SYSTEM_PROMPT)] + non_system_messages
        
        response = llm_with_tools.invoke(messages_with_system)
        return {"messages": [response]}
    
    # Define routing function
    def should_continue(state: AgentState):
        messages = state["messages"]
        last_message = messages[-1]
        
        if hasattr(last_message, "tool_calls") and last_message.tool_calls:
            return "tools"
        return END
    
    # Create tool node
    tool_node = ToolNode(tools)
    
    # Build the graph
    workflow = StateGraph(AgentState)
    
    # Add nodes
    workflow.add_node("agent", agent_node)
    workflow.add_node("tools", tool_node)
    
    # Set entry point
    workflow.set_entry_point("agent")
    
    # Add conditional edges
    workflow.add_conditional_edges(
        "agent",
        should_continue,
        {
            "tools": "tools",
            END: END,
        }
    )
    
    # Tools always return to agent
    workflow.add_edge("tools", "agent")
    
    # Compile and return
    return workflow.compile()

# Singleton instance
_agent_graph = None

def get_agent_graph():
    global _agent_graph
    if _agent_graph is None:
        _agent_graph = create_cyber_agent()
    return _agent_graph

