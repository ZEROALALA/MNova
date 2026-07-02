const https = require('https');
const fs = require('fs');

const url = 'https://media.direct.playstation.com/is/image/sierialto/dualsense-ps5-controller-front?$Background_Large$';
const file = fs.createWriteStream("public/dualsense.png");

https.get(url, {
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  }
}, response => {
  response.pipe(file);
  file.on('finish', () => {
    file.close();
    console.log("Download Completed. Size: " + fs.statSync("public/dualsense.png").size);
  });
}).on('error', err => {
  fs.unlink("public/dualsense.png");
  console.error(err.message);
});
