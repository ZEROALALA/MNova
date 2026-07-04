import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../LanguageContext';
import { X, Gamepad2, ArrowRight, Loader2, AlertCircle } from 'lucide-react';

export default function LoginModal({ isOpen, onClose }) {
  const { t } = useLanguage();
  const { currentUser, gamerProfile, signInWithGoogle, registerGamerId } = useAuth();

  const [step, setStep] = useState(1); // 1: Google Login, 2: Choose GamerID
  const [gamerIdInput, setGamerIdInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      if (!currentUser) {
        setStep(1);
      } else if (currentUser && !gamerProfile) {
        setStep(2);
      } else {
        // Logged in and has a profile, shouldn't really be here but close just in case
        onClose();
      }
      setError('');
      setGamerIdInput('');
    }
  }, [isOpen, currentUser, gamerProfile, onClose]);

  if (!isOpen) return null;

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      await signInWithGoogle();
      // AuthContext will automatically fetch profile and currentUser will update.
      // The useEffect above will push them to step 2 if no profile exists.
    } catch (err) {
      setError(err.message || 'Failed to sign in with Google');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterGamerId = async (e) => {
    e.preventDefault();
    if (!gamerIdInput.trim()) return;
    if (gamerIdInput.length < 3) {
      setError('Gamer ID must be at least 3 characters long');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await registerGamerId(gamerIdInput.trim());
      onClose(); // Successfully registered!
    } catch (err) {
      setError(err.message || 'Failed to register Gamer ID');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md transition-all">
      <div className="relative w-full max-w-md bg-[#121212] border border-white/10 rounded-2xl p-8 shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20">
          <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-[radial-gradient(ellipse_at_center,rgba(59,130,246,0.3)_0%,transparent_50%)] animate-pulse" />
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors"
        >
          <X size={24} />
        </button>

        {/* Content Container */}
        <div className="relative z-10 flex flex-col items-center">
          <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(255,255,255,0.05)] border border-white/10">
            {currentUser?.photoURL ? (
              <img
                src={currentUser.photoURL}
                alt="Avatar"
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <Gamepad2 size={32} className="text-white/70" />
            )}
          </div>

          <h2 className="text-2xl font-bold text-white mb-2">
            {step === 1 ? 'Unlock M NOVA' : 'Choose Your Identity'}
          </h2>
          <p className="text-white/50 text-sm text-center mb-8 px-4">
            {step === 1
              ? 'Sign in to access Community features, sync your achievements, and use the Maryam AI Assistant.'
              : 'Reserve your unique Gamer ID. This will be visible to other players in the M NOVA network.'}
          </p>

          {error && (
            <div className="w-full mb-6 p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-3 text-red-400 text-sm">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {step === 1 && (
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 bg-white/10 hover:bg-white/20 border border-white/10 text-white font-semibold py-4 px-6 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              {loading ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <>
                  <svg
                    viewBox="0 0 24 24"
                    width="24"
                    height="24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
                      <path
                        fill="#4285F4"
                        d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z"
                      />
                      <path
                        fill="#34A853"
                        d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z"
                      />
                      <path
                        fill="#EA4335"
                        d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z"
                      />
                    </g>
                  </svg>
                  <span>Continue with Google</span>
                  <ArrowRight
                    size={18}
                    className="opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all"
                  />
                </>
              )}
            </button>
          )}

          {step === 2 && (
            <form onSubmit={handleRegisterGamerId} className="w-full">
              <div className="mb-6">
                <label className="block text-white/50 text-xs font-bold mb-2 uppercase tracking-wider">
                  Gamer ID
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-white/30 font-mono">
                    @
                  </span>
                  <input
                    type="text"
                    value={gamerIdInput}
                    onChange={(e) => setGamerIdInput(e.target.value.replace(/[^a-zA-Z0-9_-]/g, ''))}
                    placeholder="AbyssWalker"
                    className="w-full bg-black/50 border border-white/10 rounded-xl py-4 pl-10 pr-4 text-white font-mono text-lg focus:outline-none focus:border-blue-500 focus:shadow-[0_0_15px_rgba(59,130,246,0.3)] transition-all placeholder:text-white/20"
                    maxLength={20}
                    autoFocus
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading || !gamerIdInput.trim()}
                className="w-full flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 px-6 rounded-xl shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_30px_rgba(59,130,246,0.5)] transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                {loading ? <Loader2 size={20} className="animate-spin" /> : 'Claim Identity'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
