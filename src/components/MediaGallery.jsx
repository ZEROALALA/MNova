import React, { useState, useEffect, useRef } from 'react';
import { Play, TrendingUp, Loader2 } from 'lucide-react';
import { useLanguage } from '../LanguageContext';
import Hls from 'hls.js';

export default function MediaGallery({ playConfirm, playLaunch }) {
  const { t, language } = useLanguage();
  const [trendingMedia, setTrendingMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [playingVideo, setPlayingVideo] = useState(null);

  useEffect(() => {
    const fetchTrendingTrailers = async () => {
      try {
        setLoading(true);
        let mediaItems = [];
        if (window.electronAPI && window.electronAPI.getTrendingMedia) {
          mediaItems = await window.electronAPI.getTrendingMedia();
        } else {
          mediaItems = [
            {
              id: '1091500',
              title: 'Cyberpunk 2077',
              image:
                'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1091500/header.jpg',
              videoUrl:
                'https://video.akamai.steamstatic.com/store_trailers/1091500/332452/9a3e8e298bd351ae40ac3eca1bca90d57b4a42ca/1750616291/hls_264_master.m3u8?t=1697117322',
              developer: 'CD PROJEKT RED',
            },
            {
              id: '1245620',
              title: 'ELDEN RING',
              image:
                'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1245620/header.jpg',
              videoUrl:
                'https://video.akamai.steamstatic.com/store_trailers/1245620/468149/7d588828f80907ca97efdcb1e6ef72b4ce2b1d0d/1750650511/hls_264_master.m3u8?t=1654109241',
              developer: 'FromSoftware Inc.',
            },
            {
              id: '271590',
              title: 'Grand Theft Auto V',
              image:
                'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/271590/header.jpg',
              videoUrl:
                'https://video.akamai.steamstatic.com/store_trailers/271590/844302/de4ad49997171bd3f4d05299cc3e718cfe0307ee/1751269402/hls_264_master.m3u8?t=1741119978',
              developer: 'Rockstar North',
            },
            {
              id: '2358720',
              title: 'Black Myth: Wukong',
              image:
                'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2358720/header.jpg',
              videoUrl:
                'https://video.akamai.steamstatic.com/store_trailers/2358720/743632/6acf4311bb6a59d300b902ab6a3f445215089d9c/1750812851/hls_264_master.m3u8?t=1729236218',
              developer: 'Game Science',
            },
            {
              id: '1174180',
              title: 'Red Dead Redemption 2',
              image:
                'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1174180/header.jpg',
              videoUrl:
                'https://video.akamai.steamstatic.com/store_trailers/1174180/254763/b5d4c79496d88d3e08c5968d7bd18b20db5efaa1/1750634245/hls_264_master.m3u8?t=1574881363',
              developer: 'Rockstar Games',
            },
          ];
        }

        setTrendingMedia(mediaItems);
      } catch (error) {
        console.error('Failed to fetch trending media:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTrendingTrailers();
  }, []);

  const videoRef = useRef(null);

  useEffect(() => {
    if (playingVideo && videoRef.current) {
      if (Hls.isSupported() && playingVideo.includes('.m3u8')) {
        const hls = new Hls({ maxBufferLength: 30, maxMaxBufferLength: 60 });
        hls.loadSource(playingVideo);
        hls.attachMedia(videoRef.current);
        hls.on(Hls.Events.MANIFEST_PARSED, function () {
          videoRef.current.play().catch((e) => console.log('Auto-play prevented', e));
        });
        return () => hls.destroy();
      } else {
        videoRef.current.src = playingVideo;
        videoRef.current.play().catch((e) => console.log('Auto-play prevented', e));
      }
    }
  }, [playingVideo]);

  return (
    <div className="pt-24 px-10 pb-10 w-full h-full overflow-y-auto custom-scrollbar relative z-10 bg-gradient-to-b from-[#050b14] to-[#000000]" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="flex items-center gap-4 mb-10">
        <div className="p-3 bg-cyan-500/20 rounded-xl border border-cyan-500/50 shadow-[0_0_20px_rgba(0,229,255,0.2)]">
          <TrendingUp className="w-8 h-8 text-cyan-400" />
        </div>
        <div>
          <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600 tracking-wider uppercase drop-shadow-sm">
            {t('media_trending')}
          </h1>
          <p className="text-cyan-500/70 font-semibold tracking-widest uppercase text-sm mt-1">
            {t('media_hype')}
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center mt-32 text-cyan-500 gap-4">
          <Loader2 className="w-12 h-12 animate-spin" />
          <p className="text-xl font-bold animate-pulse tracking-widest uppercase">
            Scanning Global Servers...
          </p>
        </div>
      ) : trendingMedia.length === 0 ? (
        <div className="text-white/50 text-center mt-20">
          <p className="text-xl mb-2">No trending media found right now.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 pb-20">
          {trendingMedia.map((game, i) => (
            <div
              key={game.id}
              className="group relative flex flex-col bg-[#0a111a] rounded-2xl overflow-hidden border border-cyan-900/30 hover:border-cyan-400 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(0,229,255,0.15)] shadow-2xl"
              style={{ animation: `fadeInUp 0.6s ease-out ${i * 0.15}s backwards` }}
            >
              {/* Thumbnail Container */}
              <div className="aspect-[16/9] w-full overflow-hidden relative bg-black">
                <img
                  src={game.image}
                  alt={game.title}
                  className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
                />

                {/* Play Button Overlay */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[2px]">
                  <button
                    onClick={() => {
                      playLaunch?.();
                      setPlayingVideo(game.videoUrl);
                    }}
                    className="w-20 h-20 rounded-full bg-cyan-500/90 text-black flex items-center justify-center hover:bg-white hover:scale-110 transition-all duration-300 shadow-[0_0_40px_rgba(0,229,255,0.6)]"
                  >
                    <Play size={36} className="ml-2" />
                  </button>
                </div>

                {/* Badge */}
                <div className="absolute top-4 left-4 bg-red-600 text-white text-xs font-black px-3 py-1.5 rounded-lg shadow-lg tracking-wider uppercase border border-red-400/50">
                  HOT
                </div>
              </div>

              {/* Details Info */}
              <div className="p-6 relative">
                <p className="text-cyan-500 text-xs font-bold tracking-widest uppercase mb-2 line-clamp-1">
                  {game.developer}
                </p>
                <h3 className="text-white font-black tracking-wide text-2xl drop-shadow-md mb-4 line-clamp-1 group-hover:text-cyan-400 transition-colors">
                  {game.title}
                </h3>

                <button
                  onClick={() => {
                    playLaunch?.();
                    setPlayingVideo(game.videoUrl);
                  }}
                  className="w-full py-3 rounded-lg bg-white/5 hover:bg-cyan-500/20 border border-white/10 hover:border-cyan-500 text-white font-bold tracking-widest uppercase transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <Play size={16} />
                  {t('media_watch')}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Fullscreen Video Player Modal */}
      {playingVideo && (
        <div
          className="fixed inset-0 z-[150] bg-black/95 flex flex-col justify-center items-center p-8 animate-[fade-in_0.3s_ease-out] backdrop-blur-xl"
          onClick={() => {
            playConfirm?.();
            setPlayingVideo(null);
          }}
        >
          <button
            className="absolute top-8 right-8 text-white/50 hover:text-white transition-colors p-4 rounded-full hover:bg-white/10 z-[160] bg-black/50"
            onClick={() => {
              playConfirm?.();
              setPlayingVideo(null);
            }}
          >
            ✕ Close
          </button>

          <div className="w-full max-w-7xl aspect-video rounded-2xl overflow-hidden shadow-[0_0_100px_rgba(0,229,255,0.2)] border border-white/10 relative bg-black">
            <video
              ref={videoRef}
              className="w-full h-full object-contain"
              autoPlay
              controls
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
}
