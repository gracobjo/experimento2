import React, { useState, useEffect, useRef } from 'react';
import chatbotApi from '../../api/chatbot';
import AppointmentCalendar from '../AppointmentCalendar';

interface ChatMessage {
  text: string;
  isUser: boolean;
  timestamp: string;
}

const ChatbotWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const [appointmentData, setAppointmentData] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  // user_id persistente por sesión
  const userIdRef = useRef('user_' + Math.random().toString(36).substring(2, 12));
  // Timers de inactividad
  const inactivityTimer = useRef<NodeJS.Timeout | null>(null);
  const warningTimer = useRef<NodeJS.Timeout | null>(null);

  // Mensaje de bienvenida
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          text: "¡Hola! Soy el asistente virtual del despacho legal. ¿En qué puedo ayudarte hoy?",
          isUser: false,
          timestamp: new Date().toISOString()
        }
      ]);
    }
  }, [isOpen, messages.length]);

  // Auto-scroll al último mensaje
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Mantener foco en el input cuando se abre el chat
  useEffect(() => {
    if (isOpen && inputRef.current && !showCalendar) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen, showCalendar]);

  // Timeout de inactividad y advertencia
  const resetInactivityTimer = () => {
    if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    if (warningTimer.current) clearTimeout(warningTimer.current);
    
    // Solo iniciar timers si el chat está abierto y no se muestra el calendario
    if (isOpen && !showCalendar) {
      // A los 50s muestra advertencia
      warningTimer.current = setTimeout(() => {
        if (isOpen && !showCalendar) {
          setMessages(prev => [...prev, {
            text: '⚠️ No hay actividad. El chat se cerrará automáticamente en 10 segundos si no respondes.',
            isUser: false,
            timestamp: new Date().toISOString()
          }]);
        }
      }, 50000);
      
      // A los 60s cierra el chat automáticamente
      inactivityTimer.current = setTimeout(() => {
        if (isOpen && !showCalendar) {
          handleEndChat();
        }
      }, 60000);
    }
  };

  // Reiniciar temporizador en cada mensaje
  useEffect(() => {
    if (isOpen && messages.length > 0 && !showCalendar) {
      resetInactivityTimer();
    }
    return () => {
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
      if (warningTimer.current) clearTimeout(warningTimer.current);
    };
  }, [messages, isOpen, showCalendar]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleEndChat = async () => {
    // Limpiar timers inmediatamente
    if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    if (warningTimer.current) clearTimeout(warningTimer.current);
    
    try {
      await chatbotApi.post('/end_chat', { user_id: userIdRef.current });
    } catch (e) {
      // Ignorar error
    }
    
    // Cerrar chat
    setMessages([]);
    setInputMessage('');
    setError(null);
    setIsOpen(false);
    setShowCalendar(false);
    setAppointmentData(null);
    
    // Mostrar mensaje de confirmación
    setTimeout(() => {
      alert('El chat ha finalizado.');
    }, 100);
  };

  const handleDateSelect = async (date: string, time: string) => {
    console.log('handleDateSelect called with:', { date, time });
    
    // Validar que los parámetros no sean undefined o vacíos
    if (!date || !time || date.trim() === '' || time.trim() === '') {
      console.error('Invalid date or time:', { date, time });
      const errorMessage: ChatMessage = {
        text: "Error: Fecha o hora no válida. Por favor, selecciona de nuevo.",
        isUser: false,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
      return;
    }
    
    setShowCalendar(false);
    
    try {
      // Validar formato de fecha (YYYY-MM-DD)
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(date)) {
        throw new Error(`Invalid date format: ${date}. Expected YYYY-MM-DD`);
      }
      
      // Validar formato de hora (HH:MM)
      const timeRegex = /^\d{1,2}:\d{2}$/;
      if (!timeRegex.test(time)) {
        throw new Error(`Invalid time format: ${time}. Expected HH:MM`);
      }
      
      // Formatear la fecha y hora para el chatbot
      const selectedDateTime = `${date}T${time}:00`;
      console.log('selectedDateTime:', selectedDateTime);
      
      const formattedDate = new Date(selectedDateTime);
      console.log('formattedDate:', formattedDate);
      
      // Validar que la fecha sea válida
      if (isNaN(formattedDate.getTime())) {
        throw new Error(`Invalid date: ${selectedDateTime}`);
      }
      
      const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
      const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                     'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
      
      const dayName = days[formattedDate.getDay()];
      const dayNumber = formattedDate.getDate();
      const monthName = months[formattedDate.getMonth()];
      
      // Validar que todos los valores sean válidos
      if (!dayName || !monthName || isNaN(dayNumber)) {
        throw new Error(`Invalid date components: day=${dayName}, month=${monthName}, date=${dayNumber}`);
      }
      
      const formattedDateStr = `${dayName} ${dayNumber} de ${monthName} a las ${time}`;
      console.log('formattedDateStr:', formattedDateStr);
      
      // Agregar mensaje del usuario mostrando la selección
      const userChatMessage: ChatMessage = {
        text: `He seleccionado: ${formattedDateStr}`,
        isUser: true,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, userChatMessage]);
      
      // Enviar al chatbot
      setIsLoading(true);
      const response = await chatbotApi.post('/chat', {
        text: formattedDateStr,
        language: 'es',
        user_id: userIdRef.current
      });

      const botMessage: ChatMessage = {
        text: response.data.response,
        isUser: false,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, botMessage]);
    } catch (err: any) {
      console.error('Error in handleDateSelect:', err);
      const errorMessage = err.message || 'Error desconocido';
      const fallbackMessage: ChatMessage = {
        text: `Lo siento, hubo un problema al procesar tu selección: ${errorMessage}. Por favor, intenta de nuevo.`,
        isUser: false,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, fallbackMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');
    setIsLoading(true);
    setError(null);

    // Agregar mensaje del usuario
    const userChatMessage: ChatMessage = {
      text: userMessage,
      isUser: true,
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, userChatMessage]);

    try {
      // Enviar mensaje al chatbot
      const response = await chatbotApi.post('/chat', {
        text: userMessage,
        language: 'es',
        user_id: userIdRef.current
      });

      const botResponse = response.data.response;

      // Detectar si es una respuesta a entrada imprecisa (menú después de entrada corta)
      const impreciseInputs = ['si', 'sí', 'vale', 'ok', 'claro', 'jj', 'a', 'x', '123', 'abc', 'xyz'];
      const isImpreciseResponse = botResponse.includes('Para ayudarte mejor') && 
                                 botResponse.includes('¿En qué puedo ayudarte?') &&
                                 (userMessage.length < 10 || 
                                  impreciseInputs.includes(userMessage.toLowerCase()));

      // Agregar respuesta del chatbot con formato mejorado si es imprecisa
      let formattedResponse = botResponse;
      if (isImpreciseResponse) {
        formattedResponse = `**Has indicado:** "${userMessage}"\n\n${botResponse}`;
      }

      const botMessage: ChatMessage = {
        text: formattedResponse,
        isUser: false,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, botMessage]);

      // Detectar si el chatbot está pidiendo seleccionar fecha específicamente
      // Solo mostrar calendario si es una solicitud específica de fecha, no el menú principal
      if (botResponse.includes('¿Qué fecha prefieres para tu consulta?') && 
          botResponse.includes('Opciones disponibles:') &&
          botResponse.includes('Responde con el número de la opción que prefieras')) {
        // Mostrar calendario visual solo para selección de fecha específica
        setShowCalendar(true);
      }

    } catch (err: any) {
      console.error('Error sending message:', err);
      setError('Error al enviar el mensaje. Por favor, intenta de nuevo.');
      
      // Mensaje de fallback
      const fallbackMessage: ChatMessage = {
        text: "Lo siento, estoy teniendo problemas para procesar tu mensaje. Por favor, intenta de nuevo o contacta directamente al despacho.",
        isUser: false,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, fallbackMessage]);
    } finally {
      setIsLoading(false);
      // Mantener foco en el input después de enviar (solo si no se muestra el calendario)
      if (!showCalendar) {
        setTimeout(() => {
          inputRef.current?.focus();
        }, 100);
      }
    }
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setError(null);
      setShowCalendar(false);
      setAppointmentData(null);
      // Limpiar timers cuando se cierra manualmente
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
      if (warningTimer.current) clearTimeout(warningTimer.current);
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Botón del chat */}
      <button
        onClick={toggleChat}
        className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg transition-all duration-200"
        title="Chat del despacho"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      </button>

      {/* Calendario de citas */}
      <AppointmentCalendar
        isVisible={showCalendar}
        onDateSelect={handleDateSelect}
        onClose={() => setShowCalendar(false)}
      />

      {/* Ventana del chat */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-96 h-96 bg-white rounded-lg shadow-xl border border-gray-200 flex flex-col">
          {/* Header */}
          <div className="bg-blue-600 text-white p-4 rounded-t-lg">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold">Asistente Virtual</h3>
              <button
                onClick={toggleChat}
                className="text-white hover:text-gray-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p className="text-sm opacity-90">Despacho Legal</p>
          </div>

          {/* Mensajes */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs px-3 py-2 rounded-lg ${
                    message.isUser
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  <p className="text-sm">{message.text}</p>
                  <p className={`text-xs mt-1 ${
                    message.isUser ? 'text-blue-100' : 'text-gray-500'
                  }`}>
                    {formatTime(message.timestamp)}
                  </p>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-800 max-w-xs px-3 py-2 rounded-lg">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="flex justify-start">
                <div className="bg-red-100 text-red-800 max-w-xs px-3 py-2 rounded-lg">
                  <p className="text-sm">{error}</p>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={sendMessage} className="p-4 border-t border-gray-200">
            <div className="flex space-x-2">
              <input
                ref={inputRef}
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Escribe tu mensaje..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isLoading || showCalendar}
              />
              <button
                type="submit"
                disabled={isLoading || !inputMessage.trim() || showCalendar}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </form>
          
          {/* Botón finalizar chat */}
          <div className="p-2 border-t border-gray-200 flex justify-end">
            <button
              onClick={handleEndChat}
              className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
            >
              Finalizar chat
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatbotWidget; 