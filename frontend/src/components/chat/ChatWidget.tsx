import React, { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

interface Message {
  id: string;
  content: string;
  senderId: string;
  senderName: string;
  receiverId: string;
  receiverName: string;
  createdAt: string;
  isOwnMessage: boolean;
}

interface Conversation {
  userId: string;
  userName: string;
  userEmail: string;
  userRole: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}

interface ConnectedUser {
  userId: string;
  name: string;
  role: string;
}

interface AvailableUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string>('');
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connectedUsers, setConnectedUsers] = useState<ConnectedUser[]>([]);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const [isTyping, setIsTyping] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [availableUsers, setAvailableUsers] = useState<AvailableUser[]>([]);
  const [showNewConversation, setShowNewConversation] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [showInactivityWarning, setShowInactivityWarning] = useState(false);
  const [inactivityCountdown, setInactivityCountdown] = useState(60);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);
  const inactivityWarningTimerRef = useRef<NodeJS.Timeout | null>(null);
  const { user } = useAuth();

  // Inicializar WebSocket
  useEffect(() => {
    if (!user || !isOpen) return;

    const token = localStorage.getItem('token');
    const newSocket = io(`${(import.meta as any).env.VITE_API_URL || 'https://experimento2-production.up.railway.app'}`, {
      auth: {
        token,
        user: {
          id: user.id,
          name: user.name,
          role: user.role,
        },
      },
    });

    newSocket.on('connect', () => {
      console.log('🔌 WebSocket connected:', newSocket.id);
    });

    newSocket.on('disconnect', () => {
      console.log('🔌 WebSocket disconnected');
    });

    newSocket.on('new_message', (message: Message) => {
      console.log('📨 Received new message:', message);
      setMessages(prev => [...prev, message]);
      
      // Actualizar conversación
      setConversations(prev => 
        prev.map(conv => 
          conv.userId === message.senderId 
            ? { ...conv, lastMessage: message.content, lastMessageTime: message.createdAt }
            : conv
        )
      );

      // Mostrar notificación si no está en la conversación activa
      if (selectedConversation !== message.senderId) {
        if ("Notification" in window && Notification.permission === "granted") {
          new Notification(message.senderName, { body: message.content });
        }
      }
    });

    newSocket.on('message_error', (data: { error: string }) => {
      console.error('❌ Message error:', data.error);
      setError(data.error);
    });

    newSocket.on('user_typing', (data: { userId: string; name: string; isTyping: boolean }) => {
      if (data.isTyping) {
        setTypingUsers(prev => new Set(prev).add(data.userId));
      } else {
        setTypingUsers(prev => {
          const newSet = new Set(prev);
          newSet.delete(data.userId);
          return newSet;
        });
      }
    });

    newSocket.on('user_connected', (user: ConnectedUser) => {
      setConnectedUsers(prev => [...prev, user]);
    });

    newSocket.on('user_disconnected', (user: ConnectedUser) => {
      setConnectedUsers(prev => prev.filter(u => u.userId !== user.userId));
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [user, isOpen]);

  useEffect(() => {
    if (isOpen) {
      fetchConversations();
      fetchAvailableUsers();
    }
  }, [isOpen]);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessagesWithUser(selectedConversation);
      setUnreadCount(0);
    }
  }, [selectedConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Efecto para manejar la inactividad
  useEffect(() => {
    if (!isOpen) return;

    const handleUserActivity = () => {
      resetInactivityTimer();
    };

    // Eventos que indican actividad del usuario
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    events.forEach(event => {
      document.addEventListener(event, handleUserActivity, true);
    });

    // Iniciar timer de inactividad
    resetInactivityTimer();

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleUserActivity, true);
      });
      
      // Limpiar timers al desmontar
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
      if (inactivityWarningTimerRef.current) {
        clearInterval(inactivityWarningTimerRef.current);
      }
    };
  }, [isOpen]);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await api.get('/chat/conversations', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setConversations(response.data);
      
      // Calcular total de mensajes no leídos
      const totalUnread = response.data.reduce((sum: number, conv: Conversation) => sum + conv.unreadCount, 0);
      setUnreadCount(totalUnread);
    } catch (err: any) {
      console.error('Error fetching conversations:', err);
      setError('Error al cargar las conversaciones');
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      let endpoint = '';
      
      if (user?.role === 'CLIENTE') {
        endpoint = '/users/lawyers';
      } else if (user?.role === 'ABOGADO') {
        endpoint = '/users/clients';
      } else {
        return;
      }

      const response = await api.get(endpoint, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Transformar los datos según el rol
      if (user?.role === 'ABOGADO') {
        // Para abogados, los clientes vienen con estructura anidada
        setAvailableUsers(response.data.map((client: any) => ({
          id: client.user.id,
          name: client.user.name,
          email: client.user.email,
          role: 'CLIENTE'
        })));
      } else {
        // Para clientes, los abogados vienen directamente
        setAvailableUsers(response.data.map((lawyer: any) => ({
          id: lawyer.id,
          name: lawyer.name,
          email: lawyer.email,
          role: 'ABOGADO'
        })));
      }
    } catch (err) {
      console.error('Error fetching available users:', err);
    }
  };

  const fetchMessagesWithUser = async (userId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await api.get(`/chat/messages/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages(response.data);
    } catch (err: any) {
      console.error('Error fetching messages:', err);
      setError('Error al cargar los mensajes');
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('🚀 SEND MESSAGE TRIGGERED!', { newMessage, selectedConversation, socket: !!socket });
    
    if (!newMessage.trim()) {
      setError('Por favor, escribe un mensaje');
      return;
    }
    
    if (!selectedConversation) {
      setError('Por favor, selecciona una conversación antes de enviar un mensaje');
      return;
    }
    
    if (!socket) {
      setError('No hay conexión con el servidor. Inténtalo de nuevo en unos momentos.');
      return;
    }

    try {
      setSending(true);
      setError(null);
      
      // Crear mensaje temporal para mostrar inmediatamente
      const tempMessage: Message = {
        id: `temp-${Date.now()}`,
        content: newMessage,
        senderId: user!.id,
        senderName: user!.name,
        receiverId: selectedConversation,
        receiverName: conversations.find(c => c.userId === selectedConversation)?.userName || 
                     availableUsers.find(u => u.id === selectedConversation)?.name || 'Usuario',
        createdAt: new Date().toISOString(),
        isOwnMessage: true
      };

      // Agregar mensaje temporal al estado local inmediatamente
      setMessages(prev => [...prev, tempMessage]);
      
      console.log('📤 Sending message via WebSocket', { 
        receiverId: selectedConversation, 
        content: newMessage,
        socketId: socket.id 
      });
      
      // Limpiar el input
      const messageToSend = newMessage;
      setNewMessage('');
      
      socket.emit('send_message', {
        receiverId: selectedConversation,
        content: messageToSend
      });

      socket.emit('typing_stop', { receiverId: selectedConversation });
      setIsTyping(false);
      
      // Hacer scroll al final
      setTimeout(() => {
        scrollToBottom();
      }, 100);
      
      // Reiniciar timer de inactividad al enviar mensaje
      resetInactivityTimer();
      
      console.log('✅ Message sent successfully');
    } catch (err: any) {
      console.error('❌ Error sending message:', err);
      setError('Error al enviar el mensaje: ' + (err.message || 'Error desconocido'));
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (newMessage.trim() && !sending) {
        const fakeEvent = { preventDefault: () => {} } as React.FormEvent;
        handleSendMessage(fakeEvent);
      }
    }
  };

  const handleSelectConversation = (userId: string) => {
    setSelectedConversation(userId);
    setShowNewConversation(false);
    fetchMessagesWithUser(userId);
  };

  const handleStartNewConversation = (userId: string) => {
    setSelectedConversation(userId);
    setShowNewConversation(false);
    setMessages([]);
  };

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setNewMessage(e.target.value);
    
    if (!socket || !selectedConversation) return;

    if (!isTyping) {
      setIsTyping(true);
      socket.emit('typing_start', { receiverId: selectedConversation });
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      socket.emit('typing_stop', { receiverId: selectedConversation });
    }, 1000);
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 48) {
      return 'Ayer';
    } else {
      return date.toLocaleDateString();
    }
  };

  const isUserOnline = (userId: string) => {
    return connectedUsers.some(user => user.userId === userId);
  };

  const getAvatarInitial = (name: string) => {
    return name.charAt(0).toUpperCase();
  };

  // Función para reiniciar el timer de inactividad
  const resetInactivityTimer = () => {
    // Limpiar timers existentes
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }
    if (inactivityWarningTimerRef.current) {
      clearInterval(inactivityWarningTimerRef.current);
    }
    
    setShowInactivityWarning(false);
    setInactivityCountdown(60);
    
    // Iniciar nuevo timer de 60 segundos
    inactivityTimerRef.current = setTimeout(() => {
      setShowInactivityWarning(true);
      startInactivityCountdown();
    }, 60000); // 60 segundos
  };

  // Función para iniciar la cuenta regresiva
  const startInactivityCountdown = () => {
    const countdown = setInterval(() => {
      setInactivityCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdown);
          endChat();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    inactivityWarningTimerRef.current = countdown as any;
  };

  // Función para finalizar el chat
  const endChat = () => {
    // Limpiar historial
    setMessages([]);
    setConversations([]);
    setSelectedConversation('');
    setNewMessage('');
    setError(null);
    setUnreadCount(0);
    setShowInactivityWarning(false);
    setInactivityCountdown(60);
    
    // Cerrar chat
    setIsOpen(false);
    
    // Limpiar timers
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }
    if (inactivityWarningTimerRef.current) {
      clearInterval(inactivityWarningTimerRef.current);
    }
    
    // Notificar al backend que el chat ha terminado
    if (socket) {
      socket.emit('end_chat');
    }
    
    console.log('💬 Chat finalizado y historial limpiado');
  };

  // Función para extender el tiempo de inactividad
  const extendInactivityTime = () => {
    setShowInactivityWarning(false);
    setInactivityCountdown(60);
    resetInactivityTimer();
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setError(null);
      // Iniciar timer de inactividad cuando se abre el chat
      resetInactivityTimer();
    } else {
      // Limpiar historial y timers cuando se cierra el chat
      setMessages([]);
      setConversations([]);
      setSelectedConversation('');
      setNewMessage('');
      setError(null);
      setUnreadCount(0);
      
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
      if (inactivityWarningTimerRef.current) {
        clearInterval(inactivityWarningTimerRef.current);
      }
      setShowInactivityWarning(false);
      setInactivityCountdown(60);
      
      // Notificar al backend que el chat ha terminado
      if (socket) {
        socket.emit('end_chat');
      }
    }
  };


  const handleResetConversation = () => {
    setMessages([]);
    // Opcional: podrías emitir un evento al backend si quieres reiniciar en el servidor
  };

  // Solo mostrar el widget si el usuario está autenticado
  if (!user) {
    return null;
  }

  return (
    <>
      {/* Chat Button */}
      <button
        onClick={toggleChat}
        className="fixed bottom-4 right-4 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 z-50"
        aria-label={isOpen ? "Cerrar chat" : "Abrir chat"}
        aria-describedby="chat-button-help"
      >
        <svg className="w-6 h-6 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        {unreadCount > 0 && (
          <span 
            className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center"
            role="status"
            aria-label={`${unreadCount} mensaje${unreadCount > 1 ? 's' : ''} no leído${unreadCount > 1 ? 's' : ''}`}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>
      <div id="chat-button-help" className="sr-only">
        {isOpen ? "Cerrar la ventana de chat" : "Abrir la ventana de chat para enviar mensajes"}
      </div>

      {/* Chat Window */}
      {isOpen && (
        <div className={`fixed bottom-20 right-4 bg-white rounded-lg shadow-xl border z-50 flex flex-col transition-all duration-300 ${
          isMinimized ? 'w-80 h-96' : 'w-[450px] h-[600px]'
        }`}>
          {/* Header */}
          <div className="p-4 border-b bg-blue-600 text-white rounded-t-lg">
            <div className="flex justify-between items-center">
              <h3 className="font-medium">Chat</h3>
              <div className="flex items-center space-x-2">
                <button
                  onClick={endChat}
                  className="text-white hover:text-red-200 text-xs px-2 py-1 bg-red-600 rounded"
                  title="Finalizar chat"
                  aria-label="Finalizar chat"
                >
                  Finalizar
                </button>
                <button
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="text-white hover:text-gray-200"
                  aria-label={isMinimized ? "Maximizar chat" : "Minimizar chat"}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    {isMinimized ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4h16v16H4V4z" />
                    )}
                  </svg>
                </button>
                <button
                  onClick={toggleChat}
                  className="text-white hover:text-gray-200"
                  aria-label="Cerrar chat"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Advertencia de inactividad */}
          {showInactivityWarning && (
            <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <span className="text-sm font-medium">
                    El chat se cerrará automáticamente en {inactivityCountdown} segundos por inactividad
                  </span>
                </div>
                <button
                  onClick={extendInactivityTime}
                  className="ml-2 text-yellow-800 hover:text-yellow-900 text-sm font-medium underline"
                  aria-label="Mantener chat abierto por más tiempo"
                >
                  Mantener abierto
                </button>
              </div>
            </div>
          )}

          {/* Content */}
          <div className="flex-1 flex flex-col">
            {!selectedConversation ? (
              // Conversation List
              <div className="flex-1 overflow-y-auto p-4">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-medium text-gray-900">Conversaciones</h4>
                  <button
                    onClick={() => setShowNewConversation(!showNewConversation)}
                    className="text-blue-600 hover:text-blue-700 text-sm"
                    aria-label={showNewConversation ? "Cancelar nueva conversación" : "Iniciar nueva conversación"}
                  >
                    {showNewConversation ? 'Cancelar' : 'Nueva'}
                  </button>
                </div>
                
                {showNewConversation ? (
                  // New Conversation Selector
                  <div className="space-y-2">
                    <h5 className="text-sm font-medium text-gray-700 mb-2">
                      {user?.role === 'CLIENTE' ? 'Seleccionar Abogado' : 'Seleccionar Cliente'}
                    </h5>
                    {availableUsers.length === 0 ? (
                      <div className="text-center text-gray-500 text-sm">Cargando usuarios...</div>
                    ) : (
                      availableUsers.map((availableUser) => (
                        <div
                          key={availableUser.id}
                          onClick={() => handleStartNewConversation(availableUser.id)}
                          className="p-3 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                              <span className="text-white text-sm font-medium">
                                {getAvatarInitial(availableUser.name)}
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {availableUser.name}
                              </p>
                              <p className="text-xs text-gray-500 truncate">
                                {availableUser.email}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                ) : (
                  // Existing Conversations
                  <>
                    {loading ? (
                      <div className="text-center text-gray-500">Cargando...</div>
                    ) : conversations.length === 0 ? (
                      <div className="text-center text-gray-500">No hay conversaciones</div>
                    ) : (
                      <div className="space-y-2">
                        {conversations.map((conversation) => (
                          <div
                            key={conversation.userId}
                            onClick={() => handleSelectConversation(conversation.userId)}
                            className="p-3 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                          >
                            <div className="flex items-center space-x-3">
                              <div className="relative">
                                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                                  <span className="text-white text-sm font-medium">
                                    {getAvatarInitial(conversation.userName)}
                                  </span>
                                </div>
                                {isUserOnline(conversation.userId) && (
                                  <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-green-500 rounded-full border border-white"></div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start">
                                  <p className="text-sm font-medium text-gray-900 truncate">
                                    {conversation.userName}
                                  </p>
                                  <div className="text-xs text-gray-400">
                                    {formatTime(conversation.lastMessageTime)}
                                  </div>
                                </div>
                                <p className="text-xs text-gray-500 truncate">
                                  {conversation.lastMessage}
                                </p>
                                {conversation.unreadCount > 0 && (
                                  <div className="mt-1">
                                    <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                      {conversation.unreadCount}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            ) : (
              // Chat Area
              <>
                {/* Chat Header */}
                <div className="p-3 border-b bg-gray-50 flex items-center justify-between">
                  <div className="flex items-center">
                    <button
                      onClick={() => setSelectedConversation('')}
                      className="mr-2 text-gray-500 hover:text-gray-700"
                      aria-label="Volver a conversaciones"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <div className="relative">
                      <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-medium">
                          {getAvatarInitial(
                            conversations.find(c => c.userId === selectedConversation)?.userName ||
                            availableUsers.find(u => u.id === selectedConversation)?.name || 'U'
                          )}
                        </span>
                      </div>
                      {isUserOnline(selectedConversation) && (
                        <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-green-500 rounded-full border border-white"></div>
                      )}
                    </div>
                    <div className="ml-2">
                      <p className="text-sm font-medium text-gray-900">
                        {conversations.find(c => c.userId === selectedConversation)?.userName || 
                         availableUsers.find(u => u.id === selectedConversation)?.name || 'Usuario'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {isUserOnline(selectedConversation) ? 'En línea' : 'Desconectado'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handleResetConversation}
                      className="text-blue-600 hover:text-blue-800 text-xs px-2 py-1 border border-blue-200 rounded"
                      title="Reiniciar conversación"
                      aria-label="Reiniciar conversación"
                    >
                      Reiniciar
                    </button>
                    <button
                      onClick={toggleChat}
                      className="text-gray-500 hover:text-red-600 ml-2"
                      aria-label="Cerrar chat"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-3 space-y-2 max-h-[60vh] min-h-[200px]" style={{scrollBehavior: 'smooth'}}>
                  {messages.length === 0 ? (
                    <div className="text-center text-gray-500 text-sm">
                      No hay mensajes aún
                    </div>
                  ) : (
                    messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.isOwnMessage ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[280px] px-3 py-2 rounded-lg text-sm break-words ${
                            message.isOwnMessage
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-200 text-gray-900'
                          }`}
                        >
                          <div>{message.content}</div>
                          <div className={`text-xs mt-1 ${
                            message.isOwnMessage ? 'text-blue-100' : 'text-gray-500'
                          }`}>
                            {formatTime(message.createdAt)}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                  
                  {typingUsers.has(selectedConversation) && (
                    <div className="flex justify-start">
                      <div className="bg-gray-200 text-gray-900 px-3 py-2 rounded-lg text-sm">
                        Escribiendo...
                      </div>
                    </div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <form onSubmit={handleSendMessage} className="p-3 border-t">
                  <div className="flex space-x-2">
                    <div className="flex-1">
                      <label htmlFor="chat-message-input" className="sr-only">
                        Mensaje
                      </label>
                      <textarea
                        id="chat-message-input"
                        value={newMessage}
                        onChange={handleTyping}
                        placeholder={selectedConversation ? "Escribe tu mensaje..." : "Selecciona una conversación para enviar mensajes"}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[40px] max-h-[100px] resize-none"
                        disabled={sending || !selectedConversation}
                        rows={1}
                        onKeyDown={handleKeyDown}
                        aria-describedby="chat-message-help"
                      />
                      <div id="chat-message-help" className="sr-only">
                        Escriba su mensaje aquí. Presione Enter para enviar o use el botón de envío.
                      </div>
                    </div>
                    <button
                      type="submit"
                      disabled={!newMessage.trim() || sending || !selectedConversation}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed min-h-[40px] min-w-[40px]"
                      aria-label="Enviar mensaje"
                    >
                      {sending ? '...' : '→'}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>

          {error && (
            <div className="p-3 bg-red-50 border-t border-red-200">
              <div className="text-red-600 text-xs">{error}</div>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default ChatWidget; 