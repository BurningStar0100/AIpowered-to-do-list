import openai
import json
import logging
from typing import Dict, Any, List
from config import Config

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class OpenAIService:
    def __init__(self):
        """Initialize OpenAI client with API key"""
        openai.api_key = Config.OPENAI_API_KEY
        self.client = openai.OpenAI(api_key=Config.OPENAI_API_KEY)
        
    def create_parsing_prompt(self, text: str) -> str:
        """Create a detailed prompt for task parsing"""
        return f"""
You are a task parsing assistant. Parse the given natural language text and extract task information.

IMPORTANT: Extract ALL tasks mentioned in the text, even if multiple tasks are assigned to different people.

Rules:
1. Extract task name, assignee, due date, due time, and priority
2. If no priority is mentioned, default to "P3"
3. Convert relative dates to absolute dates (e.g., "tomorrow" to YYYY-MM-DD format)
4. Convert times to 24-hour format (HH:MM)
5. If no time is specified, default to "17:00" (5 PM)
6. Today's date is 2025-06-13 for reference

Output format: Return ONLY a valid JSON object with this exact structure:
{{
  "tasks": [
    {{
      "taskName": "string",
      "assignee": "string", 
      "dueDate": "YYYY-MM-DD",
      "dueTime": "HH:MM",
      "priority": "P1|P2|P3|P4"
    }}
  ]
}}

Examples:
Input: "Finish landing page Aman by 11pm 20th June, Call client Rajeev tomorrow 5pm"
Output: {{
  "tasks": [
    {{
      "taskName": "Finish landing page",
      "assignee": "Aman",
      "dueDate": "2025-06-20",
      "dueTime": "23:00",
      "priority": "P3"
    }},
    {{
      "taskName": "Call client",
      "assignee": "Rajeev", 
      "dueDate": "2025-06-14",
      "dueTime": "17:00",
      "priority": "P3"
    }}
  ]
}}

Input: "Send report to John by 9am Monday P1 priority, Review proposal Sarah Wednesday 2pm"
Output: {{
  "tasks": [
    {{
      "taskName": "Send report",
      "assignee": "John",
      "dueDate": "2025-06-16",
      "dueTime": "09:00", 
      "priority": "P1"
    }},
    {{
      "taskName": "Review proposal",
      "assignee": "Sarah",
      "dueDate": "2025-06-18",
      "dueTime": "14:00",
      "priority": "P3"
    }}
  ]
}}

Now parse this text:
"{text}"
"""

    async def parse_tasks(self, text: str) -> Dict[str, Any]:
        """Parse natural language text into structured task data"""
        try:
            logger.info(f"Parsing text: {text[:100]}...")
            
            prompt = self.create_parsing_prompt(text)
            
            response = self.client.chat.completions.create(
                model=Config.OPENAI_MODEL,
                messages=[
                    {
                        "role": "system", 
                        "content": "You are a precise task parsing assistant. Always return valid JSON."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                max_tokens=Config.OPENAI_MAX_TOKENS,
                temperature=Config.OPENAI_TEMPERATURE,
                response_format={"type": "json_object"}
            )
            
            content = response.choices[0].message.content.strip()
            logger.info(f"OpenAI response: {content}")
            
            # Parse JSON response
            try:
                parsed_data = json.loads(content)
            except json.JSONDecodeError as e:
                logger.error(f"JSON parsing error: {e}")
                # Try to extract JSON from response if it's wrapped in text
                import re
                json_match = re.search(r'\{.*\}', content, re.DOTALL)
                if json_match:
                    parsed_data = json.loads(json_match.group())
                else:
                    raise ValueError("Invalid JSON response from OpenAI")
            
            # Validate response structure
            if "tasks" not in parsed_data:
                raise ValueError("Response missing 'tasks' field")
            
            if not isinstance(parsed_data["tasks"], list):
                raise ValueError("'tasks' field must be an array")
            
            # Validate each task
            for i, task in enumerate(parsed_data["tasks"]):
                required_fields = ["taskName", "assignee", "dueDate", "dueTime", "priority"]
                for field in required_fields:
                    if field not in task:
                        raise ValueError(f"Task {i} missing required field: {field}")
                
                # Validate priority
                if task["priority"] not in ["P1", "P2", "P3", "P4"]:
                    logger.warning(f"Invalid priority {task['priority']}, defaulting to P3")
                    task["priority"] = "P3"
                
                # Validate date format
                import re
                if not re.match(r'^\d{4}-\d{2}-\d{2}$', task["dueDate"]):
                    raise ValueError(f"Invalid date format: {task['dueDate']}")
                
                # Validate time format
                if not re.match(r'^\d{2}:\d{2}$', task["dueTime"]):
                    raise ValueError(f"Invalid time format: {task['dueTime']}")
            
            logger.info(f"Successfully parsed {len(parsed_data['tasks'])} tasks")
            return parsed_data
            
        except openai.OpenAIError as e:
            logger.error(f"OpenAI API error: {e}")
            raise Exception(f"OpenAI API error: {str(e)}")
        except Exception as e:
            logger.error(f"Task parsing error: {e}")
            raise Exception(f"Failed to parse tasks: {str(e)}")

    def test_connection(self) -> bool:
        """Test if OpenAI API connection is working"""
        try:
            response = self.client.chat.completions.create(
                model=Config.OPENAI_MODEL,
                messages=[{"role": "user", "content": "Test"}],
                max_tokens=10
            )
            return True
        except Exception as e:
            logger.error(f"OpenAI connection test failed: {e}")
            return False