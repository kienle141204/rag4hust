import React, { useState } from 'react';
import { MessageSquare, MoreHorizontal, Trash2 } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

const ConversationItem = ({ conversation }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  
  // Lấy conversationId từ URL
  const currentConversationId = location.pathname.split('/').pop();

  // Hàm xóa cuộc trò chuyện
  const handleDelete = () => {
    // Lấy conversations từ localStorage
    const conversations = JSON.parse(localStorage.getItem('conversations') || '[]');
    
    // Lọc bỏ conversation cần xóa
    const updatedConversations = conversations.filter(conv => conv.id !== conversation.id);
    
    // Lưu lại vào localStorage
    localStorage.setItem('conversations', JSON.stringify(updatedConversations));
    
    // Nếu đang xem conversation bị xóa, chuyển về trang chat mới
    if (conversation.id == currentConversationId) {
      // Lấy spaceId từ conversation đầu tiên nếu còn, hoặc mặc định là 1
      const firstSpaceId = updatedConversations.length > 0 ? updatedConversations[0].space_id : 1;
      navigate(`/chat/${firstSpaceId}`);
    }
    
    setShowDeleteConfirm(false);
  };

  return (
    <div 
      className={`p-3 rounded-lg cursor-pointer transition-colors ${
        conversation.id == currentConversationId
          ? 'bg-blue-600/20 border border-blue-600/30'
          : 'bg-gray-700 hover:bg-gray-600'
      }`}
      onClick={() => navigate(`/chat/${conversation.space_id}/${conversation.id}`)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setShowDeleteConfirm(false);
      }}
    >
      <div className="flex items-center space-x-3">
        <MessageSquare size={16} />
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-sm truncate" title={conversation.title}>
            {conversation.title}
          </h3>
          <p className="text-xs text-gray-400 truncate">
            {new Date(conversation.created_at).toLocaleDateString()}
          </p>
        </div>
        <div className="relative">
          <button 
            className={`p-1 rounded-full transition-opacity duration-200 ${
              isHovered ? 'opacity-100 bg-gray-600/50' : 'opacity-0'
            }`}
            onClick={(e) => {
              e.stopPropagation();
              setShowDeleteConfirm(!showDeleteConfirm);
            }}
          >
            <MoreHorizontal size={16} />
          </button>
          
          {showDeleteConfirm && (
            <div 
              className="absolute right-0 mt-1 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-10"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="w-full flex items-center space-x-2 px-4 py-2 text-red-400 hover:bg-gray-700 rounded-lg transition-colors"
                onClick={handleDelete}
              >
                <Trash2 size={16} />
                <span>Delete Chat</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConversationItem;