const { createClient } = require('@deepgram/sdk');
const { supabase } = require('./../supabaseClient');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

// Deepgram Client
const deepgram = createClient(process.env.Deepgram_API_KEY);

// Multer setup for multiple files
const upload = multer({ dest: 'temp_audio/' });
exports.uploadAudio = upload.array('audio', 4); // Allow up to 4 files

exports.handleAudioUpload = catchAsync(async (req, res, next) => {
  if (!req.files || req.files.length === 0) {
    return next(new AppError('No audio files uploaded!', 400));
  }

  const results = [];

  for (const file of req.files) {
    const originalExt = path.extname(file.originalname);
    const newFileName = `audio-${Date.now()}-${Math.random().toString(36).substring(7)}${originalExt}`;
    const tempPath = file.path;
    const newFilePath = path.join('temp_audio', newFileName);

    // Rename with extension
    fs.renameSync(tempPath, newFilePath);

    const audioBuffer = fs.readFileSync(newFilePath);

    // Upload to Supabase
    const { error: uploadError } = await supabase.storage
      .from('audio')
      .upload(`audio/${newFileName}`, audioBuffer, {
        contentType: file.mimetype
      });

    if (uploadError) {
      fs.unlinkSync(newFilePath);
      continue; // Skip this file and move on
    }

    await supabase.from('Transcription').insert([{ filename: newFileName }]);

    // Transcribe
    const { result, error } = await deepgram.listen.prerecorded.transcribeFile(
      audioBuffer,
      { smart_format: true, model: 'nova-2', language: 'en-US' }
    );

    let transcript = '';
    if (!error) {
      transcript = result.results.channels[0].alternatives[0].transcript;

      await supabase
        .from('Transcription')
        .update({ transcription: transcript })
        .eq('filename', newFileName);
    }

    // Clean up
    fs.unlinkSync(newFilePath);

    results.push({
      file: newFileName,
      transcript: transcript || 'Transcription failed'
    });
  }

  res.status(200).json({
    status: 'success',
    data: results
  });
});
