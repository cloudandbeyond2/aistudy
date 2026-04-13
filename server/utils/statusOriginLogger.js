const logStatusOrigin = ({ req, status, origin, message, details }) => {
  if (!status) return;

  const entry = {
    at: new Date().toISOString(),
    status,
    origin,
    method: req?.method,
    path: req?.originalUrl || req?.url,
    message: message || '',
    details: details || undefined
  };

  console.warn('[StatusOrigin]', JSON.stringify(entry));
};

export default logStatusOrigin;
