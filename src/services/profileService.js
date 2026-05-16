import api from './api';

export const updateProfile = async payload => {
  const response = await api.post('/profile/update', payload);
  return response.data;
};