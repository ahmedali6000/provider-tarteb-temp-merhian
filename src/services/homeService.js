import api from './api';

export const getHomeCategories = async () => {
  try {
    const response = await api.get('/home-categories');
    return response.data;
  } catch (error) {
    throw error;
  }
};