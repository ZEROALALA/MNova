import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

export default function NewsFeed({ games }) {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadNews() {
      setLoading(true);
      const allNews = [];
      const steamGames = games.filter(g => g.steamId && !g.isAddCard && !g.isGridCard).slice(0, 8); 
      
      for (const game of steamGames) {
        const items = await api.getGameNews(game.steamId);
        if (items && Array.isArray(items)) {
          allNews.push(...items.map(item => ({ ...item, gameTitle: game.title })));
        }
      }
      
      allNews.sort((a, b) => b.date - a.date);
      setNews(allNews);
      setLoading(false);
    }
    if (games.length > 0) loadNews();
  }, [games]);

  return (
    <div className="pt-24 px-10 pb-10 w-full h-full overflow-y-auto custom-scrollbar relative z-10 bg-gradient-to-b from-transparent to-[#02050a]/90">
      <h1 className="text-4xl font-bold text-white mb-8 drop-shadow-lg tracking-wider">LATEST NEWS</h1>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : news.length === 0 ? (
        <div className="text-white/50 text-center mt-20">
          <p className="text-xl mb-2">No news available.</p>
          <p className="text-sm">We couldn't fetch news for your games right now.</p>
        </div>
      ) : (
        <div className="grid gap-6 max-w-5xl mx-auto pb-20">
          {news.map((item, i) => (
            <div key={i} className="bg-[#1a1a1a]/80 backdrop-blur-md rounded-2xl p-8 border border-white/10 hover:border-cyan-500/50 transition-all duration-300 hover:shadow-[0_10px_30px_rgba(0,255,255,0.1)] hover:-translate-y-1">
              <div className="text-cyan-400 font-bold mb-2 tracking-widest text-sm uppercase flex items-center gap-2">
                <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                {item.gameTitle}
              </div>
              <h2 className="text-2xl font-bold text-white mb-3 leading-snug" dangerouslySetInnerHTML={{__html: item.title}}></h2>
              <div className="text-white/40 text-xs mb-6 font-mono tracking-wider">
                {new Date(item.date * 1000).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })} // VIA {item.feedlabel.toUpperCase()}
              </div>
              <div className="text-white/70 line-clamp-3 text-sm leading-relaxed" dangerouslySetInnerHTML={{__html: item.contents}}></div>
              <a href={item.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 mt-6 px-4 py-2 bg-white/5 hover:bg-cyan-500/20 text-cyan-400 font-bold text-sm rounded-lg transition-colors border border-transparent hover:border-cyan-500/30">
                READ FULL ARTICLE →
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
