const express = require('express');
const transcribeController = require('../controller/transcribeController');

const router = express.Router();

router.post(
  '/upload',
  transcribeController.uploadAudio,
  transcribeController.handleAudioUpload
);

module.exports = router;
