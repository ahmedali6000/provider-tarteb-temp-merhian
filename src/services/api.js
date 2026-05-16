import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { domain, TOKEN_KEY, Language_KEY } from '../utils/app';

const API_BASE_URL = domain + '/api/v2';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  async config => {
    try {
      const token = await AsyncStorage.getItem(TOKEN_KEY);
      const lang = await AsyncStorage.getItem(Language_KEY);

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      config.headers.lang = lang || 'en';
      config.headers.userType = 'client';
    } catch (error) {
      console.log('REQUEST INTERCEPTOR ERROR:', error);
    }

    return config;
  },
  error => {
    return Promise.reject(error);
  },
);

api.interceptors.response.use(
  response => response,
  async error => {
    return Promise.reject(error);
  },
);

export default api;