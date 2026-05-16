// services/notificationService.js
import api from './api';

export const getNotifications = async ({page = 1, perPage = 15}) => {
  const response = await api.get('/notifications', {
    params: {
      page,
      per_page: perPage,
    },
  });

  return response.data;
};

export const getNotificationDetails = async id => {
  const response = await api.get(`/notifications/${id}`);
  return response.data;
};

export const markAllNotificationsAsRead = async () => {
  const response = await api.post('/notifications/read-all');
  return response.data;
};