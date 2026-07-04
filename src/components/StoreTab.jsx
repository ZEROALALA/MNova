import React, { useState, useEffect } from 'react';
import {
  ShoppingCart,
  Star,
  Clock,
  Trophy,
  Target,
  Sparkles,
  Filter,
  ChevronRight,
  Check,
  Loader2,
  Gamepad2,
  Percent,
  Flame,
  ExternalLink,
} from 'lucide-react';
import { useLanguage } from '../LanguageContext';

export default function StoreTab({ playNav, playConfirm }) {
  const { t, language } = useLanguage();
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDeals = async () => {
      try {
        const CACHE_KEY = 'mnova_store_deals_cache';
        const CACHE_TIME_KEY = 'mnova_store_deals_time';
        const now = Date.now();
        const cachedData = localStorage.getItem(CACHE_KEY);
        const cachedTime = localStorage.getItem(CACHE_TIME_KEY);
        
        // 24 hours in milliseconds
        const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;
        
        if (cachedData && cachedTime && (now - parseInt(cachedTime, 10)) < TWENTY_FOUR_HOURS) {
          setDeals(JSON.parse(cachedData));
          setLoading(false);
          return;
        }

        const res = await fetch(
          'https://www.cheapshark.com/api/1.0/deals?storeID=1&upperPrice=20&sortBy=Deal%20Rating'
        );
        const data = await res.json();
        const dealsSlice = data.slice(0, 24);
        setDeals(dealsSlice);
        
        // Save to cache
        localStorage.setItem(CACHE_KEY, JSON.stringify(dealsSlice));
        localStorage.setItem(CACHE_TIME_KEY, now.toString());
      } catch (err) {
        console.error('Error fetching deals:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDeals();
  }, []);

  const openDeal = (dealID) => {
    playConfirm?.();
    window.open(`https://www.cheapshark.com/redirect?dealID=${dealID}`, '_blank');
  };

  return (
    <div
      className="pt-24 px-10 pb-10 w-full h-full overflow-y-auto custom-scrollbar relative z-10 bg-gradient-to-b from-[#050b14] to-[#000000]"
      dir={language === 'ar' ? 'rtl' : 'ltr'}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-10">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-700 flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.4)]">
            <ShoppingCart className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-white tracking-tight">{t('store_title')}</h1>
            <p className="text-white/50 text-sm mt-1">{t('store_desc')}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl">
          <Flame size={18} />
          <span className="font-bold">{t('store_hot_deals')}</span>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64 text-white/50">
          <Loader2 size={48} className="animate-spin text-emerald-500" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-20">
          {deals.map((deal) => {
            const savings = Math.round(parseFloat(deal.savings));
            return (
              <div
                key={deal.dealID}
                onClick={() => openDeal(deal.dealID)}
                className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:bg-white/10 hover:scale-[1.02] hover:border-emerald-500/50 transition-all cursor-pointer group flex flex-col shadow-lg"
              >
                {/* Image */}
                <div className="relative h-40 w-full bg-[#111] overflow-hidden">
                  <img
                    src={deal.thumb}
                    alt={deal.title}
                    className="w-full h-full object-cover group-hover:opacity-80 transition-opacity"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.parentElement.innerHTML =
                        '<div class="w-full h-full flex items-center justify-center"><Gamepad2 size={48} class="text-white/20" /></div>';
                    }}
                  />
                  {/* Discount Badge */}
                  <div className="absolute top-3 right-3 bg-emerald-500 text-black font-extrabold px-3 py-1 rounded-full text-sm flex items-center gap-1 shadow-[0_0_15px_rgba(16,185,129,0.5)]">
                    <Percent size={14} />
                    {savings}%
                  </div>
                </div>

                {/* Details */}
                <div className="p-5 flex flex-col flex-1">
                  <h3 className="text-white font-bold text-lg leading-tight mb-2 line-clamp-2 flex-1 group-hover:text-emerald-400 transition-colors">
                    {deal.title}
                  </h3>

                  <div className="flex items-end justify-between mt-4">
                    <div className="flex flex-col">
                      <span className="text-white/40 text-xs line-through mb-1">
                        ${deal.normalPrice}
                      </span>
                      <span className="text-emerald-400 font-bold text-2xl">${deal.salePrice}</span>
                    </div>

                    <button className="w-10 h-10 rounded-xl bg-white/10 group-hover:bg-emerald-600 text-white flex items-center justify-center transition-colors">
                      <ExternalLink size={18} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
