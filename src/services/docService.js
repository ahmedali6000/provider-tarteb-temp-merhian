import api from './api';

export const getDocData = async doc => {
  try {
    const response = await api.get(`/data/${doc}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};