const express = require('express');
const cors = require('cors');
const path = require('path');
const transcribeRouter = require('./Routes/transcribeRouter');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controller/errorController');

const app = express();

app.use(express.static(path.join(__dirname, '../client/dist')));

// Middleware
app.use(cors());
app.use(express.json());

// Routes

app.use('/api/transcribe', transcribeRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});
app.use(globalErrorHandler);

module.exports = app;
