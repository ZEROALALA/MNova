const fetch = require('node-fetch');

async function testFilter() {
  try {
    const featuredRes = await fetch('https://store.steampowered.com/api/featuredcategories');
    const categories = await featuredRes.json();
    const topSellers = categories.top_sellers.items.slice(0, 10);
    
    for (const game of topSellers) {
      const res = await fetch(`https://store.steampowered.com/api/appdetails?appids=${game.id}`);
      const data = await res.json();
      const app = data[game.id]?.data;
      if (app) {
        console.log(`[${app.type}] ${app.name} - Windows: ${app.platforms?.windows}`);
      }
    }
  } catch (e) {
    console.log(e);
  }
}
testFilter();
