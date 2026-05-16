import api from './api';

export const getPaymentMethods = async () => {
  const response = await api.get('/payments/methods');
  return response.data;
};

/**
 * الدالة العامة لكل طرق دفع الطلب:
 * - card
 * - fawry
 * - aman
 * - masary
 * - mobile_wallet
 */
export const initOrderPayment = async ({
  orderId,
  paymentMethodId,
  methodKey,
  phoneWallet = null,
}) => {
  
  const payload = {
    order_id: orderId,
    payment_method_id: paymentMethodId,
    method: methodKey,
  };

  if (phoneWallet) {
    payload.phone_wallet = phoneWallet;
  }

  const response = await api.post('/payments/order/init', payload);

  return response.data;
};

/**
 * Alias للمحفظة فقط، عشان لو صفحات قديمة بتستخدم الاسم ده تفضل شغالة
 */
export const initOrderWalletPayment = async ({
  orderId,
  paymentMethodId,
  methodKey = 'mobile_wallet',
  phoneWallet,
}) => {
  return initOrderPayment({
    orderId,
    paymentMethodId,
    methodKey,
    phoneWallet,
  });
};

export const confirmOrderCardPayment = async ({orderId, invoiceId}) => {
  const response = await api.post('/payments/order/confirm-card', {
    order_id: orderId,
    invoice_id: invoiceId,
  });

  return response.data;
};

export const finishOrderCash = async ({orderId}) => {
  const response = await api.post(`/orders/${orderId}/finish-cash`);
  return response.data;
};

export const submitProviderReview = async ({
  orderId,
  providerId,
  rate,
  review,
}) => {
  const response = await api.post(`/orders/${orderId}/review`, {
    provider_id: providerId,
    rate,
    review,
  });

  return response.data;
};