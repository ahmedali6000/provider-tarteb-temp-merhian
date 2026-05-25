import {setToken, setUser} from '../redux/actions';
import {TOKEN_KEY, USER_KEY} from '../utils/app';
import api from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Actions from './../redux/actions/ActionTypes';
import messaging from '@react-native-firebase/messaging';

const loginStart = () => ({type: Actions.LOGIN_START});
const loginSuccess = () => ({type: Actions.LOGIN_SUCCESS});
const loginFailure = () => ({type: Actions.LOGIN_FAILURE});

const PROVIDER_HEADERS = {
  userType: 'provider',
};

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
    const response = await api.post(
      '/request-otp',
      {
        phone: phoneNumber,
      },
      {
        headers: PROVIDER_HEADERS,
      },
    );

    return response.data;
  } catch (error) {
    throw error;
  }
};

export const checkProviderPhone = async phoneNumber => {
  try {
    const response = await api.post(
      '/provider/check-phone',
      {
        phone: phoneNumber,
      },
      {
        headers: PROVIDER_HEADERS,
      },
    );

    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Verify OTP
 *
 * يدعم الطريقتين:
 *
 * verifyOtp(phoneNumber, otp, joinAsProvider)
 *
 * أو:
 *
 * verifyOtp({
 *   phone: phoneNumber,
 *   otp: code,
 *   joinAsProvider: true,
 * })
 */
export const verifyOtp = async (
  phoneOrPayload,
  otpValue,
  joinAsProviderValue = false,
) => {
  try {
    const fcmToken = await getFcmToken();

    let phone = '';
    let otp = '';
    let joinAsProvider = false;

    if (typeof phoneOrPayload === 'string') {
      phone = phoneOrPayload;
      otp = otpValue;
      joinAsProvider = joinAsProviderValue === true;
    } else if (
      phoneOrPayload &&
      typeof phoneOrPayload === 'object' &&
      !Array.isArray(phoneOrPayload)
    ) {
      phone = phoneOrPayload.phone || phoneOrPayload.phoneNumber || '';
      otp = phoneOrPayload.otp || phoneOrPayload.code || '';

      joinAsProvider =
        phoneOrPayload.joinAsProvider === true ||
        phoneOrPayload.join_as_provider === true;
    }

    if (!phone) {
      throw new Error('phone_required');
    }

    if (!otp) {
      throw new Error('otp_required');
    }

    const response = await api.post(
      '/verify-otp',
      {
        phone,
        otp,
        fcmToken,
        join_as_provider: joinAsProvider,
      },
      {
        headers: PROVIDER_HEADERS,
      },
    );

    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * يستخدم في خطوات تسجيل الفني:
 *
 * step values:
 * basic_info
 * work_info
 * profile_photo
 * front_id_doc
 * rear_id_doc
 */
export const completeProviderStep = async ({
  step,
  phone,
  name,
  nationalId,
  categoryId,
  experienceYears,
  profilePhoto,
  frontIdDoc,
  rearIdDoc,
}) => {
  try {
    const fcmToken = await getFcmToken();

    const formData = new FormData();

    formData.append('step', step);
    formData.append('phone', phone);
    formData.append('fcmToken', fcmToken);

    if (name !== undefined && name !== null && String(name).trim() !== '') {
      formData.append('name', String(name).trim());
    }

    if (
      nationalId !== undefined &&
      nationalId !== null &&
      String(nationalId).trim() !== ''
    ) {
      formData.append('national_id', String(nationalId).trim());
    }

    if (categoryId !== undefined && categoryId !== null) {
      formData.append('category_id', String(categoryId));
    }

    if (experienceYears !== undefined && experienceYears !== null) {
      formData.append('experience_years', String(experienceYears));
    }

    if (profilePhoto) {
      formData.append('profile_photo', profilePhoto);
    }

    if (frontIdDoc) {
      formData.append('front_id_doc', frontIdDoc);
    }

    if (rearIdDoc) {
      formData.append('rear_id_doc', rearIdDoc);
    }

    const response = await api.post('/provider/complete-step', formData, {
      headers: {
        ...PROVIDER_HEADERS,
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getHomeCategories = async () => {
  try {
    const response = await api.get('/categories-provider', {
      headers: PROVIDER_HEADERS,
    });

    return response.data;
  } catch (error) {
    throw error;
  }
};

export const completeLogin = async (response, dispatch) => {
  try {
    const token = response?.access_token;
    const user = response?.userData || response?.user;

    if (!token || !user) {
      throw new Error('Invalid login response');
    }

    dispatch(loginStart());

    dispatch(setToken(token));
    dispatch(setUser(user));

    dispatch({
      type: Actions.UPGRADE,
      payload: response?.upgrade,
    });

    if (user?.payment != 0) {
      dispatch({
        type: Actions.CHAHNGE_PAYMENT_FEATURE_STATUS,
        payload: user?.payment,
      });

      dispatch({
        type: Actions.CHAHNGE_FIXING_MODE_STATUS,
        payload: user?.fixing_mode,
      });
    }

    dispatch({
      type: Actions.UPLOAD_IMAGE_REG,
      payload: user?.image,
    });

    dispatch({
      type: Actions.UPDATE_CREDIT,
      payload: response?.wallet || response?.credit || 0,
    });

    dispatch({
      type: Actions.UPDATE_ADRESSES_ARR,
      payload: response?.addresses || [],
    });

    await AsyncStorage.setItem(TOKEN_KEY, token);
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));

    dispatch(loginSuccess());

    return true;
  } catch (error) {
    dispatch(loginFailure());
    throw error;
  }
};