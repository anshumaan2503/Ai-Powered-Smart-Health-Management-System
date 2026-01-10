# 🤖 AI Health Assistant - Public Chatbot

## Overview

The AI Health Assistant is a **public, no-login-required** chatbot that provides general health guidance and information. It's accessible at `/aichatbot` and bypasses all authentication requirements.

## ✨ Features

### **Public Access**
- ✅ **No login required** - Anyone can use it
- ✅ **Direct URL access** - `http://localhost:3000/aichatbot`
- ✅ **Bypass authentication** - Works independently of user accounts
- ✅ **Mobile-friendly** - Responsive design

### **AI Capabilities**
- 🧠 **Gemini AI powered** - Advanced AI responses when configured
- 🔄 **Fallback system** - Rule-based responses when AI unavailable
- 💬 **Context awareness** - Remembers conversation history
- ⚡ **Real-time responses** - Instant chat experience

### **Safety Features**
- 🛡️ **Rate limiting** - 50 requests per hour per IP
- ⚠️ **Medical disclaimers** - Clear warnings about professional care
- 🔒 **Input validation** - Message length and content checks
- 📝 **Conversation logging** - For quality and safety monitoring

## 🚀 Quick Start

### **For Users**
1. Visit: `http://localhost:3000/aichatbot`
2. Start chatting immediately - no signup needed!
3. Ask health questions, get symptom information, wellness tips

### **For Developers**
1. **Start the backend:**
   ```bash
   python start.py
   ```

2. **Start the frontend:**
   ```bash
   cd frontend && npm run dev
   ```

3. **Test the feature:**
   ```bash
   python test_public_chatbot.py
   ```

## 📡 API Endpoints

### **Public Chatbot API**
```http
POST /api/public/chatbot
Content-Type: application/json

{
  "message": "I have a headache, what should I do?",
  "context": [
    {"text": "Hello", "isUser": true},
    {"text": "Hi! How can I help?", "isUser": false}
  ]
}
```

**Response:**
```json
{
  "success": true,
  "response": "For headaches, try resting in a quiet, dark room...",
  "ai_type": "gemini",
  "timestamp": "2024-01-05T10:30:00Z",
  "disclaimer": "This is general health information only..."
}
```

### **Rate Limiting**
- **Limit**: 50 requests per hour per IP address
- **Response**: 429 Too Many Requests when exceeded
- **Reset**: Automatically resets every hour

## 🎯 Use Cases

### **For Patients**
- **Quick health questions** without creating accounts
- **Symptom information** and general guidance
- **Wellness tips** and preventive care advice
- **Emergency guidance** (when to seek immediate care)

### **For Hospitals**
- **Reduce call volume** with self-service health info
- **Patient education** before appointments
- **24/7 availability** for basic health questions
- **Triage assistance** for non-emergency concerns

### **For Public Health**
- **Health awareness** campaigns
- **Preventive care** information distribution
- **Symptom tracking** during health events
- **General wellness** promotion

## 🔧 Configuration

### **Environment Variables**
```env
# Optional: For advanced AI features
GEMINI_API_KEY=your_gemini_api_key_here

# Rate limiting (optional)
CHATBOT_RATE_LIMIT=50
CHATBOT_RATE_WINDOW=3600
```

### **Customization Options**
- **Rate limits** - Adjust in `hospital/routes/public_ai.py`
- **AI responses** - Modify prompts in AI service files
- **UI styling** - Update `frontend/app/aichatbot/page.tsx`
- **Disclaimers** - Edit medical warnings and notices

## 🛡️ Security & Safety

### **Input Validation**
- Maximum message length: 1000 characters
- Content filtering for inappropriate requests
- XSS protection and sanitization

### **Rate Limiting**
- IP-based request limiting
- Prevents abuse and spam
- Automatic cleanup of old requests

### **Medical Safety**
- Clear disclaimers on every response
- Emphasis on professional medical care
- No diagnostic or treatment advice
- Emergency contact information provided

### **Privacy**
- No user data collection
- No conversation storage (optional)
- IP addresses used only for rate limiting
- GDPR compliant design

## 🧪 Testing

### **Automated Tests**
```bash
# Test all functionality
python test_public_chatbot.py

# Test specific components
curl -X POST http://localhost:5000/api/public/chatbot \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello, test message"}'
```

### **Manual Testing**
1. Visit `/aichatbot` in browser
2. Try various health questions
3. Test rate limiting with multiple requests
4. Verify mobile responsiveness
5. Check error handling

## 🎨 UI Features

### **Chat Interface**
- **Real-time messaging** with typing indicators
- **Message history** with timestamps
- **Quick question buttons** for easy start
- **Responsive design** for all devices

### **User Experience**
- **No registration required** - instant access
- **Clear disclaimers** - medical safety first
- **Professional design** - trustworthy appearance
- **Accessibility** - screen reader friendly

### **Visual Elements**
- **Gradient backgrounds** - modern appearance
- **Icon integration** - clear visual hierarchy
- **Animation effects** - smooth interactions
- **Loading states** - clear feedback

## 🔗 Integration

### **Landing Page Integration**
The AI chatbot is prominently featured on the main landing page:
- **"Try AI Health Assistant - No Login Required"** button
- Direct link to `/aichatbot`
- Highlighted as a key feature

### **Navigation**
- **Standalone route** - `/aichatbot`
- **Back to Hospital** link for easy navigation
- **Clear chat** functionality
- **Mobile-friendly** navigation

## 📊 Analytics & Monitoring

### **Usage Metrics** (Optional)
- Number of conversations started
- Most common question types
- Response satisfaction (if implemented)
- Peak usage times

### **Performance Monitoring**
- API response times
- Error rates and types
- Rate limiting effectiveness
- AI service availability

## 🚀 Future Enhancements

### **Planned Features**
- **Voice input/output** - Speech recognition and synthesis
- **Multi-language support** - International accessibility
- **Symptom checker** - Interactive health assessment
- **Appointment booking** - Direct integration with hospital systems

### **Advanced AI Features**
- **Medical image analysis** - Upload and analyze medical images
- **Prescription reading** - OCR for prescription analysis
- **Health tracking** - Basic vital signs monitoring
- **Personalized advice** - Based on user preferences (optional)

## 📞 Support

### **For Users**
- **Emergency**: Call your local emergency number
- **Technical issues**: Contact hospital IT support
- **Medical questions**: Consult healthcare professionals

### **For Developers**
- **Documentation**: See main project README
- **Issues**: Check troubleshooting guides
- **Testing**: Use provided test scripts
- **Configuration**: Review environment variables

---

**🎉 The AI Health Assistant is now live at `/aichatbot` - no login required!**

**Perfect for:**
- Quick health questions
- General wellness information  
- Symptom guidance
- Emergency direction
- 24/7 health support

**Remember:** This is a supplement to, not a replacement for, professional medical care.