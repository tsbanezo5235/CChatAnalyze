const express = require("express");
const path = require('path');

const dataRoute = require('./routes/data-route');

const app = express();

app.use(express.static(path.resolve(__dirname, './public')))

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST');

  next();
});

app.use(express.json())

app.use('/api', dataRoute);

app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, './public', 'index.html'));
});

app.use((req, res, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

app.use((error, req, res, next) => {
  if (res.headerSent) {
    return next(error);
  }
  res.status(error.code || 500);
  res.json({ message: error.message || 'An unknown error occurred!' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});