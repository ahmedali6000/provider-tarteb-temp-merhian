import api from './api';

export const getScheduleSettings = async () => {
  try {
    const response = await api.get('/order-schedule-settings');
    return response.data;
  } catch (error) {
    throw error;
  }
};