# 🤖 Guía de Integración del Chatbot - Sistema de Gestión Legal

## 📋 Descripción

Esta guía documenta la integración completa del chatbot inteligente con el frontend del sistema de gestión legal. El chatbot está desplegado en Railway y proporciona asistencia automatizada 24/7.

## 🚀 URLs del Sistema

### **Servicios Desplegados:**
- **Frontend:** `https://experimento2-fenm.vercel.app`
- **Backend:** `https://experimento2-production.up.railway.app`
- **Chatbot:** `https://chatbot-legal-production.up.railway.app`

## 🔧 Configuración del Chatbot

### **Variables de Entorno Configuradas:**
```env
# URLs del sistema
BACKEND_URL=https://experimento2-production.up.railway.app
FRONTEND_URL=https://experimento2-fenm.vercel.app

# Configuración del servidor
PORT=8000
HOST=0.0.0.0

# Configuración de logging
LOG_LEVEL=INFO
CLEANUP_INTERVAL=300

# CORS
ALLOWED_ORIGINS=http://localhost:5173,https://experimento2-fenm.vercel.app,https://experimento2-production.up.railway.app
```

## 📊 Endpoints del Chatbot

### **Health Check**
```bash
GET https://chatbot-legal-production.up.railway.app/health
```
**Response:**
```json
{
  "status": "healthy",
  "service": "chatbot",
  "timestamp": "2025-08-06T21:20:55.725052"
}
```

### **Chat HTTP**
```bash
POST https://chatbot-legal-production.up.railway.app/chat
Content-Type: application/json

{
  "text": "Hola, necesito ayuda legal",
  "language": "es"
}
```

### **WebSocket Chat**
```javascript
const ws = new WebSocket('wss://chatbot-legal-production.up.railway.app/ws');
```

### **End Chat**
```bash
POST https://chatbot-legal-production.up.railway.app/end_chat
```

## 🎯 Integración con Frontend

### **Paso 1: Agregar Variable de Entorno**

En el frontend, agregar en `.env`:
```env
VITE_CHATBOT_URL=https://chatbot-legal-production.up.railway.app
```

### **Paso 2: Crear Componente Chatbot**

Crear `frontend/src/components/Chatbot/ChatbotWidget.tsx`:

```typescript
import React, { useState, useEffect, useRef } from 'react';

interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

interface ChatbotWidgetProps {
  isOpen: boolean;
  onClose: () => void;
}

const ChatbotWidget: React.FC<ChatbotWidgetProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const chatbotUrl = import.meta.env.VITE_CHATBOT_URL || 'https://chatbot-legal-production.up.railway.app';

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      const response = await fetch(`${chatbotUrl}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          language: 'es'
        })
      });

      const data = await response.json();
      
      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: data.response,
        isUser: false,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: 'Lo siento, hubo un error. Inténtalo de nuevo.',
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(inputText);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-4 right-4 w-96 h-96 bg-white rounded-lg shadow-xl border border-gray-200 flex flex-col z-50">
      {/* Header */}
      <div className="bg-blue-600 text-white p-4 rounded-t-lg flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
            <span className="text-blue-600 text-lg">🤖</span>
          </div>
          <div>
            <h3 className="font-semibold">Asistente Legal</h3>
            <p className="text-sm opacity-90">En línea</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-white hover:text-gray-200 transition-colors"
          aria-label="Cerrar chat"
        >
          ✕
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-500">
            <p>¡Hola! Soy tu asistente virtual legal.</p>
            <p className="text-sm">¿En qué puedo ayudarte hoy?</p>
          </div>
        )}
        
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs px-4 py-2 rounded-lg ${
                message.isUser
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              <p className="text-sm">{message.text}</p>
              <p className="text-xs opacity-70 mt-1">
                {message.timestamp.toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 text-gray-800 max-w-xs px-4 py-2 rounded-lg">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200">
        <div className="flex space-x-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Escribe tu mensaje..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !inputText.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Enviar
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatbotWidget;
```

### **Paso 3: Crear Botón Flotante**

Crear `frontend/src/components/Chatbot/ChatbotButton.tsx`:

```typescript
import React from 'react';

interface ChatbotButtonProps {
  onOpen: () => void;
}

const ChatbotButton: React.FC<ChatbotButtonProps> = ({ onOpen }) => {
  return (
    <button
      onClick={onOpen}
      className="fixed bottom-4 right-4 w-16 h-16 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors flex items-center justify-center z-40"
      aria-label="Abrir chat con asistente virtual"
    >
      <span className="text-2xl">🤖</span>
    </button>
  );
};

export default ChatbotButton;
```

### **Paso 4: Integrar en Layout Principal**

Modificar `frontend/src/components/layout/Layout.tsx`:

```typescript
import React, { useState } from 'react';
import ChatbotWidget from '../Chatbot/ChatbotWidget';
import ChatbotButton from '../Chatbot/ChatbotButton';

// ... resto del código existente ...

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);

  // ... resto del código existente ...

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ... resto del layout existente ... */}
      
      {/* Chatbot */}
      <ChatbotButton onOpen={() => setIsChatbotOpen(true)} />
      <ChatbotWidget 
        isOpen={isChatbotOpen} 
        onClose={() => setIsChatbotOpen(false)} 
      />
    </div>
  );
};
```

## 🧪 Pruebas de Integración

### **1. Probar Health Check:**
```bash
curl https://chatbot-legal-production.up.railway.app/health
```

### **2. Probar Chat HTTP:**
```bash
curl -X POST https://chatbot-legal-production.up.railway.app/chat \
  -H "Content-Type: application/json" \
  -d '{"text": "Hola, necesito ayuda legal", "language": "es"}'
