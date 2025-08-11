import React from 'react';

interface ChatbotButtonProps {
  onOpen: () => void;
}

const ChatbotButton: React.FC<ChatbotButtonProps> = ({ onOpen }) => {
  return (
    <button
      onClick={onOpen}
      className="fixed bottom-4 right-20 w-16 h-16 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors flex items-center justify-center z-50"
      aria-label="Abrir chat con asistente virtual"
    >
      <span className="text-2xl">🤖</span>
    </button>
  );
};

export default ChatbotButton;
