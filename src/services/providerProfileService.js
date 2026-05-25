import api from './api';

export const getProviderProfile = async () => {
  try {
    const response = await api.get('/provider/profile');
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateProviderProfile = async payload => {
  try {
    const response = await api.post('/provider/profile/update', payload);
    return response.data;
  } catch (error) {
    throw error;
  }
};