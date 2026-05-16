import api from './api';

export const searchServices = async key => {
  try {
    const response = await api.get('/search', {
      params: {key},
    });

    return response.data;
  } catch (error) {
    throw error;
  }
};