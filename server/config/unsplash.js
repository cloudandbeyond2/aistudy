import { createApi } from 'unsplash-js';

let unsplash = null;

if (process.env.UNSPLASH_ACCESS_KEY) {
  unsplash = createApi({
    accessKey: process.env.UNSPLASH_ACCESS_KEY
  });
} else {
  console.warn('⚠️ UNSPLASH_ACCESS_KEY not set');
}

export default unsplash;
