import JSEncrypt from 'jsencrypt';
import CryptoJS from 'crypto-js';
import axios from 'axios';

let publicKey: string | null = null;
let fetchingPublicKey: Promise<string> | null = null;

export async function getPublicKey() {
  if (publicKey) return publicKey;
  if (fetchingPublicKey) return fetchingPublicKey;

  fetchingPublicKey = (async () => {
    try {
      const { data } = await axios.get('/encryption/public-key');
      publicKey = data.publicKey;
      return publicKey as string;
    } catch (e) {
      console.error('Failed to fetch public key', e);
      throw e; // Interceptor should catch
    } finally {
      fetchingPublicKey = null;
    }
  })();
  return fetchingPublicKey;
}

export function generateAESKey() {
  return CryptoJS.lib.WordArray.random(32).toString(); // 256-bit key
}

export function encryptAES(data: any, key: string) {
  // data can be object or string. axios data is object usually.
  const stringData =
    typeof data === 'object' ? JSON.stringify(data) : String(data);
  return CryptoJS.AES.encrypt(stringData, key).toString();
}

export function decryptAES(encryptedData: string, key: string) {
  const bytes = CryptoJS.AES.decrypt(encryptedData, key);
  const decrypted = bytes.toString(CryptoJS.enc.Utf8);
  try {
    return JSON.parse(decrypted);
  } catch (e) {
    return decrypted;
  }
}

export function encryptRSA(data: string, pubKey: string) {
  const encryptor = new JSEncrypt();
  encryptor.setPublicKey(pubKey);
  return encryptor.encrypt(data);
}
