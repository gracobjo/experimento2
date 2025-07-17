import React, { useState } from 'react';

const ChatbotBanner = () => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-20 right-4 z-40 bg-blue-600 text-white p-4 rounded-lg shadow-lg max-w-sm animate-pulse">
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-sm">¿Necesitas ayuda legal?</h4>
          <p className="text-xs opacity-90 mt-1">
            Nuestro asistente virtual está aquí para ayudarte. Consulta gratuita disponible.
          </p>
        </div>
        <button
          onClick={() => setIsVisible(false)}
          className="text-white hover:text-gray-200"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default ChatbotBanner; 