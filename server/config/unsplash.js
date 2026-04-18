import { createApi } from 'unsplash-js';
import fetch from 'node-fetch';
import Admin from '../models/Admin.js';

let cachedApi = null;
let cachedKey = null;

export const getUnsplashApi = async () => {
  try {
    if (cachedApi) return cachedApi;

    const admin = await Admin.findOne({ type: 'main' });

    const accessKey =
      admin?.unsplashApiKey?.trim() ||
      process.env.UNSPLASH_ACCESS_KEY;

    if (!accessKey) {
      console.warn('⚠️ Unsplash API key missing');
      return null;
    }

    if (cachedKey === accessKey && cachedApi) {
      return cachedApi;
    }

    cachedKey = accessKey;

    cachedApi = createApi({
      accessKey,
      fetch
    });

    console.log('✅ Unsplash API initialized');

    return cachedApi;

  } catch (error) {
    console.error('❌ Unsplash init error:', error.message);
    return null;
  }
};
