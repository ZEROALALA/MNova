const fetch = require('node-fetch');

async function getTrailers(games) {
  for (const id of games) {
    try {
      const res = await fetch(`https://store.steampowered.com/api/appdetails?appids=${id}`);
      const data = await res.json();
      const app = data[id]?.data;
      if (app && app.movies && app.movies.length > 0) {
        console.log(`\nGame: ${app.name}`);
        // Log all movies to see their names and IDs
        for (const movie of app.movies) {
          console.log(` - [${movie.id}] ${movie.name}: ${movie.hls_h264}`);
        }
      } else {
        console.log(`No trailer for ${id}`);
      }
    } catch (e) {
      console.log(`Error fetching ${id}`, e.message);
    }
  }
}

getTrailers(['2358720', '1174180']);
