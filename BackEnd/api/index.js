const app = require('../app.js');

app.get('/api', (req, res) => {
  const path = '/api/item/1234';
  res.setHeader('Content-Type', 'text/html');
  res.setHeader('Cache-Control', 's-max-age=1, stale-while-revalidate');
  res.end(`Hello test! Go to item: <a href="${path}">${path}</a>`);
});

module.exports = app;
