import api from './api';

export const getOrderConversation = async ({orderId, providerId}) => {
  const response = await api.get(`/orders/${orderId}/conversation`, {
    params: {
      provider_id: providerId,
    },
  });

  return response.data;
};

export const getConversationMessages = async ({
  conversationId,
  page = 1,
  perPage = 20,
}) => {
  const response = await api.get(`/conversations/${conversationId}/messages`, {
    params: {
      page,
      per_page: perPage,
    },
  });

  return response.data;
};

export const sendConversationMessage = async ({
  conversationId,
  body,
  messageType = 'text',
}) => {
  const response = await api.post(`/conversations/${conversationId}/messages`, {
    message_type: messageType,
    body,
  });

  return response.data;
};

export const markConversationAsRead = async ({conversationId}) => {
  const response = await api.post(`/conversations/${conversationId}/read`);

  return response.data;
};

export const getChatQuickReplies = async () => {
  const response = await api.get('/chat/quick-replies');

  return response.data;
};


export const getComplaintReasons = async ({targetType = 'provider'} = {}) => {
  const response = await api.get('/complaint-reasons', {
    params: {
      target_type: targetType,
    },
  });

  return response.data;
};

export const sendOrderComplaint = async ({
  orderId,
  conversationId,
  complaintReasonId,
  againstUserId,
  note,
}) => {
  const response = await api.post('/order-complaints', {
    order_id: orderId,
    conversation_id: conversationId,
    complaint_reason_id: complaintReasonId,
    against_user_id: againstUserId,
    note,
  });

  return response.data;
};



// provider part
export const getChatConversations = async ({
  filter = 'all',
  page = 1,
  perPage = 20,
} = {}) => {
  try {
    const response = await api.get('/chat/conversations', {
      params: {
        filter,
        page,
        per_page: perPage,
      },
    });

    return response.data;
  } catch (error) {
    throw error;
  }
};