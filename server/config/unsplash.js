import { createApi } from 'unsplash-js';
import Admin from '../models/Admin.js';

export const getUnsplashApi = async () => {
  const admin = await Admin.findOne({ type: 'main' });
  const accessKey = admin?.unsplashApiKey || process.env.UNSPLASH_ACCESS_KEY;

  if (!accessKey) {
    console.warn('⚠️ UNSPLASH_ACCESS_KEY not set');
    return null;
  }

  return createApi({ accessKey });
};
