const { exec } = require('child_process');
const { spawn } = require('child_process');

module.exports = {
  async main(req, res) {

    exec('windscribe status', (e, stdout, stderr) => {
      if (e) {
        console.log('There was an error calling windscribe status');
        res.send({ body: e });
        return;
      }
      let connected = false;
      if(stdout.search(/DISCONNECTED/) === -1) {
        console.log('Windscribe is connected');
        connected = true;
      } 

      if(!connected) {
        res.send({ body: 'VPN Disconnected' });
        return;
      }

      // const magnet = 'magnet:?xt=urn:btih:53d00793c2ca4b5885c7f434319394599b29ac85&dn=John+Wick+3+2019+HDCAM+x264+AC3-ETRG&tr=udp%3A%2F%2Ftracker.leechers-paradise.org%3A6969&tr=udp%3A%2F%2Ftracker.openbittorrent.com%3A80&tr=udp%3A%2F%2Fopen.demonii.com%3A1337&tr=udp%3A%2F%2Ftracker.coppersurfer.tk%3A6969&tr=udp%3A%2F%2Fexodus.desync.com%3A6969';
      const magnet = req.body.data;

      let child = spawn('aria2c', ['-d ../../client/public/movies', '--seed-time=0', '--always-resume', magnet]);

      console.log('Downloading...');

      child.stdout.setEncoding('utf8');

      child.stdout.on('data', data => {
        // we want a websocket here to send status updates to the front
        // end.
        console.log(data);
        res.send({ body: data });
      });

      child.on('close', async data => {
        console.log('complete! ', data);
        
      })
    });
  }
}
