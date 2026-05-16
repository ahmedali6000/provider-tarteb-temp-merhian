import api from './api';

export const getOrderInstructions = async () => {
  try {
    const response = await api.get('/order-instructions');
    return response.data;
  } catch (error) {
    throw error;
  }
};