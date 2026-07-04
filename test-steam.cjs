const fetch = require('node-fetch');
async function test() {
  try {
    const featuredUrl = encodeURIComponent('https://store.steampowered.com/api/featuredcategories');
    console.log("Fetching...", `https://api.allorigins.win/get?url=${featuredUrl}`);
    const res = await fetch(`https://api.allorigins.win/get?url=${featuredUrl}`);
    const json = await res.json();
    console.log(json.contents ? json.contents.substring(0, 100) : "NO CONTENTS");
  } catch (e) {
    console.error(e);
  }
}
test();
