import React, { useState, useEffect } from 'react';
import { MessageSquare, Sparkles, Zap, BookOpen, ArrowRight, Bot } from 'lucide-react';
import { useNavigate } from "react-router-dom";

// Chatbot Icon Component
const ChatbotIcon = () => (
  <div className="relative">
    <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-green-500 rounded-3xl shadow-2xl flex items-center justify-center transform hover:scale-105 transition-all duration-300">
      <Bot size={64} className="text-white" />
    </div>
    <div className="absolute -top-2 -right-2 w-8 h-8 bg-blue-400 rounded-full flex items-center justify-center animate-pulse">
      <Sparkles size={16} className="text-white" />
    </div>
  </div>
);

// Floating particles background
const FloatingParticles = () => {
  const particles = Array.from({ length: 20 }, (_, i) => (
    <div
      key={i}
      className={`absolute w-2 h-2 bg-white rounded-full opacity-20 animate-pulse`}
      style={{
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        animationDelay: `${Math.random() * 3}s`,
        animationDuration: `${3 + Math.random() * 2}s`
      }}
    />
  ));
  
  return <div className="absolute inset-0 overflow-hidden">{particles}</div>;
};

// Feature Card Component
const FeatureCard = ({ icon, title, description, delay }) => (
  <div 
    className={`bg-white/10 backdrop-blur-md rounded-2xl p-6 transform hover:scale-105 transition-all duration-300 hover:bg-white/20 animate-fade-in-up`}
    style={{ animationDelay: `${delay}ms` }}
  >
    <div className="text-white/80 mb-4 flex justify-center">
      {icon}
    </div>
    <h3 className="text-white font-semibold text-lg mb-2">{title}</h3>
    <p className="text-white/70 text-sm">{description}</p>
  </div>
);

// Main Landing Page Component
const LandingPage = () => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const navigate = useNavigate();

  const handleStartChat = () => {
    navigate("/chat");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-green-900 to-black relative overflow-hidden">
      <FloatingParticles />
      
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-green-500/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>

      <div className="relative z-10 container mx-auto px-4 py-16 flex flex-col items-center justify-center min-h-screen">
        
        {/* Hero Section */}
        <div className={`text-center mb-16 transform transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          
          {/* Chatbot Icon */}
          <div className="mb-8 flex justify-center">
            <ChatbotIcon />
          </div>

          {/* Title */}
          <h1 className="text-6xl md:text-7xl font-bold text-white mb-4 bg-gradient-to-r from-blue-300 to-green-300 bg-clip-text text-transparent">
            RAG4HUST
          </h1>
          
          {/* Subtitle */}
          <p className="text-2xl text-white/80 mb-2 font-light">
            AI-Powered Knowledge Assistant
          </p>
          
          {/* Description */}
          <p className="text-lg text-white/60 max-w-2xl mx-auto leading-relaxed">
            Chatbot thông minh sử dụng công nghệ RAG (Retrieval-Augmented Generation) 
            để cung cấp câu trả lời chính xác và hữu ích cho sinh viên HUST
          </p>
          <p className="text-lg text-white/60 mb-8 max-w-2xl leading-relaxed">
            Tài liệu phục vụ việc trả lời câu hỏi được tham khảo từ mục "Sổ tay sinh viên" của Đại học Bách Khoa Hà Nội
          </p>

          {/* CTA Button */}
          <button 
            onClick={handleStartChat}
            className="group bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white font-semibold py-4 px-8 rounded-2xl shadow-2xl transform hover:scale-105 transition-all duration-300 flex items-center mx-auto text-lg"
          >
            <MessageSquare className="mr-3" size={24} />
            Bắt đầu trò chuyện
            <ArrowRight className="ml-3 group-hover:translate-x-1 transition-transform duration-300" size={24} />
          </button>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl w-full">
          <FeatureCard
            icon={<Zap size={32} />}
            title="Phản hồi nhanh"
            description="Trả lời câu hỏi trong tích tắc với độ chính xác cao"
            delay={200}
          />
          <FeatureCard
            icon={<BookOpen size={32} />}
            title="Kiến thức phong phú"
            description="Tích hợp kho tài liệu và kiến thức của HUST"
            delay={400}
          />
          <FeatureCard
            icon={<Sparkles size={32} />}
            title="AI thông minh"
            description="Sử dụng công nghệ RAG và LLM tiên tiến"
            delay={600}
          />
        </div>

        {/* Footer */}
        <div className="mt-16 text-center">
          <p className="text-white/40 text-sm">
            Được phát triển bởi sinh viên HUST • Powered by RAG Technology
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  );
};

// Simple Chat Interface Component
const ChatInterface = () => {
  const [messages, setMessages] = useState([
    { type: 'bot', content: 'Xin chào! Tôi là RAG4HUST. Tôi có thể giúp gì cho bạn?' }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;
    
    const newMessage = { type: 'user', content: inputMessage };
    setMessages(prev => [...prev, newMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate bot response
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        type: 'bot', 
        content: 'Đây là phản hồi mẫu từ RAG4HUST. Trong thực tế, tôi sẽ kết nối với hệ thống RAG để trả lời câu hỏi của bạn.' 
      }]);
      setIsTyping(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-black flex flex-col">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-700 to-green-700 p-4 shadow-lg">
        <div className="container mx-auto flex items-center">
          <Bot className="text-white mr-3" size={32} />
          <div>
            <h1 className="text-white text-xl font-bold">RAG4HUST</h1>
            <p className="text-blue-100 text-sm">AI Knowledge Assistant</p>
          </div>
          <button 
            onClick={() => window.location.reload()}
            className="ml-auto text-white/80 hover:text-white transition-colors duration-200"
          >
            ← Quay lại
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="container mx-auto max-w-4xl">
          {messages.map((message, index) => (
            <div key={index} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-xs md:max-w-md px-4 py-3 rounded-2xl ${
                message.type === 'user' 
                  ? 'bg-blue-600 text-white rounded-br-sm' 
                  : 'bg-white text-gray-800 rounded-bl-sm shadow-lg'
              }`}>
                {message.content}
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-white px-4 py-3 rounded-2xl rounded-bl-sm shadow-lg">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Input */}
      <div className="p-4 bg-gray-800 border-t border-gray-700">
        <div className="container mx-auto max-w-4xl flex gap-3">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Nhập câu hỏi của bạn..."
            className="flex-1 px-4 py-3 rounded-xl bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isTyping}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-green-600 text-white rounded-xl hover:from-blue-700 hover:to-green-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Gửi
          </button>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;