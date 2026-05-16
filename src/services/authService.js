import {setToken, setUser} from '../redux/actions';
import {TOKEN_KEY, USER_KEY} from '../utils/app';
import api from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Actions from './../redux/actions/ActionTypes';
import messaging from '@react-native-firebase/messaging';

const loginStart = () => ({type: Actions.LOGIN_START});
const loginSuccess = () => ({type: Actions.LOGIN_SUCCESS});
const loginFailure = () => ({type: Actions.LOGIN_FAILURE});
const clearReduxData = () => ({type: Actions.CLEAR_REDUX_DATA});

const getFcmToken = async () => {
  try {
    await messaging().requestPermission();
    const fcmToken = await messaging().getToken();
    return fcmToken || '';
  } catch (error) {
    return '';
  }
};

export const requestOtp = async phoneNumber => {
  try {
    const response = await api.post('/request-otp', {
      phone: phoneNumber,
    });

    return response.data;
  } catch (error) {
    throw error;
  }
};

export const verifyOtp = async (phoneNumber, otp) => {
  try {
    const fcmToken = await getFcmToken();

    const response = await api.post('/verify-otp', {
      phone: phoneNumber,
      otp,
      fcmToken,
    });

    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * دي أول خطوة بعد Google / Apple
 * بنسأل الباك إند:
 * هل الإيميل موجود وكامل البيانات؟
 * لو موجود يرجع login response
 * لو ناقص بيانات يرجع login false ونوديه CompleteMissingDataScreen
 */
export const checkSocialLogin = async ({
  provider,
  providerId,
  email,
  name,
  photo,
  idToken,
}) => {
  try {
    const fcmToken = await getFcmToken();

    const response = await api.post('/check-social-login', {
      provider,
      provider_id: providerId,
      email,
      name,
      photo,
      id_token: idToken,
      fcmToken,
    });

    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * دي بعد ما المستخدم يكمل الاسم والهاتف
 * ويروح OTP
 * وبعد تأكيد OTP نعمل create/update user ثم login
 */
export const verifySocialOtp = async ({
  phoneNumber,
  otp,
  provider,
  providerId,
  email,
  name,
}) => {
  try {
    const fcmToken = await getFcmToken();

    const response = await api.post('/verify-social-otp', {
      phone: phoneNumber,
      otp,
      provider,
      provider_id: providerId,
      email,
      name,
      fcmToken,
    });

    return response.data;
  } catch (error) {
    throw error;
  }
};

export const registerUser = async (phoneNumber, firstName, lastName) => {
  try {
    const fcmToken = await getFcmToken();

    const response = await api.post('/register', {
      phone: phoneNumber,
      first_name: firstName,
      last_name: lastName,
      fcmToken,
    });

    return response.data;
  } catch (error) {
    throw error;
  }
};

export const completeLogin = async (response, dispatch) => {
  const token = response.access_token;
  const user = response.userData;

  dispatch(loginStart());

  dispatch(setToken(token));
  dispatch(setUser(user));

  if (response.userData?.payment != 0) {
    dispatch({
      type: Actions.CHAHNGE_PAYMENT_FEATURE_STATUS,
      payload: response.userData.payment,
    });

    dispatch({
      type: Actions.CHAHNGE_FIXING_MODE_STATUS,
      payload: response.userData.fixing_mode,
    });
  }

  dispatch({
    type: Actions.UPLOAD_IMAGE_REG,
    payload: response.userData?.image,
  });

  dispatch({
    type: Actions.UPDATE_CREDIT,
    payload: response.wallet,
  });

  dispatch({
    type: Actions.UPDATE_ADRESSES_ARR,
    payload: response.addresses,
  });

  await AsyncStorage.setItem(TOKEN_KEY, token);
  await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));

  dispatch(loginSuccess());
};