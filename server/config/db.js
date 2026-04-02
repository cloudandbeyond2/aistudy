import mongoose from 'mongoose';

let connectPromise = null;
let listenersRegistered = false;

const sanitizeMongoUri = (uri) => {
  try {
    const parsed = new URL(uri);
    if (parsed.username) parsed.username = '***';
    if (parsed.password) parsed.password = '***';
    return parsed.toString();
  } catch {
    return '[invalid MongoDB URI]';
  }
};

const formatMongoError = (err) => {
  const details = {
    name: err?.name,
    message: err?.message,
    code: err?.code,
    codeName: err?.codeName,
    cause: err?.cause?.message
  };

  return Object.entries(details)
    .filter(([, value]) => value)
    .map(([key, value]) => `${key}=${value}`)
    .join(', ');
};

const isTlsHandshakeError = (err) => {
  const text = `${err?.message || ''} ${err?.cause?.message || ''}`.toLowerCase();
  return text.includes('ssl') || text.includes('tls') || text.includes('alert number 80');
};

const getMongoOptions = () => ({
  appName: process.env.MONGODB_APP_NAME || 'aistudy-server',
  serverSelectionTimeoutMS: Number(process.env.MONGODB_SERVER_SELECTION_TIMEOUT_MS || 10000),
  socketTimeoutMS: Number(process.env.MONGODB_SOCKET_TIMEOUT_MS || 45000),
  family: process.env.MONGODB_FORCE_IPV4 === 'true' ? 4 : undefined
});

const registerConnectionListeners = () => {
  if (listenersRegistered) return;
  listenersRegistered = true;

  mongoose.connection.on('connected', () => {
    console.log('MongoDB connected');
  });

  mongoose.connection.on('error', (err) => {
    console.error('MongoDB connection event error:', formatMongoError(err));
  });

  mongoose.connection.on('disconnected', () => {
    console.warn('MongoDB disconnected');
  });
};

const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    console.warn('MONGODB_URI not set');
    return false;
  }

  if (mongoose.connection.readyState === 1) {
    return true;
  }

  registerConnectionListeners();

  if (!connectPromise) {
    connectPromise = mongoose.connect(mongoUri, getMongoOptions())
      .then(() => true)
      .catch((err) => {
        console.error('MongoDB error:', formatMongoError(err));
        console.error('MongoDB target:', sanitizeMongoUri(mongoUri));

        if (isTlsHandshakeError(err)) {
          console.error(
            'MongoDB TLS hint: verify Atlas IP access list, cluster status, and whether your network/proxy is intercepting TLS. If DNS or IPv6 is flaky, try setting MONGODB_FORCE_IPV4=true.'
          );
        }

        return false;
      })
      .finally(() => {
        connectPromise = null;
      });
  }

  return connectPromise;
};

export default connectDB;
