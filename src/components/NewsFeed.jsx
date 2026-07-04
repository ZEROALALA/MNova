import React, { useState, useEffect } from 'react';
import { Newspaper, ExternalLink, Flame, Clock, ChevronRight } from 'lucide-react';
import { useLanguage } from '../LanguageContext';

export default function NewsFeed() {
  const { t } = useLanguage();
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        const rssUrl = encodeURIComponent('https://www.pcgamer.com/rss/');
        const response = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${rssUrl}`);
        const data = await response.json();

        if (data.status === 'ok') {
          const parsedNews = data.items.slice(0, 15).map((item) => {
            // Find an image from enclosure or thumbnail
            let image = item.enclosure?.link || item.thumbnail;

            // Fallback image if none found
            if (!image) {
              image =
                'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=1000';
            }

            return {
              id: item.guid || Math.random().toString(),
              title: item.title || 'Gaming News',
              link: item.link || '#',
              pubDate: item.pubDate || new Date().toISOString(),
              image: image,
              author: item.author || 'PC Gamer',
            };
          });
          setNews(parsedNews);
        }
      } catch (error) {
        console.error('Failed to fetch news:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  if (loading) {
    return (
      <div className="absolute inset-0 pt-24 px-12 pb-12 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div
      className="absolute inset-0 pt-28 px-12 pb-12 overflow-y-auto custom-scrollbar"
      style={{ zIndex: 10 }}
    >
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <Newspaper className="w-8 h-8 text-blue-400" />
          <h1 className="text-4xl font-bold tracking-wider">{t('news_global')}</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {news.map((item, i) => (
            <a
              key={item.id}
              href={item.link}
              target="_blank"
              rel="noreferrer"
              className="group relative bg-white/5 rounded-xl overflow-hidden border border-white/10 hover:border-white/30 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-blue-500/20"
              style={{ animation: `fadeInUp 0.5s ease-out ${i * 0.1}s backwards` }}
            >
              <div className="aspect-video w-full overflow-hidden relative">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

                {i < 3 && (
                  <div className="absolute top-3 right-3 bg-red-500/90 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 backdrop-blur-sm shadow-lg">
                    <Flame className="w-3 h-3" />
                    TRENDING
                  </div>
                )}
              </div>

              <div className="p-5 relative bg-black/40 backdrop-blur-md h-full">
                <h3 className="text-xl font-bold mb-3 line-clamp-2 leading-tight group-hover:text-blue-400 transition-colors">
                  {item.title}
                </h3>

                <div className="flex items-center justify-between text-white/50 text-sm mt-4">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>
                      {new Date(item.pubDate).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity text-blue-400 font-semibold">
                    Read <ExternalLink className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