```

### **3. Probar desde Frontend:**
1. Abrir `https://experimento2-fenm.vercel.app`
2. Hacer clic en el botón flotante del chatbot
3. Enviar mensaje de prueba
4. Verificar respuesta

## 🎯 Funcionalidades del Chatbot

### **✅ Confirmadas:**
- ✅ **Información de servicios legales**
- ✅ **Gestión de honorarios**
- ✅ **Proceso de agendamiento de citas**
- ✅ **Procesamiento de lenguaje natural**
- ✅ **Respuestas contextuales**
- ✅ **Integración con backend**

### **🔄 Pendientes (mañana):**
- 🔄 **Widget de chat en frontend**
- 🔄 **Botón flotante**
- 🔄 **Integración WebSocket**
- 🔄 **Deploy final en Vercel**

## 📝 Variables de Entorno Requeridas

### **Frontend (.env):**
```env
VITE_API_URL=https://experimento2-production.up.railway.app/api
VITE_CHATBOT_URL=https://chatbot-legal-production.up.railway.app
```

### **Chatbot (Railway):**
```env
BACKEND_URL=https://experimento2-production.up.railway.app
FRONTEND_URL=https://experimento2-fenm.vercel.app
PORT=8000
HOST=0.0.0.0
LOG_LEVEL=INFO
CLEANUP_INTERVAL=300
ALLOWED_ORIGINS=http://localhost:5173,https://experimento2-fenm.vercel.app,https://experimento2-production.up.railway.app
```

## 🚀 Comandos de Despliegue

### **Para Mañana (cuando Vercel esté disponible):**

```bash
# 1. Agregar componentes del chatbot
git add frontend/src/components/Chatbot/

# 2. Modificar Layout
git add frontend/src/components/layout/Layout.tsx

# 3. Agregar variable de entorno
# Editar frontend/.env

# 4. Commit y push
git commit -m "Add chatbot integration"
git push origin main

# 5. Vercel hará deploy automáticamente
```

## 📊 Estado del Proyecto

### **✅ Completado Hoy:**
- ✅ **Backend** desplegado en Railway
- ✅ **Frontend** desplegado en Vercel
- ✅ **Chatbot** desplegado en Railway
- ✅ **Base de datos** configurada
- ✅ **Variables de entorno** configuradas
- ✅ **Endpoints** funcionando
- ✅ **Pruebas** exitosas

### **🔄 Pendiente Mañana:**
- 🔄 **Integración frontend-chatbot**
- 🔄 **Deploy final** en Vercel
- 🔄 **Pruebas completas** del sistema

## 🎯 URLs Finales

- **Frontend:** `https://experimento2-fenm.vercel.app`
- **Backend:** `https://experimento2-production.up.railway.app`
- **Chatbot:** `https://chatbot-legal-production.up.railway.app`
- **API Docs:** `https://experimento2-production.up.railway.app/api`

---

**Documentación creada:** 6 de Agosto, 2025  
**Estado:** Listo para integración mañana  
**Versión:** 1.0.0 