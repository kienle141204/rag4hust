const API_BASE_URL = 'http://13.215.175.83:8081';

// Hàm gửi tin nhắn đến backend
export const sendMessage = async (message, conversationId = null) => {
  try {
    const response = await fetch(`${API_BASE_URL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: message,
        conversation_id: conversationId
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

// Hàm lấy lịch sử cuộc trò chuyện
export const getConversationHistory = async (conversationId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/conversation/${conversationId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching conversation history:', error);
    throw error;
  }
};

// Hàm tạo cuộc trò chuyện mới
export const createConversation = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/conversation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error creating conversation:', error);
    throw error;
  }
};

export default {
  sendMessage,
  getConversationHistory,
  createConversation
};