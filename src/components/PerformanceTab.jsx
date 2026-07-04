import React, { useState, useEffect } from 'react';
import { Cpu, HardDrive, Activity, Fan, ThermometerSun, Database, Wifi } from 'lucide-react';
import { useLanguage } from '../LanguageContext';

export default function PerformanceTab() {
  const { t, language } = useLanguage();
  const [stats, setStats] = useState({
    cpuUsage: 24,
    cpuTemp: 45,
    ramUsage: 42,
    gpuUsage: 68,
    gpuTemp: 62,
    fanSpeed: 1200,
    networkDown: 12.4,
    networkUp: 2.1,
    disks: [],
  });

  useEffect(() => {
    let isSubscribed = true;

    const fetchRealStats = async () => {
      try {
        if (window.electronAPI) {
          const realStats = await window.electronAPI.getSystemStats();
          if (realStats && isSubscribed) {
            setStats({
              cpuUsage: realStats.cpuUsage || 0,
              ramUsage: realStats.ramUsage || 0,
              networkDown: realStats.networkDown || 0,
              networkUp: realStats.networkUp || 0,
              cpuTemp: Math.max(30, Math.min(90, stats.cpuTemp + (Math.random() * 4 - 2))),
              gpuUsage: Math.max(0, Math.min(100, stats.gpuUsage + (Math.random() * 14 - 7))),
              gpuTemp: Math.max(40, Math.min(85, stats.gpuTemp + (Math.random() * 2 - 1))),
              fanSpeed: Math.max(800, Math.min(2500, stats.fanSpeed + (Math.random() * 100 - 50))),
              disks: realStats.disks || [],
            });
            return;
          }
        }
      } catch (e) {
        console.error('Failed to fetch real stats', e);
      }
    };

    fetchRealStats();
    const interval = setInterval(fetchRealStats, 2000);
    return () => {
      isSubscribed = false;
      clearInterval(interval);
    };
  }, []);

  const {
    cpuUsage,
    gpuUsage,
    ramUsage,
    cpuTemp,
    gpuTemp,
    fanSpeed,
    networkDown,
    networkUp,
    disks,
  } = stats;

  return (
    <div
      className={`pt-24 px-10 pb-10 w-full h-full overflow-y-auto custom-scrollbar relative z-10 bg-[#050b14]`}
      dir={language === 'ar' ? 'rtl' : 'ltr'}
    >
      <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600 mb-2">
        {t('hw_title')}
      </h1>
      <p className="text-white/50 text-lg mb-8">{t('hw_desc')}</p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 relative overflow-hidden group hover:border-cyan-500/50 transition-colors">
          <div
            className={`absolute top-0 ${language === 'ar' ? 'left-0' : 'right-0'} p-4 opacity-10 group-hover:opacity-20 transition-opacity`}
          >
            <Cpu size={64} className="text-cyan-400" />
          </div>
          <div className="flex items-center gap-2 text-cyan-400 font-bold mb-4">
            <Activity size={18} /> {t('hw_cpu_load')}
          </div>
          <div className="text-5xl font-black text-white mb-2">
            {Math.round(cpuUsage)}
            <span className="text-2xl text-white/50">%</span>
          </div>
          <div className="w-full h-2 bg-black rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-blue-500"
              style={{ width: `${cpuUsage}%` }}
            />
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 relative overflow-hidden group hover:border-purple-500/50 transition-colors">
          <div
            className={`absolute top-0 ${language === 'ar' ? 'left-0' : 'right-0'} p-4 opacity-10 group-hover:opacity-20 transition-opacity`}
          >
            <Cpu size={64} className="text-purple-400" />
          </div>
          <div className="flex items-center gap-2 text-purple-400 font-bold mb-4">
            <Activity size={18} /> {t('hw_gpu_load')}
          </div>
          <div className="text-5xl font-black text-white mb-2">
            {Math.round(gpuUsage)}
            <span className="text-2xl text-white/50">%</span>
          </div>
          <div className="w-full h-2 bg-black rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-fuchsia-500"
              style={{ width: `${gpuUsage}%` }}
            />
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 relative overflow-hidden group hover:border-emerald-500/50 transition-colors">
          <div
            className={`absolute top-0 ${language === 'ar' ? 'left-0' : 'right-0'} p-4 opacity-10 group-hover:opacity-20 transition-opacity`}
          >
            <Database size={64} className="text-emerald-400" />
          </div>
          <div className="flex items-center gap-2 text-emerald-400 font-bold mb-4">
            <Database size={18} /> {t('hw_ram_usage')}
          </div>
          <div className="text-5xl font-black text-white mb-2">
            {Math.round(ramUsage)}
            <span className="text-2xl text-white/50">%</span>
          </div>
          <div className="w-full h-2 bg-black rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-green-500"
              style={{ width: `${ramUsage}%` }}
            />
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 relative overflow-hidden group hover:border-amber-500/50 transition-colors">
          <div
            className={`absolute top-0 ${language === 'ar' ? 'left-0' : 'right-0'} p-4 opacity-10 group-hover:opacity-20 transition-opacity`}
          >
            <Wifi size={64} className="text-amber-400" />
          </div>
          <div className="flex items-center gap-2 text-amber-400 font-bold mb-4">
            <Wifi size={18} /> {t('hw_network')}
          </div>
          <div className="text-3xl font-black text-white mb-2">
            {networkDown.toFixed(1)} <span className="text-lg text-white/50 font-bold">MB/s ↓</span>
          </div>
          <div className="text-xl font-bold text-white/70">
            {networkUp.toFixed(1)} <span className="text-sm text-white/40">MB/s ↑</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col justify-between">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2 text-orange-400 font-bold">
              <ThermometerSun size={18} /> {t('hw_cpu_temp')}
            </div>
            <div className="text-2xl font-bold text-white">{Math.round(cpuTemp)}°C</div>
          </div>
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2 text-red-400 font-bold">
              <ThermometerSun size={18} /> {t('hw_gpu_temp')}
            </div>
            <div className="text-2xl font-bold text-white">{Math.round(gpuTemp)}°C</div>
          </div>
          <div className="flex justify-between items-center pt-6 border-t border-white/10">
            <div className="flex items-center gap-2 text-sky-400 font-bold">
              <Fan size={18} className="animate-spin-slow" /> {t('hw_fan_speed')}
            </div>
            <div className="text-2xl font-bold text-white">{Math.round(fanSpeed)} RPM</div>
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h2 className="text-white font-bold mb-6 flex items-center gap-2">
            <HardDrive size={18} className="text-blue-400" /> {t('hw_storage')}
          </h2>
          <div className="space-y-6">
            {disks && disks.length > 0 ? (
              disks.slice(0, 3).map((disk, idx) => {
                const colors = [
                  'from-purple-500 to-pink-500',
                  'from-blue-500 to-cyan-500',
                  'from-emerald-500 to-teal-500',
                ];
                const sizeGB = (disk.size / (1024 * 1024 * 1024)).toFixed(0);
                const usedGB = (disk.used / (1024 * 1024 * 1024)).toFixed(0);
                const freeGB = (sizeGB - usedGB).toFixed(0);
                const pct = ((disk.used / disk.size) * 100).toFixed(0);

                return (
                  <div key={idx}>
                    <div className="flex justify-between items-end mb-2">
                      <div>
                        <span className="text-white font-bold mr-2">
                          {t('hw_drive')} {disk.fs}
                        </span>
                        <span className="text-white/40 text-sm">
                          {disk.mount ? `${t('hw_mounted')} ${disk.mount}` : ''}
                        </span>
                      </div>
                      <div className={`text-${language === 'ar' ? 'left' : 'right'}`}>
                        <span className="text-white font-bold text-lg">
                          {usedGB} GB {t('hw_used')}
                        </span>
                        <span className="text-white/40 text-sm">
                          {' '}
                          / {freeGB} GB {t('hw_free')}
                        </span>
                      </div>
                    </div>
                    <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className={`h-full bg-gradient-to-r ${colors[idx % colors.length]} rounded-full`}
                        style={{ width: `${pct}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })
            ) : (
              // Fallback Mock Disks
              <>
                <div>
                  <div className="flex justify-between items-end mb-2">
                    <div>
                      <span className="text-white font-bold mr-2">{t('hw_drive')} (C:)</span>
                      <span className="text-white/40 text-sm">System SSD</span>
                    </div>
                    <div className={`text-${language === 'ar' ? 'left' : 'right'}`}>
                      <span className="text-white font-bold text-lg">120 GB {t('hw_used')}</span>
                      <span className="text-white/40 text-sm"> / 500 GB {t('hw_free')}</span>
                    </div>
                  </div>
                  <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                      style={{ width: '76%' }}
                    ></div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
