import React, { useEffect, useState } from 'react';
import {
  Trophy,
  Clock,
  Target,
  Flame,
  Share2,
  Award,
  Zap,
  BarChart3,
  TrendingUp,
} from 'lucide-react';
import { useLanguage } from '../LanguageContext';

export default function StatsTab({ playNav, playConfirm }) {
  const { t, language } = useLanguage();
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    // Trigger entrance animations
    setTimeout(() => setAnimate(true), 100);
  }, []);

  const topGenres = [
    { name: t('stats_action'), percentage: 45, color: 'bg-blue-500' },
    { name: t('stats_shooter'), percentage: 30, color: 'bg-fuchsia-500' },
    { name: t('stats_racing'), percentage: 15, color: 'bg-emerald-500' },
    { name: t('stats_strategy'), percentage: 10, color: 'bg-amber-500' },
  ];

  const completedGames = [
    {
      name: 'Cyberpunk 2077',
      hours: 142,
      icon: '🏆',
      color: 'from-yellow-500 to-amber-600',
      img: 'https://cdn.akamai.steamstatic.com/steam/apps/1091500/header.jpg',
    },
    {
      name: 'Elden Ring',
      hours: 215,
      icon: '👑',
      color: 'from-amber-400 to-yellow-600',
      img: 'https://cdn.akamai.steamstatic.com/steam/apps/1245620/header.jpg',
    },
    {
      name: 'Hades',
      hours: 85,
      icon: '⚡',
      color: 'from-purple-500 to-fuchsia-600',
      img: 'https://cdn.akamai.steamstatic.com/steam/apps/1145360/header.jpg',
    },
  ];

  return (
    <div
      className={`pt-24 px-10 pb-10 w-full h-full overflow-y-auto custom-scrollbar relative z-10 bg-gradient-to-b from-[#050b14] to-[#000000]`}
      dir={language === 'ar' ? 'rtl' : 'ltr'}
    >
      {/* Header */}
      <div
        className={`transition-all duration-1000 transform ${animate ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}
      >
        <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-fuchsia-500 mb-2">
          {t('stats_title')}
        </h1>
        <p className="text-white/50 text-lg">{t('stats_desc')}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        {/* Main Stats (Left Column) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Top Row Cards */}
          <div className="grid grid-cols-2 gap-6">
            {/* Playtime Card */}
            <div
              className={`bg-white/5 border border-white/10 rounded-3xl p-6 relative overflow-hidden transition-all duration-1000 delay-100 transform ${animate ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}
            >
              <div
                className={`absolute top-0 ${language === 'ar' ? 'left-0' : 'right-0'} p-6 opacity-20`}
              >
                <Clock size={80} />
              </div>
              <div className="flex items-center gap-3 text-blue-400 font-bold mb-4">
                <Clock size={20} />
                <span>{t('stats_playtime')}</span>
              </div>
              <div className="text-5xl font-black text-white mb-2">
                184 <span className="text-2xl text-white/50 font-bold">{t('stats_hrs')}</span>
              </div>
              <div className="text-emerald-400 font-bold text-sm flex items-center gap-1">
                <TrendingUp size={14} /> +12%
              </div>
            </div>

            {/* Achievements Card */}
            <div
              className={`bg-white/5 border border-white/10 rounded-3xl p-6 relative overflow-hidden transition-all duration-1000 delay-200 transform ${animate ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}
            >
              <div
                className={`absolute top-0 ${language === 'ar' ? 'left-0' : 'right-0'} p-6 opacity-20`}
              >
                <Trophy size={80} />
              </div>
              <div className="flex items-center gap-3 text-amber-400 font-bold mb-4">
                <Trophy size={20} />
                <span>{t('stats_trophies')}</span>
              </div>
              <div className="text-5xl font-black text-white mb-2">42</div>
              <div className="text-white/50 font-bold text-sm">{t('stats_trophies_desc')}</div>
            </div>
          </div>

          {/* Genre Breakdown */}
          <div
            className={`bg-white/5 border border-white/10 rounded-3xl p-8 transition-all duration-1000 delay-300 transform ${animate ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}
          >
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <BarChart3 className="text-fuchsia-400" /> {t('stats_genres')}
            </h2>

            <div className="flex w-full h-4 rounded-full overflow-hidden mb-6 bg-white/10">
              {topGenres.map((genre, idx) => (
                <div
                  key={idx}
                  className={`h-full ${genre.color} transition-all duration-1500 ease-out`}
                  style={{ width: animate ? `${genre.percentage}%` : '0%' }}
                />
              ))}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {topGenres.map((genre, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${genre.color}`} />
                  <div>
                    <div className="text-white font-bold">{genre.name}</div>
                    <div className="text-white/50 text-sm">{genre.percentage}%</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (100% Completion Cards) */}
        <div
          className={`space-y-6 transition-all duration-1000 delay-400 transform ${animate ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}
        >
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Award className="text-emerald-400" /> {t('stats_club')}
            </h2>
          </div>

          {completedGames.map((game, idx) => (
            <div
              key={idx}
              className={`relative overflow-hidden rounded-3xl border-2 border-white/10 group cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:border-white/30`}
              onClick={() => playConfirm?.()}
            >
              {/* Background Image */}
              <div className="absolute inset-0 z-0">
                <img
                  src={game.img}
                  alt={game.name}
                  className="w-full h-full object-cover opacity-30 group-hover:opacity-50 transition-opacity"
                />
                <div
                  className={`absolute inset-0 bg-gradient-to-t ${game.color} opacity-40 mix-blend-multiply`}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
              </div>

              {/* Content */}
              <div className="relative z-10 p-6 flex flex-col justify-end h-[180px]">
                <div
                  className={`absolute top-4 ${language === 'ar' ? 'left-4' : 'right-4'} text-3xl drop-shadow-lg`}
                >
                  {game.icon}
                </div>
                <div className="bg-white/20 backdrop-blur-md w-fit px-3 py-1 rounded-full text-xs font-bold text-white mb-2 border border-white/20">
                  {t('stats_plat')}
                </div>
                <h3 className="text-2xl font-black text-white drop-shadow-md">{game.name}</h3>
                <p className="text-white/80 font-bold text-sm flex items-center gap-2">
                  <Clock size={14} /> {game.hours} {t('stats_master')}
                </p>

                {/* Share button appears on hover */}
                <div
                  className={`absolute bottom-6 ${language === 'ar' ? 'left-6' : 'right-6'} opacity-0 group-hover:opacity-100 transition-opacity translate-y-4 group-hover:translate-y-0`}
                >
                  <button className="bg-white text-black p-3 rounded-full hover:bg-gray-200 shadow-xl">
                    <Share2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
