const { exec } = require('child_process');
const { spawn } = require('child_process');
exec('windscribe status', (e, stdout, stderr) => {
  if (e) console.log(e);
  console.log(stdout);
  let connected = false;
  if(stdout.search(/DISCONNECTED/) === -1) {
    console.log('Windscribe is connected');
    connected = true;
  } 

  if(!connected) return;

  const magnet = 'magnet:?xt=urn:btih:53d00793c2ca4b5885c7f434319394599b29ac85&dn=John+Wick+3+2019+HDCAM+x264+AC3-ETRG&tr=udp%3A%2F%2Ftracker.leechers-paradise.org%3A6969&tr=udp%3A%2F%2Ftracker.openbittorrent.com%3A80&tr=udp%3A%2F%2Fopen.demonii.com%3A1337&tr=udp%3A%2F%2Ftracker.coppersurfer.tk%3A6969&tr=udp%3A%2F%2Fexodus.desync.com%3A6969';

  let child = spawn('aria2c', ['-d downloads', '--seed-time=0', '--always-resume', magnet]);

  console.log('Downloading...');

  child.stdout.setEncoding('utf8');

  child.stdout.on('data', data => {
    console.log(data);
  });
  
  child.on('close', data => {
    console.log('complete! ', data);
  })
});
