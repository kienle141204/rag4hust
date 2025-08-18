import React, { useState, useEffect, useRef } from 'react';
import { Send, HelpCircle, Search, Zap, FileText, BookOpen } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { sendMessage, createConversation } from '../services/chatService';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const ChatPage = () => {
  const { conversationId, spaceId } = useParams();
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);
  
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

  // Auto scroll to bottom when new messages are added
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (hasStartedChat) {
      scrollToBottom();
    }
  }, [messages, loading, hasStartedChat]);

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
      <div className="my-4">
        <div className="bg-gray-900/90 backdrop-blur-sm rounded-t-xl px-4 py-2 border-b border-gray-600/50">
          <span className="text-xs font-medium text-gray-300 uppercase tracking-wider">{match[1]}</span>
        </div>
        <pre className="bg-gray-900/50 rounded-b-xl p-4 overflow-x-auto border border-t-0 border-gray-600/50">
          <code className={`language-${match[1]} text-sm`} {...props}>
            {children}
          </code>
        </pre>
      </div>
    ) : (
      <code className="bg-gray-700/70 text-blue-300 rounded-md px-2 py-1 text-sm font-mono" {...props}>
        {children}
      </code>
    );
  };

  // Component để hiển thị tài liệu trích xuất
  const SourceDocuments = ({ sources }) => {
    if (!sources || sources.length === 0) return null;

    // Hàm kiểm tra xem một chuỗi có phải là URL hợp lệ không
    const isValidUrl = (string) => {
      try {
        new URL(string);
        return true;
      } catch (_) {
        return false;
      }
    };

    return (
      <div className="mt-4 p-4 rounded-2xl bg-gray-800/30 backdrop-blur-sm border border-gray-700/50">
        <div className="flex items-center text-xs text-gray-300 mb-3 font-medium">
          <BookOpen size={14} className="mr-2 text-blue-400" />
          <span>Tài liệu tham khảo</span>
        </div>
        <div className="space-y-2">
          {sources.slice(0, 3).map((source, index) => {
            const sourceText = source.title || source.name || `Document ${index + 1}`;
            const isUrl = isValidUrl(sourceText);
            
            return (
              <div key={index} className="flex items-start text-sm group">
                <div className="w-6 h-6 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30 flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                  <span className="text-blue-400 text-xs font-bold">{index + 1}</span>
                </div>
                {isUrl ? (
                  <a 
                    href={sourceText} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 underline decoration-2 underline-offset-2 group-hover:decoration-blue-300 transition-colors flex-1 leading-relaxed"
                  >
                    {sourceText}
                  </a>
                ) : (
                  <span className="text-gray-200 flex-1 leading-relaxed">{sourceText}</span>
                )}
              </div>
            );
          })}
          {sources.length > 3 && (
            <div className="text-xs text-gray-400 italic pl-9">
              +{sources.length - 3} tài liệu khác
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
      <div className="flex-1 flex flex-col h-full">
        {/* Header - Fixed height */}
        <div className="h-16 bg-gray-900 border-b border-gray-700 flex items-center justify-between px-6 flex-shrink-0">
          <div className="flex items-center">
            <span className="font-medium text-lg">{currentConversation?.title || 'New Chat'}</span>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/20 border border-red-500/50 text-red-300 px-4 py-2 text-center flex-shrink-0">
            {error}
          </div>
        )}
        
        {/* Chat Content - Takes remaining space */}
        <div className="flex-1 min-h-0 flex flex-col">
          {!hasStartedChat ? (
            /* Welcome Screen - Centered in available space */
            <div className="flex-1 flex flex-col items-center justify-center p-8">
              <div className="max-w-2xl w-full text-center">
                {/* Welcome Icon */}
                <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-xl">✨</span>
                </div>
                
                {/* Welcome Text */}
                <h1 className="text-2xl font-semibold mb-6 text-white">
                  Hi, how are you?
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
            /* Chat Messages - Scrollable area with fixed height */
            <div className="flex-1 overflow-y-auto">
              <div className="p-8">
                <div className="space-y-4 max-w-4xl mx-auto w-full">
                  {messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} mb-6`}>
                      {msg.sender === 'ai' && (
                        <div className="flex-shrink-0 mr-4 flex items-start mt-1">
                          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                            <span className="text-white font-bold text-sm">AI</span>
                          </div>
                        </div>
                      )}
                      <div className={`relative max-w-[75%] ${msg.sender === 'user' ? 'mr-4' : 'ml-0'}`}>
                        <div className={`px-5 py-4 rounded-3xl shadow-lg transition-all duration-300 hover:shadow-xl ${
                          msg.sender === 'user' 
                            ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white relative overflow-hidden text-right' 
                            : 'bg-gray-800/80 backdrop-blur-sm text-gray-100 border border-gray-700/50 text-left'
                        }`}>
                          {/* Glass effect for user messages */}
                          {msg.sender === 'user' && (
                            <div className="absolute inset-0 bg-white/10 backdrop-blur-sm rounded-3xl"></div>
                          )}
                          
                          <div className="relative z-10">
                            {msg.sender === 'ai' ? (
                              <>
                                <ReactMarkdown 
                                  remarkPlugins={[remarkGfm]} 
                                  components={{
                                    code: CodeBlock,
                                    p: ({node, ...props}) => <p className="mb-3 last:mb-0 leading-relaxed" {...props} />,
                                    ul: ({node, ...props}) => <ul className="list-disc pl-5 mb-3 space-y-1" {...props} />,
                                    ol: ({node, ...props}) => <ol className="list-decimal pl-5 mb-3 space-y-1" {...props} />,
                                    li: ({node, ...props}) => <li className="leading-relaxed" {...props} />,
                                    h1: ({node, ...props}) => <h1 className="text-2xl font-bold mb-3 mt-4 text-white" {...props} />,
                                    h2: ({node, ...props}) => <h2 className="text-xl font-bold mb-3 mt-4 text-white" {...props} />,
                                    h3: ({node, ...props}) => <h3 className="text-lg font-bold mb-3 mt-4 text-white" {...props} />,
                                    a: ({node, ...props}) => <a className="text-blue-400 hover:text-blue-300 underline decoration-2 underline-offset-2" {...props} />,
                                    blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-blue-500 pl-4 italic bg-gray-700/50 py-2 rounded-r-lg" {...props} />,
                                    table: ({node, ...props}) => <table className="min-w-full border-collapse border border-gray-600 mb-3 rounded-lg overflow-hidden" {...props} />,
                                    th: ({node, ...props}) => <th className="border border-gray-600 px-3 py-2 bg-gray-700 font-semibold" {...props} />,
                                    td: ({node, ...props}) => <td className="border border-gray-600 px-3 py-2" {...props} />,
                                  }}
                                >
                                  {msg.content}
                                </ReactMarkdown>
                                {msg.sources && msg.sources.length > 0 && (
                                  <SourceDocuments sources={msg.sources} />
                                )}
                              </>
                            ) : (
                              <p className="text-sm whitespace-pre-wrap leading-relaxed font-medium">{msg.content}</p>
                            )}
                          </div>
                        </div>
                        
                        {/* Timestamp */}
                        <div className={`mt-2 text-xs flex items-center ${msg.sender === 'user' ? 'justify-end text-gray-400' : 'justify-start text-gray-500'}`}>
                          <span className="px-2 py-1 rounded-full bg-gray-800/50 backdrop-blur-sm">
                            {new Date(msg.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </span>
                        </div>
                      </div>
                      
                      {msg.sender === 'user' && (
                        <div className="flex-shrink-0 ml-4 flex items-start mt-1">
                          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg">
                            <span className="text-white font-bold text-sm">You</span>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                  {loading && (
                    <div className="flex justify-start mb-6">
                      <div className="flex-shrink-0 mr-4 flex items-start mt-1">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                          <span className="text-white font-bold text-sm">AI</span>
                        </div>
                      </div>
                      <div className="bg-gray-800/80 backdrop-blur-sm border border-gray-700/50 px-5 py-4 rounded-3xl shadow-lg max-w-[75%]">
                        <div className="flex items-center space-x-2">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></div>
                            <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                            <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                          </div>
                          <span className="text-gray-400 text-sm">AI đang suy nghĩ...</span>
                        </div>
                      </div>
                    </div>
                  )}
                  {/* Invisible element for scrolling to bottom */}
                  <div ref={messagesEndRef} />
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Input Area - Fixed at bottom */}
        <div className="p-8 border-t border-gray-700 flex-shrink-0">
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
  );
};

export default ChatPage;