import api from './api';

export const findOrderDiscount = async payload => {
  try {
    const response = await api.post('/dicount-finder', payload);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const checkOrderCoupon = async payload => {
  try {
    const response = await api.post('/check-coupon', payload);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const postOrder = async payload => {
  try {
    const response = await api.post('/post_order', payload);
    return response.data;
  } catch (error) {
    throw error;
  }
};