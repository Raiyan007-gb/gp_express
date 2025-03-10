const Stream = require('node-rtsp-stream');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegInstaller = require('@ffmpeg-installer/ffmpeg');

ffmpeg.setFfmpegPath(ffmpegInstaller.path);

try {
  // RTSP Stream
  const rtspStream = new Stream({
    name: 'rtsp-camera',
    streamUrl: 'rtsp://192.168.0.137:11554/video/h264',
    wsPort: 9999,
    ffmpegPath: ffmpegInstaller.path,
    ffmpegOptions: {
      '-stats': '',
      '-r': 30,
      '-q:v': 3,
      '-loglevel': 'quiet'
    }
  });

  // MJPG Stream
  const mjpgStream = new Stream({
    name: 'mjpg-camera',
    streamUrl: 'https://webcam.privcom.ch/mjpg/video.mjpg',
    wsPort: 9998,
    ffmpegPath: ffmpegInstaller.path,
    ffmpegOptions: {
      '-f': 'mjpeg',
      '-r': 30,
      '-q:v': 3,
      '-loglevel': 'quiet'
    }
  });

  rtspStream.on('error', () => {});
  rtspStream.on('start', () => {});
  mjpgStream.on('error', () => {});
  mjpgStream.on('start', () => {});

} catch (error) {}