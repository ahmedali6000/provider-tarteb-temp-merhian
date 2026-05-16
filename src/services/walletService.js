import api from './api';

export const getLatestTransactions = async () => {
  try {
    const response = await api.get('/wallet/latest-transactions');
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getTransactions = async ({type = 'payments', page = 1, perPage = 10}) => {
  try {
    const response = await api.get('/wallet/transactions', {
      params: {
        type,
        page,
        per_page: perPage,
      },
    });

    return response.data;
  } catch (error) {
    throw error;
  }
};