import api from './api';

export const getSupportMessages = async (page = 1, perPage = 10) => {
  try {
    const response = await api.get(
      `/support-messages?page=${page}&per_page=${perPage}`,
    );

    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getSupportMessageDetails = async id => {
  try {
    const response = await api.get(`/support-messages/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};