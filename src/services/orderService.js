import api from './api';

export const getMyOrders = async ({
  status = 'pending',
  page = 1,
  perPage = 10,
  sort = 'latest',
}) => {
  try {
    const response = await api.get('/my-orders', {
      params: {
        status,
        page,
        per_page: perPage,
        sort,
      },
    });

    return response.data;
  } catch (error) {
    throw error;
  }
};

export const createOrder = async (payload, onUploadProgress) => {
  try {
    const response = await api.post('/orders', payload, {
      onUploadProgress: progressEvent => {
        if (!onUploadProgress) {
          return;
        }

        const total = progressEvent.total || 1;
        const loaded = progressEvent.loaded || 0;
        const percent = Math.round((loaded * 100) / total);

        onUploadProgress(Math.min(percent, 95));
      },
    });

    return response.data;
  } catch (error) {
    throw error;
  }
};



export const getOrderDetails = async orderId => {
  const response = await api.get(`/orders/${orderId}`);
  return response.data;
};

export const getNearbyProviders = async orderId => {
  const response = await api.get(`/orders/${orderId}/nearby-providers`);
  return response.data;
};




export const getCancellationReasons = async () => {
  const response = await api.get('/order-cancellation-reasons', {
    params: {
      type: 'client',
    },
  });

  return response.data;
};

export const cancelOrder = async ({orderId, reasonId, customReason}) => {
  const response = await api.post(`/orders/${orderId}/cancel`, {
    reason_id: reasonId,
    custom_reason: customReason || null,
  });

  return response.data;
};



export const submitProviderReview = async ({
  orderId,
  providerId,
  rate,
  review,
}) => {
  const response = await api.post(`/orders/${orderId}/review`, {
    provider_id: providerId,
    rate,
    review,
  });

  return response.data;
};