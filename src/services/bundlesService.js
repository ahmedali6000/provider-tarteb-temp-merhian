import api from './api';

export const getAvailableBundles = async ({categoryId} = {}) => {
  const response = await api.get('/bundles', {
    params: {
      category_id: categoryId || undefined,
    },
  });

  return response.data;
};

export const getMyBundles = async () => {
  const response = await api.get('/my-bundles');
  return response.data;
};