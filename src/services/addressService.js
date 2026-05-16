import api from './api';

export const getAddresses = async () => {
  const response = await api.get('/addresses');
  return response.data;
};

export const createAddress = async data => {
  const response = await api.post('/addresses', data);
  return response.data;
};

export const updateAddress = async (id, data) => {
  const response = await api.put(`/addresses/${id}`, data);
  return response.data;
};

export const deleteAddress = async id => {
  const response = await api.delete(`/addresses/${id}`);
  return response.data;
};