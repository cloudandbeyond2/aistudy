const http = require('http');

const options = {
  hostname: 'localhost',
  port: 5001,
  path: '/api/signin',
  method: 'OPTIONS',
  headers: {
    Origin: 'https://aistudy-xi.vercel.app',
    'Access-Control-Request-Method': 'POST',
    'Access-Control-Request-Headers': 'Content-Type'
  }
};

const req = http.request(options, (res) => {
  console.log('STATUS:', res.statusCode);
  console.log('HEADERS:');
  console.log(res.headers);
  res.setEncoding('utf8');
  let body = '';
  res.on('data', (chunk) => { body += chunk; });
  res.on('end', () => { console.log('BODY LENGTH:', body.length); process.exit(0); });
});

req.on('error', (e) => {
  console.error('Request error:', e.message);
  process.exit(1);
});

req.end();
