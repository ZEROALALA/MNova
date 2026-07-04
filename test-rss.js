const fetch = require('node-fetch');
async function test() {
  const rssUrl = encodeURIComponent('https://www.pcgamer.com/rss/');
  const response = await fetch(`https://api.allorigins.win/get?url=${rssUrl}`);
  const data = await response.json();
  console.log(data.contents ? data.contents.substring(0, 100) : "NO CONTENTS");
}
test();
