import axios, { AxiosHeaders } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API } from '../config/env';

const TOKEN_KEY = 'token';

const http = axios.create({
  baseURL: API.BASE_URL, // ✅ base URL defined ONCE here
  timeout: 15000,
});

http.interceptors.request.use(async (config) => {
  const headers = AxiosHeaders.from(config.headers || {});
  const token = await AsyncStorage.getItem('token');

  const PUBLIC_PATHS = [
    '/avis/etablissement',
    '/avis/summary',
    '/filters',
    '/etablissements/search',
    '/etablissements/find/by/id',
    '/availability',
    '/maps',
  ];

  const url = config.url ?? '';
  const isPublic = PUBLIC_PATHS.some(p => url.startsWith(p));

  if (token && !isPublic) {
    headers.set('Authorization', `Bearer ${token}`);
  } else {
    headers.delete('Authorization');
  }

  config.headers = headers;
  return config;
});

export default http;
