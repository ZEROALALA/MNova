import React from 'react';
import { LogOut, Monitor, Gamepad2, CheckCircle2 } from 'lucide-react';

export default function SettingsAccounts({
  t,
  language,
  linkedAccounts,
  handleLinkAccount,
  unlinkAccount,
  userProfile,
  isVerifying,
  linkingPlatform,
  linkingId,
  setLinkingId,
  confirmLinkAccount
}) {
  return (
    <div className="animate-fade-in space-y-6">
      <h2 className="text-2xl font-bold text-white mb-6">{t('settings_linked_accounts')}</h2>

      {/* Main Google Account */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-lg p-2">
            <svg viewBox="0 0 24 24" className="w-full h-full">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
          </div>
          <div>
            <h3 className="font-bold text-white text-lg">Google Account</h3>
            <p className="text-white/50 text-sm flex items-center gap-2">
              <CheckCircle2 size={14} className="text-emerald-400" />
              {userProfile?.email || 'Connected'}
            </p>
          </div>
        </div>
        <button
          onClick={() => {
            localStorage.removeItem('mnova_user');
            window.location.reload();
          }}
          className="px-6 py-3 bg-red-500/10 text-red-500 font-bold rounded-xl hover:bg-red-500 hover:text-white transition-all flex items-center gap-2"
        >
          <LogOut size={18} /> Sign Out
        </button>
      </div>

      <div className="h-px w-full bg-white/10 my-4"></div>

      <p className="text-white/40 text-sm mb-4">
        Link other platforms to your Google Account:
      </p>

      {/* Dynamic Link Input Modal Simulation */}
      {linkingPlatform && (
        <div className="mb-6 bg-blue-500/10 border border-blue-500/30 p-6 rounded-2xl animate-fade-in flex flex-col items-center">
          <h3 className="text-white font-bold text-lg mb-2">
            {language === 'ar' ? `ربط حساب ${linkingPlatform}` : `Link ${linkingPlatform} Account`}
          </h3>
          <p className="text-white/60 text-sm mb-4 text-center">
            {language === 'ar' 
              ? `أدخل المعرّف الخاص بك لربط ألعاب ${linkingPlatform} بـ MNova.`
              : `Enter your ID to sync your ${linkingPlatform} games to MNova.`}
          </p>
          <div className="flex w-full max-w-md gap-2">
            <input 
              type="text" 
              value={linkingId}
              onChange={(e) => setLinkingId(e.target.value)}
              placeholder={language === 'ar' ? "أدخل المعرف أو اسم المستخدم..." : "Enter ID or Username..."}
              className="flex-1 bg-black/40 border border-white/10 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-blue-500"
            />
            <button 
              onClick={confirmLinkAccount}
              disabled={isVerifying}
              className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 py-3 rounded-xl transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {isVerifying ? (language === 'ar' ? 'جاري...' : 'Verifying...') : (language === 'ar' ? 'تأكيد' : 'Confirm')}
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col items-center text-center gap-4 hover:bg-white/10 transition-colors">
          <div className="w-16 h-16 bg-[#171a21] rounded-2xl flex items-center justify-center p-3">
            <svg viewBox="0 0 24 24" className="w-full h-full" fill="white">
              <path d="M11.979 0C5.366 0 0 5.366 0 11.979c0 4.542 2.535 8.498 6.292 10.596l1.78-5.176c-.05-.285-.078-.577-.078-.876 0-2.482 2.012-4.494 4.494-4.494.394 0 .774.053 1.137.149l3.528-5.105c-.097-.478-.149-.968-.149-1.472 0-3.693 2.994-6.687 6.687-6.687C23.687 2.914 24 6.257 24 9.95c0 3.693-2.994 6.687-6.687 6.687-1.163 0-2.253-.298-3.195-.818l-3.35 4.847c-.012.017-.024.032-.036.049.499.162 1.025.253 1.57.253 3.693 0 6.687-2.994 6.687-6.687 0-3.693-2.994-6.687-6.687-6.687zM9.366 12.355l-3.79 1.103a3.176 3.176 0 0 0 1.259 4.39 3.175 3.175 0 0 0 4.39-1.259 3.173 3.173 0 0 0-1.127-4.303l-.732.213z" />
            </svg>
          </div>
          <div>
            <h3 className="font-bold text-white text-lg">Steam</h3>
            <p className="text-white/50 text-sm">Sync your PC game library</p>
          </div>
          <button 
            onClick={() => linkedAccounts.steam ? unlinkAccount('Steam') : handleLinkAccount('Steam')}
            className={`mt-4 px-6 py-2 font-bold rounded-xl transition-colors w-full ${linkedAccounts.steam ? 'bg-emerald-500/20 text-emerald-400 hover:bg-red-500/20 hover:text-red-400' : 'bg-blue-500 hover:bg-blue-600 text-white'}`}
          >
            {linkedAccounts.steam ? (language === 'ar' ? 'متصل (اضغط لفك الربط)' : 'Connected (Click to unlink)') : (language === 'ar' ? 'ربط' : 'Connect')}
          </button>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col items-center text-center gap-4 hover:bg-white/10 transition-colors">
          <div className="w-16 h-16 bg-[#2a2a2a] rounded-2xl flex items-center justify-center p-3">
            <svg viewBox="0 0 24 24" className="w-full h-full" fill="white">
              <path d="M12.001 0l7.35 4.244v8.487l-7.35 4.244-7.35-4.244V4.244L12.001 0zm0 1.503L6.154 4.88v6.756l5.847 3.376 5.847-3.376V4.88l-5.847-3.377z" />
            </svg>
          </div>
          <div>
            <h3 className="font-bold text-white text-lg">Epic Games</h3>
            <p className="text-white/50 text-sm">Sync your Epic library</p>
          </div>
          <button 
            onClick={() => linkedAccounts.epic ? unlinkAccount('Epic Games') : handleLinkAccount('Epic Games')}
            className={`mt-4 px-6 py-2 font-bold rounded-xl transition-colors w-full ${linkedAccounts.epic ? 'bg-emerald-500/20 text-emerald-400 hover:bg-red-500/20 hover:text-red-400' : 'bg-white/10 hover:bg-white/20 text-white'}`}
          >
            {linkedAccounts.epic ? (language === 'ar' ? 'متصل (اضغط لفك الربط)' : 'Connected (Click to unlink)') : (language === 'ar' ? 'ربط' : 'Connect')}
          </button>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col items-center text-center gap-4 hover:bg-white/10 transition-colors">
          <div className="w-16 h-16 bg-green-600 rounded-2xl flex items-center justify-center p-3">
            <Monitor size={32} className="text-white" />
          </div>
          <div>
            <h3 className="font-bold text-white text-lg">Xbox Network</h3>
            <p className="text-white/50 text-sm">Sync your Xbox Live profile</p>
          </div>
          <button 
            onClick={() => linkedAccounts.xbox ? unlinkAccount('Xbox') : handleLinkAccount('Xbox')}
            className={`mt-4 px-6 py-2 font-bold rounded-xl transition-colors w-full ${linkedAccounts.xbox ? 'bg-emerald-500/20 text-emerald-400 hover:bg-red-500/20 hover:text-red-400' : 'bg-green-500 hover:bg-green-600 text-white'}`}
          >
            {linkedAccounts.xbox ? (language === 'ar' ? 'متصل (اضغط لفك الربط)' : 'Connected (Click to unlink)') : (language === 'ar' ? 'ربط' : 'Connect')}
          </button>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col items-center text-center gap-4 hover:bg-white/10 transition-colors">
          <div className="w-16 h-16 bg-orange-600 rounded-2xl flex items-center justify-center p-3">
            <Gamepad2 size={32} className="text-white" />
          </div>
          <div>
            <h3 className="font-bold text-white text-lg">EA Games</h3>
            <p className="text-white/50 text-sm">Sync your EA App library</p>
          </div>
          <button 
            onClick={() => linkedAccounts.ea ? unlinkAccount('EA') : handleLinkAccount('EA')}
            className={`mt-4 px-6 py-2 font-bold rounded-xl transition-colors w-full ${linkedAccounts.ea ? 'bg-emerald-500/20 text-emerald-400 hover:bg-red-500/20 hover:text-red-400' : 'bg-orange-500 hover:bg-orange-600 text-white'}`}
          >
            {linkedAccounts.ea ? (language === 'ar' ? 'متصل (اضغط لفك الربط)' : 'Connected (Click to unlink)') : (language === 'ar' ? 'ربط' : 'Connect')}
          </button>
        </div>
      </div>
    </div>
  );
}
