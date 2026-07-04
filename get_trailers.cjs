const fetch = require('node-fetch');

async function getTrailers() {
  const games = ['1091500', '1245620', '271590']; // Cyberpunk, Elden Ring, GTA V
  for (const id of games) {
    try {
      const res = await fetch(`https://store.steampowered.com/api/appdetails?appids=${id}`);
      const data = await res.json();
      const app = data[id]?.data;
      if (app && app.movies && app.movies.length > 0) {
        console.log(`Game: ${app.name}`);
        console.log(app.movies[0]);
      } else {
        console.log(`No trailer for ${id}`);
      }
    } catch (e) {
      console.log(`Error fetching ${id}`, e.message);
    }
  }
}

getTrailers();
