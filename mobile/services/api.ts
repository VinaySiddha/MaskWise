import axios from 'axios';
import Constants from 'expo-constants';
import { useAuthStore } from '../stores/authStore';

import { Platform } from 'react-native';

const BACKEND_PORT = 8000;

function getApiBaseUrl(): string {
  const explicitUrl = process.env.EXPO_PUBLIC_API_URL;
  if (explicitUrl) {
    return explicitUrl;
  }

  if (Platform.OS === 'android' && !Constants.isDevice) {
    return `http://10.0.2.2:${BACKEND_PORT}`;
  }

  if (Platform.OS === 'ios' && !Constants.isDevice) {
    return `http://localhost:${BACKEND_PORT}`;
  }

  const hostUri =
    Constants.expoConfig?.hostUri ??
    Constants.expoGoConfig?.debuggerHost ??
    '';

  const host = hostUri.split(':')[0];
  if (host) {
    return `http://${host}:${BACKEND_PORT}`;
  }

  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    return `${window.location.protocol}//${window.location.hostname}:${BACKEND_PORT}`;
  }

  return `http://localhost:${BACKEND_PORT}`;
}

const BASE_URL = getApiBaseUrl();

export const api = axios.create({
  baseURL: BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
