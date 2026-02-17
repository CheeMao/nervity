import 'axios';

declare module 'axios' {
  interface AxiosRequestConfig {
    encryption?: boolean;
    aesKey?: string; // Store key for response decryption
  }
}
