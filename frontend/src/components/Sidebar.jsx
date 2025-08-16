import React, { useState } from 'react';
import { Home, Sun, PanelLeftClose, PanelLeftOpen, Search, Plus, MessageSquare } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import ConversationItem from './ConversationItem';

const Sidebar = ({ isOpen, onToggle, currentSpaceId }) => {
  const [activeTab, setActiveTab] = useState('conversations');
  const location = useLocation();
  const navigate = useNavigate();
  
  // Lấy conversationId từ URL
  const currentConversationId = location.pathname.split('/').pop();

  // Lấy conversations từ localStorage
  const conversations = JSON.parse(localStorage.getItem('conversations') || '[]');

  // Hàm tạo cuộc trò chuyện mới
  const createNewConversation = () => {
    // Tạo ID mới cho conversation
    const newId = Date.now();
    
    // Xác định spaceId
    const spaceId = currentSpaceId || (conversations.length > 0 ? conversations[0].space_id : 1);
    
    // Tạo conversation mới
    const newConversation = {
      id: newId,
      title: "New Chat",
      model: "Flash",
      space_id: spaceId,
      created_at: new Date().toISOString()
    };
    
    // Lưu vào localStorage
    const updatedConversations = [newConversation, ...conversations];
    localStorage.setItem('conversations', JSON.stringify(updatedConversations));
    
    // Điều hướng đến trang chat mới
    navigate(`/chat/${spaceId}/${newId}`);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Top Navigation + Tab Navigation */}
      <div className="p-4 border-b border-gray-700">
        {isOpen ? (
          // Expanded view
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                to="/"
                className="flex items-center space-x-2 cursor-pointer transition-transform active:scale-95 hover:text-blue-500"
                >
                <Home size={20} />
                <span className="font-medium">Landing Page</span>
                </Link>
              <div className="cursor-pointer p-1 hover:bg-gray-700 rounded">
                <Sun size={20} />
              </div>
            </div>
            <div className="cursor-pointer p-1 hover:bg-gray-700 rounded" onClick={onToggle}>
              <PanelLeftClose size={20} />
            </div>
          </div>
        ) : (
          // Collapsed view
          <div className="flex flex-col items-center space-y-3">
            <Link to="/" className="cursor-pointer p-2 hover:bg-gray-700 rounded">
                <Home size={20} />
            </Link>
            <div className="cursor-pointer p-2 hover:bg-gray-700 rounded" onClick={onToggle}>
              <PanelLeftOpen size={20} />
            </div>
            <div
              className="cursor-pointer p-2 hover:bg-gray-700 rounded bg-blue-600 hover:bg-blue-700"
              title="New Conversation"
              onClick={createNewConversation}
            >
              <Plus size={20} />
            </div>
          </div>
        )}

        {/* Tab Navigation - chỉ còn Conversations */}
        {isOpen && (
          <div className="mt-4 flex bg-gray-700 rounded-lg p-1 transition-opacity duration-300 ease-in-out">
            <button
              className={`flex-1 py-2 px-3 text-sm rounded-md transition-colors ${
                activeTab === 'conversations'
                  ? 'bg-gray-600 text-white'
                  : 'text-gray-300 hover:text-white'
              }`}
              onClick={() => setActiveTab('conversations')}
            >
              Conversations
            </button>
          </div>
        )}
      </div>

      {/* Content area */}
      <div className="flex-1 overflow-hidden">
        {isOpen ? (
          // Expanded view
          <div className="p-4 transition-opacity duration-300 ease-in-out">
            {/* Conversations content */}
            <>
              <div className="flex items-center space-x-2 mb-4">
                <MessageSquare size={16} />
                <span className="font-medium">Conversations</span>
                <span className="text-xs text-gray-400">{conversations.length} chats</span>
              </div>

              {/* Search */}
              <div className="relative mb-4">
                <Search size={16} className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search conversations..."
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg pl-10 pr-4 py-2 text-sm placeholder-gray-400 focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* New Conversation Button */}
              <button 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-3 px-4 mb-4 flex items-center justify-center space-x-2 transition-colors"
                onClick={createNewConversation}
              >
                <Plus size={16} />
                <span>New Conversation</span>
              </button>

              {/* Conversation List */}
              <div className="px-0 space-y-2">
                {conversations.map((conv) => (
                  <ConversationItem key={conv.id} conversation={conv} />
                ))}
              </div>
            </>
          </div>
        ) : (
          // Collapsed view - icons only
          <div className="p-2 space-y-2 mt-4 transition-opacity duration-300 ease-in-out">
            {conversations.map((conv) => (
              <div
                key={conv.id}
                className={`w-12 h-12 rounded-lg cursor-pointer transition-colors flex items-center justify-center ${
                  conv.id == currentConversationId
                    ? 'bg-blue-600/20 border border-blue-600/30'
                    : 'bg-gray-700 hover:bg-gray-600'
                }`}
                title={conv.title}
                onClick={() => navigate(`/chat/${conv.space_id}/${conv.id}`)}
              >
                <MessageSquare size={16} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;