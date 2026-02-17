import axios from 'axios';
import type { AxiosRequestConfig, AxiosResponse } from 'axios';
import { Message } from '@arco-design/web-vue';
import { useUserStore } from '@/store';
import { getToken } from '@/utils/auth';
import {
  getPublicKey,
  generateAESKey,
  encryptAES,
  encryptRSA,
  decryptAES,
} from '@/utils/encryption';

export interface HttpResponse<T = unknown> {
  status: number;
  msg: string;
  code: number;
  data: T;
}

if (import.meta.env.VITE_API_BASE_URL) {
  axios.defaults.baseURL = import.meta.env.VITE_API_BASE_URL;
}

axios.interceptors.request.use(
  (config: AxiosRequestConfig) => {
    // let each request carry token
    // this example using the JWT token
    // Authorization is a custom headers key
    // please modify it according to the actual situation
    const token = getToken();
    if (token) {
      if (!config.headers) {
        config.headers = {};
      }
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Encryption Logic
    // Skip if requesting public key to avoid loop
    if (config.encryption && !config.url?.includes('/encryption/public-key')) {
      try {
        // This needs to be async, but axios interceptors can return Promise.
        // We can't await here directly unless we return a Promise.
        // Request interceptor allows returning Promise.
        // Wait, axios request interceptor CAN return a Promise.
        return (async () => {
          const pubKey = await getPublicKey();
          const aesKey = generateAESKey();

          // Store AES Key for response decryption
          config.aesKey = aesKey;

          const encryptedData = encryptAES(config.data, aesKey);
          const encryptedKey = encryptRSA(aesKey, pubKey);

          if (!encryptedKey) {
            throw new Error('RSA Encryption failed');
          }

          config.data = {
            data: encryptedData,
            key: encryptedKey,
          };

          if (!config.headers) config.headers = {};
          config.headers['x-encryption'] = 'true';

          return config;
        })();
      } catch (e) {
        return Promise.reject(e);
      }
    }

    return config;
  },
  (error) => {
    // do something
    return Promise.reject(error);
  }
);
// add response interceptors
axios.interceptors.response.use(
  (response: AxiosResponse) => {
    // NestJS 后端直接返回数据，不包装在 code/data 结构中
    // 直接返回 response.data，因为 axios 包装了一层 data

    // Decryption Logic
    const { config } = response;
    if (
      config.encryption &&
      config.aesKey &&
      response.data &&
      response.data.data
    ) {
      // Assume response.data is { data: "encrypted" }
      try {
        const decrypted = decryptAES(response.data.data, config.aesKey);
        return decrypted;
      } catch (e) {
        // console.error('Decryption failed', e);
        // Return original if failed? Or throw?
        // Usually throw or return raw.
        return response.data;
      }
    }

    return response.data;
  },
  (error) => {
    // 处理 401 未授权错误
    if (error.response?.status === 401) {
      const userStore = useUserStore();
      // 如果不是登录页面，清除 token 并跳转到登录
      if (window.location.pathname !== '/login') {
        userStore.logoutCallBack();
        window.location.href = '/login';
      }
    }

    const resData = error.response?.data;
    const errorMessage =
      resData?.msg || resData?.message || error.message || 'Request Error';

    Message.error({
      content: errorMessage,
      duration: 5 * 1000,
    });

    // 更新错误对象的 message 属性，以便上层直接使用
    if (error) {
      error.message = errorMessage;
    }

    return Promise.reject(error);
  }
);
