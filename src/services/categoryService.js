import api from './api';

export const getCategoryChildren = async categoryId => {
  try {
    const response = await api.get(`/categories/${categoryId}/children`);
    return response.data;
  } catch (error) {
    throw error;
  }
};