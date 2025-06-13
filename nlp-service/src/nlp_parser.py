import re
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
from openai_service import OpenAIService

logger = logging.getLogger(__name__)

class NLPParser:
    def __init__(self):
        """Initialize NLP parser with OpenAI service"""
        self.openai_service = OpenAIService()
        
    async def parse_natural_language(self, text: str) -> Dict[str, Any]:
        """
        Parse natural language text into structured task data
        
        Args:
            text: Natural language text describing tasks
            
        Returns:
            Dictionary containing parsed tasks
        """
        if not text or not text.strip():
            raise ValueError("Input text cannot be empty")
        
        logger.info(f"Starting NLP parsing for text: {text[:100]}...")
        
        try:
            # Use OpenAI for primary parsing
            result = await self.openai_service.parse_tasks(text)
            
            # Post-process and validate results
            processed_result = self._post_process_tasks(result)
            
            logger.info(f"NLP parsing completed successfully. Found {len(processed_result['tasks'])} tasks")
            return processed_result
            
        except Exception as e:
            logger.error(f"NLP parsing failed: {e}")
            # Fallback to basic parsing if OpenAI fails
            logger.info("Attempting fallback parsing...")
            fallback_result = self._fallback_parse(text)
            return fallback_result
    
    def _post_process_tasks(self, tasks_data: Dict[str, Any]) -> Dict[str, Any]:
        """Post-process parsed tasks to ensure data quality"""
        processed_tasks = []
        
        for task in tasks_data.get("tasks", []):
            processed_task = {
                "taskName": self._clean_task_name(task.get("taskName", "")),
                "assignee": self._clean_assignee_name(task.get("assignee", "")),
                "dueDate": self._validate_date(task.get("dueDate", "")),
                "dueTime": self._validate_time(task.get("dueTime", "")),
                "priority": self._validate_priority(task.get("priority", "P3"))
            }
            
            # Only add task if it has minimum required data
            if processed_task["taskName"] and processed_task["assignee"]:
                processed_tasks.append(processed_task)
            else:
                logger.warning(f"Skipping incomplete task: {task}")
        
        return {"tasks": processed_tasks}
    
    def _clean_task_name(self, task_name: str) -> str:
        """Clean and format task name"""
        if not task_name:
            return ""
        
        # Remove extra whitespace and capitalize first letter
        cleaned = " ".join(task_name.strip().split())
        return cleaned.capitalize() if cleaned else ""
    
    def _clean_assignee_name(self, assignee: str) -> str:
        """Clean and format assignee name"""
        if not assignee:
            return ""
        
        # Remove extra whitespace and capitalize each word
        cleaned = " ".join(assignee.strip().split())
        return cleaned.title() if cleaned else ""
    
    def _validate_date(self, date_str: str) -> str:
        """Validate and format date string"""
        if not date_str:
            # Default to tomorrow if no date provided
            tomorrow = datetime.now() + timedelta(days=1)
            return tomorrow.strftime("%Y-%m-%d")
        
        # Check if already in correct format
        if re.match(r'^\d{4}-\d{2}-\d{2}$', date_str):
            try:
                datetime.strptime(date_str, "%Y-%m-%d")
                return date_str
            except ValueError:
                pass
        
        # Default to tomorrow if invalid
        tomorrow = datetime.now() + timedelta(days=1)
        return tomorrow.strftime("%Y-%m-%d")
    
    def _validate_time(self, time_str: str) -> str:
        """Validate and format time string"""
        if not time_str:
            return "17:00"  # Default to 5 PM
        
        # Check if already in correct format
        if re.match(r'^\d{2}:\d{2}$', time_str):
            try:
                datetime.strptime(time_str, "%H:%M")
                return time_str
            except ValueError:
                pass
        
        return "17:00"  # Default to 5 PM if invalid
    
    def _validate_priority(self, priority: str) -> str:
        """Validate priority value"""
        if priority in ["P1", "P2", "P3", "P4"]:
            return priority
        return "P3"  # Default priority
    
    def _fallback_parse(self, text: str) -> Dict[str, Any]:
        """
        Fallback parsing method using basic regex patterns
        Used when OpenAI service is unavailable
        """
        logger.info("Using fallback parsing method")
        
        # Basic patterns for extracting task information
        # This is a simplified fallback - won't be as accurate as OpenAI
        
        tasks = []
        
        # Try to extract basic task pattern: "task for person by date"
        patterns = [
            r'([^,]+?)\s+(?:for\s+)?(\w+)\s+by\s+([^,]+)',
            r'(\w+)\s+(?:should\s+)?([^,]+?)\s+by\s+([^,]+)',
        ]
        
        for pattern in patterns:
            matches = re.finditer(pattern, text, re.IGNORECASE)
            for match in matches:
                task = {
                    "taskName": self._clean_task_name(match.group(1)),
                    "assignee": self._clean_assignee_name(match.group(2)),
                    "dueDate": self._parse_fallback_date(match.group(3)),
                    "dueTime": "17:00",
                    "priority": "P3"
                }
                
                if task["taskName"] and task["assignee"]:
                    tasks.append(task)
        
        # If no tasks found, create a generic task
        if not tasks:
            tasks.append({
                "taskName": "Task from natural language input",
                "assignee": "Unassigned",
                "dueDate": (datetime.now() + timedelta(days=1)).strftime("%Y-%m-%d"),
                "dueTime": "17:00",
                "priority": "P3"
            })
        
        return {"tasks": tasks}
    
    def _parse_fallback_date(self, date_str: str) -> str:
        """Parse date in fallback mode"""
        today = datetime.now()
        
        if "tomorrow" in date_str.lower():
            return (today + timedelta(days=1)).strftime("%Y-%m-%d")
        elif "today" in date_str.lower():
            return today.strftime("%Y-%m-%d")
        else:
            # Default to tomorrow
            return (today + timedelta(days=1)).strftime("%Y-%m-%d")

    async def health_check(self) -> Dict[str, Any]:
        """Check if NLP service is healthy"""
        try:
            # Test OpenAI connection
            openai_status = self.openai_service.test_connection()
            
            return {
                "status": "healthy" if openai_status else "degraded",
                "openai_connection": openai_status,
                "fallback_available": True,
                "timestamp": datetime.now().isoformat()
            }
        except Exception as e:
            logger.error(f"Health check failed: {e}")
            return {
                "status": "unhealthy",
                "error": str(e),
                "timestamp": datetime.now().isoformat()
            }