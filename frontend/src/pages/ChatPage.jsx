import React, { useState, useEffect } from 'react';
import { Send, HelpCircle, Search, Zap, FileText, BookOpen } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { sendMessage, createConversation } from '../services/chatService';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const ChatPage = () => {
  const { conversationId, spaceId } = useParams();
  const navigate = useNavigate();
  
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [hasStartedChat, setHasStartedChat] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentConversation, setCurrentConversation] = useState(null);
  const [currentConversationId, setCurrentConversationId] = useState(null);
  const [currentSpace, setCurrentSpace] = useState(null);
  const [spaceDocuments, setSpaceDocuments] = useState([]);

  // Load conversation và messages khi component mount
  useEffect(() => {
    const initializeChat = async () => {
      try {
        // Load từ localStorage nếu có
        const savedConversations = JSON.parse(localStorage.getItem('conversations') || '[]');
        const savedMessages = JSON.parse(localStorage.getItem('messages') || '{}');
        
        let conv;
        if (conversationId && !isNaN(parseInt(conversationId))) {
          // Nếu có conversationId hợp lệ trong URL, tìm trong localStorage
          const savedConv = savedConversations.find(c => c.id === parseInt(conversationId));
          if (savedConv) {
            conv = savedConv;
            setCurrentConversation(conv);
            setCurrentConversationId(parseInt(conversationId));
            // Load messages cho conversation này
            setMessages(savedMessages[conversationId] || []);
            setHasStartedChat((savedMessages[conversationId] || []).length > 0);
          } else {
            // Nếu conversation không tồn tại, tạo conversation mới
            console.warn('Conversation not found, creating new one');
            const currentSpaceId = spaceId ? parseInt(spaceId) : 1;
            
            conv = {
              title: "New Chat",
              model: "Flash",
              space_id: currentSpaceId,
              id: Date.now(), // Sử dụng timestamp làm id tạm thời
              created_at: new Date().toISOString()
            };
            setCurrentConversation(conv);
            setCurrentConversationId(conv.id);
            
            // Reset messages để hiển thị màn hình chào mừng
            setMessages([]);
            setHasStartedChat(false);
          }
        } else {
          // Nếu không có conversationId hợp lệ, tạo conversation tạm thời
          const currentSpaceId = spaceId ? parseInt(spaceId) : 1;
          
          conv = {
            title: "New Chat",
            model: "Flash",
            space_id: currentSpaceId,
            id: Date.now(), // Sử dụng timestamp làm id tạm thời
            created_at: new Date().toISOString()
          };
          setCurrentConversation(conv);
          setCurrentConversationId(conv.id);
          
          // Reset messages để hiển thị màn hình chào mừng
          setMessages([]);
          setHasStartedChat(false);
        }
        
        // Load thông tin space và documents (mock data)
        if (conv && conv.space_id) {
          const space = {
            id: conv.space_id,
            name: `Space ${conv.space_id}`
          };
          setCurrentSpace(space);
          
          // Mock documents
          const documents = [
            { id: 1, name: "Document 1", space_id: conv.space_id },
            { id: 2, name: "Document 2", space_id: conv.space_id },
            { id: 3, name: "Document 3", space_id: conv.space_id }
          ];
          const spaceDocs = documents.filter(doc => doc.space_id === conv.space_id);
          setSpaceDocuments(spaceDocs);
        }
      } catch (err) {
        console.error('Error initializing chat:', err);
        setError('Failed to initialize chat');
      }
    };

    initializeChat();
  }, [conversationId, spaceId]);

  // Lưu messages vào localStorage khi có thay đổi
  useEffect(() => {
    if (currentConversationId && messages.length > 0) {
      const savedMessages = JSON.parse(localStorage.getItem('messages') || '{}');
      savedMessages[currentConversationId] = messages;
      localStorage.setItem('messages', JSON.stringify(savedMessages));
    }
  }, [messages, currentConversationId]);

  const handleSend = async () => {
    if (message.trim() && currentConversation) {
      try {
        setLoading(true);
        setError(null);
        
        // Tạo message từ người dùng
        const userMessage = {
          id: Date.now(),
          content: message,
          sender: 'user',
          conversation_id: currentConversationId,
          created_at: new Date().toISOString()
        };
        
        // Thêm message vào state
        const updatedMessages = [...messages, userMessage];
        setMessages(updatedMessages);
        setMessage('');
        setHasStartedChat(true);
        
        // Lưu conversation vào localStorage
        const savedConversations = JSON.parse(localStorage.getItem('conversations') || '[]');
        let conversationExists = savedConversations.some(c => c.id === currentConversationId);
        
        // Nếu conversation chưa có tên (là "New Chat") và đây là tin nhắn đầu tiên, cập nhật tiêu đề
        if (!conversationExists || currentConversation?.title === "New Chat") {
          // Cập nhật tiêu đề conversation thành tin nhắn đầu tiên
          const updatedConversation = {
            ...currentConversation,
            title: message.trim().substring(0, 30) + (message.trim().length > 30 ? '...' : '')
          };
          
          // Cập nhật state
          setCurrentConversation(updatedConversation);
          
          // Cập nhật trong localStorage
          const newConversations = conversationExists 
            ? savedConversations.map(conv => conv.id === currentConversationId ? updatedConversation : conv)
            : [...savedConversations, updatedConversation];
            
          localStorage.setItem('conversations', JSON.stringify(newConversations));
        }
        
        // Gửi tin nhắn đến backend API
        const response = await sendMessage(message, currentConversationId);
        
        // Tạo message từ AI
        const aiMessage = {
          id: Date.now() + 1,
          content: response.answer || "Xin lỗi, tôi không thể xử lý yêu cầu của bạn lúc này.",
          sender: 'ai',
          conversation_id: currentConversationId,
          created_at: new Date().toISOString(),
          sources: response.sources || []
        };
        
        const finalMessages = [...updatedMessages, aiMessage];
        setMessages(finalMessages);
        setLoading(false);
        
        // Lưu messages vào localStorage
        const savedMessages = JSON.parse(localStorage.getItem('messages') || '{}');
        savedMessages[currentConversationId] = finalMessages;
        localStorage.setItem('messages', JSON.stringify(savedMessages));
        
      } catch (err) {
        console.error('Error sending message:', err);
        setError('Failed to send message');
        setLoading(false);
        
        // Tạo message lỗi từ AI
        const errorMessage = {
          id: Date.now() + 1,
          content: "Xin lỗi, có lỗi xảy ra khi xử lý yêu cầu của bạn. Vui lòng thử lại sau.",
          sender: 'ai',
          conversation_id: currentConversationId,
          created_at: new Date().toISOString()
        };
        
        const finalMessages = [...messages, errorMessage];
        setMessages(finalMessages);
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleQuickAction = (action) => {
    setMessage(`Tôi muốn ${action}`);
  };

  // Custom component để render code blocks với syntax highlighting
  const CodeBlock = ({ node, inline, className, children, ...props }) => {
    const match = /language-(\w+)/.exec(className || '');
    return !inline && match ? (
      <pre className="bg-gray-800 rounded-lg p-4 overflow-x-auto my-2">
        <code className={`language-${match[1]}`} {...props}>
          {children}
        </code>
      </pre>
    ) : (
      <code className="bg-gray-700 rounded px-1 py-0.5" {...props}>
        {children}
      </code>
    );
  };

  // Component để hiển thị tài liệu trích xuất
  const SourceDocuments = ({ sources }) => {
    if (!sources || sources.length === 0) return null;

    return (
      <div className="mt-3 pt-3 border-t border-gray-600">
        <div className="flex items-center text-xs text-gray-400 mb-2">
          <BookOpen size={12} className="mr-1" />
          <span>Tài liệu tham khảo:</span>
        </div>
        <div className="space-y-1">
          {sources.slice(0, 3).map((source, index) => (
            <div key={index} className="flex items-start text-xs">
              <div className="w-4 h-4 rounded-full bg-blue-500/20 flex items-center justify-center mr-2 mt-0.5 flex-shrink-0">
                <span className="text-blue-400 text-[8px]">{index + 1}</span>
              </div>
              <span className="text-gray-300">{source.title || source.name || `Document ${index + 1}`}</span>
            </div>
          ))}
          {sources.length > 3 && (
            <div className="text-xs text-gray-500">
              ... và {sources.length - 3} tài liệu khác
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-80' : 'w-16'} bg-gray-800 border-r border-gray-700 transition-all duration-300 ease-in-out`}>
        <Sidebar 
          isOpen={sidebarOpen} 
          onToggle={() => setSidebarOpen(!sidebarOpen)} 
          currentSpaceId={currentSpace?.id}
        />
      </div>
      
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="h-16 bg-gray-900 border-b border-gray-700 flex items-center justify-between px-6">
          <div className="flex items-center">
            <span className="font-medium text-lg">{currentConversation?.title || 'New Chat'}</span>
          </div>
        </div>

        {/* Chat Content */}
        <div className="flex-1 flex flex-col">
          {error && (
            <div className="bg-red-500/20 border border-red-500/50 text-red-300 px-4 py-2 text-center">
              {error}
            </div>
          )}
          {!hasStartedChat ? (
            /* Welcome Screen */
            <div className="flex-1 flex flex-col items-center justify-center p-8">
              <div className="max-w-2xl w-full text-center">
                {/* Welcome Icon */}
                <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-xl">✨</span>
                </div>
                
                {/* Welcome Text */}
                <h1 className="text-2xl font-semibold mb-6 text-white">
                  Hi kienle, how are you?
                </h1>
                
                {/* Quick Actions - Subtle */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                  <button 
                    onClick={() => handleQuickAction('đặt câu hỏi')}
                    className="bg-gray-800/50 hover:bg-gray-700/70 border border-gray-600/50 rounded-lg p-3 text-left transition-colors flex items-center space-x-2"
                  >
                    <HelpCircle className="w-5 h-5 mb-2 text-blue-400/70" />
                    <span className="text-xs font-medium text-gray-300">Ask Questions</span>
                  </button>
                  
                  <button 
                    onClick={() => handleQuickAction('tìm thông tin')}
                    className="bg-gray-800/50 hover:bg-gray-700/70 border border-gray-600/50 rounded-lg p-3 text-left transition-colors flex items-center space-x-2"
                  >
                    <Search className="w-5 h-5 mb-2 text-orange-400/70" />
                    <span className="text-xs font-medium text-gray-300">Find Information</span>
                  </button>
                  
                  <button 
                    onClick={() => handleQuickAction('tìm kiếm nhanh')}
                    className="bg-gray-800/50 hover:bg-gray-700/70 border border-gray-600/50 rounded-lg p-3 text-left transition-colors flex items-center space-x-2"
                  >
                    <Zap className="w-5 h-5 mb-2 text-purple-400/70" />
                    <span className="text-xs font-medium text-gray-300">Quick Search</span>
                  </button>
                </div>
                
                {/* Document Status */}
                <div className="inline-flex items-center space-x-2 bg-green-500/10 text-green-400/80 px-3 py-1.5 rounded-lg border border-green-500/20">
                  <FileText size={14} />
                  <span className="text-xs"> Ready to chat!</span>
                </div>
              </div>
            </div>
          ) : (
            /* Chat Messages */
            <div className="flex-1 overflow-y-auto p-8">
              <div className="space-y-4 max-w-4xl mx-auto w-full">
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {msg.sender === 'ai' && (
                      <div className="flex-shrink-0 mr-3 flex items-end">
                        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                          <span className="text-white font-bold text-xs">🤖</span>
                        </div>
                      </div>
                    )}
                    <div className={`px-4 py-3 rounded-2xl shadow-sm transition-all duration-200 ${
                      msg.sender === 'user' 
                        ? 'bg-blue-600 text-white rounded-tr-none text-right' 
                        : 'bg-gray-700 text-gray-100 rounded-tl-none text-left'
                    }`}>
                      {msg.sender === 'ai' ? (
                        <>
                          <ReactMarkdown 
                            remarkPlugins={[remarkGfm]} 
                            components={{
                              code: CodeBlock,
                              p: ({node, ...props}) => <p className="mb-3 last:mb-0" {...props} />,
                              ul: ({node, ...props}) => <ul className="list-disc pl-5 mb-3" {...props} />,
                              ol: ({node, ...props}) => <ol className="list-decimal pl-5 mb-3" {...props} />,
                              li: ({node, ...props}) => <li className="mb-1" {...props} />,
                              h1: ({node, ...props}) => <h1 className="text-2xl font-bold mb-3 mt-4" {...props} />,
                              h2: ({node, ...props}) => <h2 className="text-xl font-bold mb-3 mt-4" {...props} />,
                              h3: ({node, ...props}) => <h3 className="text-lg font-bold mb-3 mt-4" {...props} />,
                              a: ({node, ...props}) => <a className="text-blue-400 hover:underline" {...props} />,
                              blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-gray-500 pl-4 italic" {...props} />,
                              table: ({node, ...props}) => <table className="min-w-full border-collapse border border-gray-600 mb-3" {...props} />,
                              th: ({node, ...props}) => <th className="border border-gray-600 px-3 py-1 bg-gray-800" {...props} />,
                              td: ({node, ...props}) => <td className="border border-gray-600 px-3 py-1" {...props} />,
                            }}
                          >
                            {msg.content}
                          </ReactMarkdown>
                          {msg.sources && msg.sources.length > 0 && (
                            <SourceDocuments sources={msg.sources} />
                          )}
                        </>
                      ) : (
                        <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                      )}
                      <p className={`text-xs mt-1 ${
                        msg.sender === 'user' ? 'text-blue-100' : 'text-gray-400'
                      }`}>
                        {new Date(msg.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </p>
                    </div>
                    {msg.sender === 'user' && (
                      <div className="flex-shrink-0 ml-3 flex items-end">
                        <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center">
                          <span className="text-white font-bold text-xs">👤</span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                {loading && (
                  <div className="flex justify-start">
                    <div className="flex-shrink-0 mr-3 flex items-end">
                      <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                        <span className="text-white font-bold text-xs">🤖</span>
                      </div>
                    </div>
                    <div className="px-4 py-3 rounded-2xl shadow-sm bg-gray-700 text-gray-100 rounded-tl-none">
                      <div className="flex space-x-2">
                        <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"></div>
                        <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Input Area */}
          <div className="p-8 border-t border-gray-700">
            <div className="max-w-4xl mx-auto">
              <div className="relative">
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="How can I help you today?"
                  rows="3"
                  disabled={loading}
                  className="w-full bg-gray-800 border border-gray-600 rounded-xl p-4 pr-12 text-white placeholder-gray-400 resize-none focus:outline-none focus:border-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <button
                  onClick={handleSend}
                  disabled={!message.trim() || loading}
                  className={`absolute right-4 bottom-4 p-2 rounded-lg transition-colors ${
                    message.trim() && !loading
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <Send size={16} />
                  )}
                </button>
              </div>
              
              {/* Helper Text */}
              <div className="mt-2 text-xs text-gray-500 text-center">
                Press Enter to send, Shift+Enter for new line
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;