import api from './api';

export const getProviderRatings = async ({page = 1, sort = 'latest'} = {}) => {
  try {
    const response = await api.get('/provider/ratings', {
      params: {
        page,
        sort,
      },
    });

    return response.data;
  } catch (error) {
    throw error;
  }
};