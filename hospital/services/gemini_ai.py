"""
Multi-AI Service for Health Chatbot
Supports both Gemini and GROQ with automatic fallback
"""

import os
from typing import List, Dict, Optional

# Load environment variables
try:
    from dotenv import load_dotenv
    import os
    env_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), '.env')
    if os.path.exists(env_path):
        load_dotenv(env_path)
    else:
        load_dotenv() # Fallback to default search
except ImportError:
    pass

# AI availability check will happen during initialization
GEMINI_AVAILABLE = True # Assume potentially available
GROQ_AVAILABLE = True
genai = None
Groq = None


class MultiAIHealthChatbot:
    """AI-powered health chatbot supporting multiple AI providers."""
    
    SYSTEM_PROMPT = """You are a helpful AI health assistant for a hospital management system called MediCare Pro. 

Your role is to:
1. Provide general health guidance and information (NOT medical diagnosis)
2. Help patients prepare for doctor visits by asking about symptoms
3. Suggest when someone should seek immediate medical attention
4. Provide wellness tips and general health education

IMPORTANT RULES:
- NEVER provide specific medical diagnoses
- ALWAYS recommend consulting a healthcare professional for serious concerns
- If someone describes emergency symptoms (chest pain, difficulty breathing, severe bleeding, loss of consciousness), immediately advise them to call emergency services or go to the ER
- Keep responses concise but helpful (2-4 paragraphs max)
- Be empathetic and supportive
- Use simple language that patients can understand
- LANGUAGE ADAPTABILITY: Always respond in the SAME language as the user's query. 
    - If the user asks in English, reply in **English**.
    - If the user asks in Hindi, reply in **Hindi**.
    - If the user asks in Hinglish (English+Hindi), reply in **Hinglish**.
- FOLLOW-UP QUESTIONS: At the VERY END of your response, provide exactly 3 helpful follow-up questions in the SAME language as your response. 
  Format them like this:
  Suggestion: [First suggestion]
  Suggestion: [Second suggestion]
  Suggestion: [Third suggestion]

Remember: You are a health ASSISTANT, not a doctor. Your goal is to help patients communicate better with their healthcare providers. My name is MediCare Pro AI Assistant."""

    def __init__(self):
        global genai, Groq, GEMINI_AVAILABLE, GROQ_AVAILABLE
        self.gemini_key = os.environ.get('GEMINI_API_KEY')
        self.groq_key = os.environ.get('GROQ_API_KEY')
        
        self.gemini_model = None
        self.groq_client = None
        self.active_provider = None
        self.init_error = None
        
        # Lazy imports to prevent server crash during startup if libraries are broken
        if Groq is None:
            try:
                from groq import Groq as GroqClient
                Groq = GroqClient
                GROQ_AVAILABLE = True
            except ImportError:
                GROQ_AVAILABLE = False
                print("[AI] GROQ library NOT found.")
        
        if genai is None:
            try:
                import google.generativeai as genai_lib
                genai = genai_lib
                GEMINI_AVAILABLE = True
            except Exception as e:
                GEMINI_AVAILABLE = False
                print(f"[AI] Gemini library error: {e}")

        print(f"[AI] GEMINI_AVAILABLE: {GEMINI_AVAILABLE}")
        print(f"[AI] GROQ_AVAILABLE: {GROQ_AVAILABLE}")
        print(f"[AI] Gemini Key present: {bool(self.gemini_key)}")
        print(f"[AI] GROQ Key present: {bool(self.groq_key)}")
        
        # Try to initialize GROQ first (more reliable)
        if GROQ_AVAILABLE and self.groq_key:
            try:
                self.groq_client = Groq(api_key=self.groq_key)
                self.active_provider = "groq"
                print("[AI] Successfully initialized GROQ!")
            except Exception as e:
                print(f"[AI] GROQ initialization failed: {e}")
                self.groq_client = None
        
        # Fallback to Gemini if GROQ not available
        if not self.active_provider and GEMINI_AVAILABLE and self.gemini_key:
            try:
                genai.configure(api_key=self.gemini_key)
                # Use the stable Gemini model
                self.gemini_model = genai.GenerativeModel('gemini-1.5-flash')
                self.active_provider = "gemini"
                print("[AI] Successfully initialized Gemini AI!")
            except Exception as e:
                print(f"[AI] Gemini initialization failed: {e}")
                self.gemini_model = None
        
        if not self.active_provider:
            self.init_error = "No AI provider available. Please configure GROQ_API_KEY or GEMINI_API_KEY"
            print(f"[AI] Error: {self.init_error}")
    
    def is_available(self) -> bool:
        """Check if any AI provider is available."""
        return self.active_provider is not None
    
    def _check_emergency(self, message: str) -> Optional[Dict]:
        """Check for emergency keywords and return immediate response if found."""
        emergency_keywords = [
            'chest pain', 'heart attack', 'can\'t breathe', 'cannot breathe',
            'difficulty breathing', 'severe bleeding', 'unconscious', 
            'stroke', 'seizure', 'overdose', 'suicide', 'kill myself'
        ]
        
        message_lower = message.lower()
        for keyword in emergency_keywords:
            if keyword in message_lower:
                return {
                    'reply': (
                        "⚠️ **This sounds like a medical emergency!**\n\n"
                        "Please take immediate action:\n"
                        "1. **Call emergency services** (911 or your local emergency number)\n"
                        "2. If you're with someone, ask them to help\n"
                        "3. Stay calm and follow emergency operator instructions\n\n"
                        "Do not wait - get help now. Your safety is the priority."
                    ),
                    'type': 'emergency',
                    'provider': 'rule-based',
                    'suggestions': [
                        'Call emergency services immediately',
                        'Go to the nearest emergency room',
                        'Ask someone nearby for help'
                    ],
                    'disclaimer': 'This is an automated emergency response. Please seek immediate medical attention.'
                }
        return None
    
    def respond(self, message: str, context: List[Dict] = None) -> Dict:
        """Generate a response using available AI provider."""
        context = context or []
        
        # Check for emergencies first
        emergency_response = self._check_emergency(message)
        if emergency_response:
            return emergency_response
        
        # If no AI is available, return fallback
        if not self.is_available():
            print("[AI] No provider available, using fallback")
            return self._fallback_response(message)
        
        # Try active provider
        try:
            if self.active_provider == "groq":
                return self._groq_respond(message, context)
            elif self.active_provider == "gemini":
                return self._gemini_respond(message, context)
        except Exception as e:
            print(f"[AI] Error: {self.active_provider} error: {str(e)}")
            # Log the specific error to help with debugging
            try:
                import traceback
                traceback.print_exc()
            except:
                pass
            return self._fallback_response(message)
    
    def _groq_respond(self, message: str, context: List[Dict]) -> Dict:
        """Generate response using GROQ."""
        # Build conversation history
        messages = [{"role": "system", "content": self.SYSTEM_PROMPT}]
        
        # Add recent context
        for turn in context[-6:]:
            role = "user" if turn.get('role') == 'user' else "assistant"
            messages.append({"role": role, "content": turn.get('message', '')})
        
        # Add current message
        messages.append({"role": "user", "content": message})
        
        print(f"[AI] Sending message to GROQ...")
        
        # Get response from GROQ
        response = self.groq_client.chat.completions.create(
            messages=messages,
            model="llama-3.3-70b-versatile",  # Fast and high quality
            max_tokens=500,
            temperature=0.7
        )
        
        reply_text = response.choices[0].message.content
        print(f"[AI] Received response from GROQ")
        
        # Extract suggestions from AI response if present
        ai_suggestions = []
        clean_reply = []
        
        for line in reply_text.split('\n'):
            if line.strip().lower().startswith('suggestion:'):
                sug = line.split(':', 1)[1].strip()
                if sug: ai_suggestions.append(sug)
            else:
                clean_reply.append(line)
        
        final_reply = '\n'.join(clean_reply).strip()
        
        # Merge with rule-based suggestions if AI didn't provide enough
        suggestions = ai_suggestions if ai_suggestions else self._generate_suggestions(message, final_reply)
        
        return {
            'reply': final_reply,
            'type': 'ai_response',
            'provider': 'groq',
            'model': 'llama-3.3-70b-versatile',
            'suggestions': suggestions,
            'disclaimer': 'I am an AI assistant, not a medical professional. For medical advice, please consult a healthcare provider.'
        }
    
    def _gemini_respond(self, message: str, context: List[Dict]) -> Dict:
        """Generate response using Gemini."""
        # Build conversation history
        chat_history = []
        
        if not context:
            chat_history.append({
                'role': 'user',
                'parts': ['You are a healthcare assistant. Please introduce yourself.']
            })
            chat_history.append({
                'role': 'model',
                'parts': [self.SYSTEM_PROMPT]
            })
        
        for turn in context[-6:]:
            role = 'user' if turn.get('role') == 'user' else 'model'
            chat_history.append({
                'role': role,
                'parts': [turn.get('message', '')]
            })
        
        # Start chat
        chat = self.gemini_model.start_chat(history=chat_history)
        
        print(f"[AI] Sending message to Gemini...")
        response = chat.send_message(message)
        reply_text = response.text
        print(f"[AI] Received response from Gemini")
        
        # Extract suggestions from AI response if present
        ai_suggestions = []
        clean_reply = []
        
        for line in reply_text.split('\n'):
            if line.strip().lower().startswith('suggestion:'):
                sug = line.split(':', 1)[1].strip()
                if sug: ai_suggestions.append(sug)
            else:
                clean_reply.append(line)
        
        final_reply = '\n'.join(clean_reply).strip()
        
        # Merge with rule-based suggestions if AI didn't provide enough
        suggestions = ai_suggestions if ai_suggestions else self._generate_suggestions(message, final_reply)
        
        return {
            'reply': final_reply,
            'type': 'ai_response',
            'provider': 'gemini',
            'model': 'gemini-1.5-flash',
            'suggestions': suggestions,
            'disclaimer': 'I am an AI assistant, not a medical professional. For medical advice, please consult a healthcare provider.'
        }
    
    def _generate_suggestions(self, user_message: str, ai_response: str) -> List[str]:
        """Generate helpful follow-up suggestions."""
        suggestions = []
        message_lower = user_message.lower()
        
        if any(word in message_lower for word in ['pain', 'ache', 'hurt']):
            suggestions.extend([
                'How long have you had this pain?',
                'On a scale of 1-10, how severe is it?',
                'Does anything make it better or worse?'
            ])
        elif any(word in message_lower for word in ['fever', 'temperature', 'hot']):
            suggestions.extend([
                'What is your current temperature?',
                'How long have you had the fever?',
                'Are you experiencing any other symptoms?'
            ])
        elif any(word in message_lower for word in ['appointment', 'doctor', 'visit']):
            suggestions.extend([
                'What symptoms should I mention to my doctor?',
                'How should I prepare for my appointment?',
                'What questions should I ask my doctor?'
            ])
        else:
            suggestions.extend([
                'Tell me more about your symptoms',
                'How can I prepare for a doctor visit?',
                'What should I do next?'
            ])
        
        return suggestions[:3]
    
    def _fallback_response(self, message: str) -> Dict:
        """Provide a helpful response when AI is not available."""
        return {
            'reply': (
                "The AI health assistant is currently unavailable. Please contact your administrator to configure the service."
            ),
            'type': 'fallback',
            'provider': 'none',
            'suggestions': [
                'Describe your symptoms in detail',
                'How should I prepare for my doctor visit?',
                'What should I tell my doctor?'
            ],
            'disclaimer': 'AI service is in limited mode. Please consult a healthcare provider for medical advice.'
        }


# Backward compatibility - use the multi-AI chatbot
GeminiHealthChatbot = MultiAIHealthChatbot
