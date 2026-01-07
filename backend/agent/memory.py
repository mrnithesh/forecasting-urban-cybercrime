"""
In-memory session storage for conversation history.
"""

from typing import Dict, List, Optional
from langchain_core.messages import BaseMessage, HumanMessage, AIMessage
from threading import Lock

class SessionMemory:
    """
    Thread-safe in-memory storage for conversation sessions.
    Each session maintains its own chat history.
    """
    
    def __init__(self):
        self._sessions: Dict[str, List[BaseMessage]] = {}
        self._lock = Lock()
    
    def get_history(self, session_id: str) -> List[BaseMessage]:
        """
        Retrieves the chat history for a given session.
        
        Args:
            session_id: Unique identifier for the session
            
        Returns:
            List of messages in the session (empty list if session doesn't exist)
        """
        with self._lock:
            return self._sessions.get(session_id, []).copy()
    
    def add_message(self, session_id: str, message: BaseMessage) -> None:
        """
        Adds a message to the session history.
        
        Args:
            session_id: Unique identifier for the session
            message: The message to add
        """
        with self._lock:
            if session_id not in self._sessions:
                self._sessions[session_id] = []
            self._sessions[session_id].append(message)
    
    def add_user_message(self, session_id: str, content: str) -> None:
        """
        Adds a user message to the session history.
        
        Args:
            session_id: Unique identifier for the session
            content: The message content
        """
        self.add_message(session_id, HumanMessage(content=content))
    
    def add_ai_message(self, session_id: str, content: str) -> None:
        """
        Adds an AI message to the session history.
        
        Args:
            session_id: Unique identifier for the session
            content: The message content
        """
        self.add_message(session_id, AIMessage(content=content))
    
    def clear_session(self, session_id: str) -> bool:
        """
        Clears the history for a specific session.
        
        Args:
            session_id: Unique identifier for the session
            
        Returns:
            True if the session existed and was cleared, False otherwise
        """
        with self._lock:
            if session_id in self._sessions:
                del self._sessions[session_id]
                return True
            return False
    
    def session_exists(self, session_id: str) -> bool:
        """
        Checks if a session exists.
        
        Args:
            session_id: Unique identifier for the session
            
        Returns:
            True if the session exists, False otherwise
        """
        with self._lock:
            return session_id in self._sessions
    
    def create_session(self, session_id: str) -> bool:
        """
        Creates a new empty session.
        
        Args:
            session_id: Unique identifier for the session
            
        Returns:
            True if the session was created, False if it already existed
        """
        with self._lock:
            if session_id not in self._sessions:
                self._sessions[session_id] = []
                return True
            return False

# Global session memory instance
session_memory = SessionMemory()

