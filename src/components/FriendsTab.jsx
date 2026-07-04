import React, { useState, useEffect, useRef } from 'react';
import {
  UserPlus,
  MessageCircle,
  Gamepad2,
  Trophy,
  Clock,
  X,
  Send,
  User,
  Check,
  Search,
  Loader2,
  MessageSquare,
  Phone,
  Video,
  Search as SearchIcon,
} from 'lucide-react';
import { useLanguage } from '../LanguageContext';
import AchievementsModal from './AchievementsModal';

const MOCK_USERS = [
  {
    id: 1,
    tag: '#4921',
    name: 'Sarah_99',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah_99&backgroundColor=c0aede',
    status: 'online',
    activity: 'Playing Cyberpunk 2077',
    isFriend: true,
    games: [
      {
        title: 'Cyberpunk 2077',
        hours: 142,
        appId: '1091500',
        backgroundUrl:
          'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1091500/library_hero.jpg',
      },
      {
        title: 'The Witcher 3',
        hours: 300,
        appId: '292030',
        backgroundUrl:
          'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/292030/library_hero.jpg',
      },
    ],
    achievements: [
      { name: 'City of Dreams', game: 'Cyberpunk 2077', date: 'Today' },
      { name: 'Master Witcher', game: 'The Witcher 3', date: '2 days ago' },
    ],
  },
  {
    id: 2,
    tag: '#8832',
    name: 'AlexHunter',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=AlexHunter&backgroundColor=b6e3f4',
    status: 'offline',
    activity: 'Last seen 2 hours ago',
    isFriend: false,
    games: [
      {
        title: 'ELDEN RING',
        hours: 450,
        appId: '1245620',
        backgroundUrl:
          'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1245620/library_hero.jpg',
      },
      {
        title: 'Dark Souls III',
        hours: 210,
        appId: '374320',
        backgroundUrl:
          'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/374320/library_hero.jpg',
      },
    ],
    achievements: [
      { name: 'Elden Lord', game: 'ELDEN RING', date: '1 week ago' },
      { name: 'Link the Fire', game: 'Dark Souls III', date: '1 month ago' },
    ],
  },
  {
    id: 3,
    tag: '#1055',
    name: 'David_Plays',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David_Plays&backgroundColor=ffdfbf',
    status: 'online',
    activity: 'Playing Grand Theft Auto V',
    isFriend: false,
    games: [
      {
        title: 'Grand Theft Auto V',
        hours: 1200,
        appId: '271590',
        backgroundUrl:
          'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/271590/library_hero.jpg',
      },
      {
        title: 'Red Dead Redemption 2',
        hours: 340,
        appId: '1174180',
        backgroundUrl:
          'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1174180/library_hero.jpg',
      },
    ],
    achievements: [
      { name: 'Los Santos Legend', game: 'Grand Theft Auto V', date: 'Yesterday' },
      { name: 'Lending a Hand', game: 'Red Dead Redemption 2', date: '5 days ago' },
    ],
  },
  {
    id: 4,
    tag: '#9999',
    name: 'ProGamer_X',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ProGamer_X&backgroundColor=ff4d4d',
    status: 'online',
    activity: 'Playing Black Myth: Wukong',
    isFriend: true,
    games: [
      {
        title: 'Black Myth: Wukong',
        hours: 80,
        appId: '2358720',
        backgroundUrl:
          'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2358720/library_hero.jpg',
      },
      {
        title: 'Sekiro: Shadows Die Twice',
        hours: 150,
        appId: '814380',
        backgroundUrl:
          'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/814380/library_hero.jpg',
      },
    ],
    achievements: [
      { name: 'Monkey King', game: 'Black Myth: Wukong', date: 'Just now' },
      { name: 'Sekiro', game: 'Sekiro: Shadows Die Twice', date: '1 year ago' },
    ],
  },
];

const CURRENT_USER = {
  name: 'PlayerOne',
  tag: '#0001',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=PlayerOne&backgroundColor=1f2937',
};

export default function FriendsTab({ playNav, playConfirm }) {
  const { t, language } = useLanguage();
  const [users, setUsers] = useState(MOCK_USERS);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showChat, setShowChat] = useState(false);
  const [messages, setMessages] = useState({});
  const [chatInput, setChatInput] = useState('');
  const [myStatus, setMyStatus] = useState('online');
  const [viewingAchievements, setViewingAchievements] = useState(null);
  const [viewingGame, setViewingGame] = useState(null);
  const [loadingAchievements, setLoadingAchievements] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, showChat]);

  const handleAddFriend = (userId) => {
    playConfirm?.();
    setUsers(users.map((u) => (u.id === userId ? { ...u, isFriend: 'pending' } : u)));

    if (selectedUser?.id === userId) {
      setSelectedUser({ ...selectedUser, isFriend: 'pending' });
    }

    setTimeout(() => {
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, isFriend: true } : u)));
      setSelectedUser((prev) => (prev?.id === userId ? { ...prev, isFriend: true } : prev));
      playConfirm?.();
    }, 2000);
  };

  const handleRemoveFriend = (userId) => {
    playNav?.();
    setUsers(users.map((u) => (u.id === userId ? { ...u, isFriend: false } : u)));
    if (selectedUser?.id === userId) {
      setSelectedUser({ ...selectedUser, isFriend: false });
    }
  };

  const handleViewAchievements = async (game) => {
    playConfirm?.();
    setLoadingAchievements(game.appId);

    setTimeout(() => {
      setViewingGame(game);
      setViewingAchievements({
        achieved: 34,
        percentage: 85,
        total: 40,
        achievements: [
          {
            name: 'First Blood',
            description: 'Complete the prologue',
            icon: 'https://cdn.iconscout.com/icon/premium/png-256-thumb/trophy-271-778842.png',
            achieved: true,
            unlockTime: Date.now() / 1000 - 86400 * 10,
          },
          {
            name: 'Master',
            description: 'Reach max level',
            icon: 'https://cdn.iconscout.com/icon/premium/png-256-thumb/trophy-271-778842.png',
            achieved: true,
            unlockTime: Date.now() / 1000 - 86400 * 5,
          },
          {
            name: 'Speedrunner',
            description: 'Finish under 2 hours',
            icon: 'https://cdn.iconscout.com/icon/premium/png-256-thumb/trophy-271-778842.png',
            achieved: true,
            unlockTime: Date.now() / 1000 - 86400 * 2,
          },
          {
            name: 'Perfectionist',
            description: 'Collect all items',
            icon: 'https://cdn.iconscout.com/icon/premium/png-256-thumb/trophy-271-778842.png',
            achieved: true,
            unlockTime: Date.now() / 1000 - 86400,
          },
          {
            name: 'Legend',
            description: 'Beat on highest difficulty',
            icon: 'https://cdn.iconscout.com/icon/premium/png-256-thumb/trophy-271-778842.png',
            achieved: false,
          },
        ],
      });
      setLoadingAchievements(null);
    }, 600);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!chatInput.trim() || !selectedUser) return;

    const userId = selectedUser.id;
    const newMsg = {
      text: chatInput,
      sender: 'me',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => ({
      ...prev,
      [userId]: [...(prev[userId] || []), newMsg],
    }));

    setChatInput('');
    playNav?.();

    const lowerInput = chatInput.toLowerCase();
    let replyText = "I'm currently playing! Catch you later.";

    if (
      lowerInput.includes('hi') ||
      lowerInput.includes('hello') ||
      lowerInput.includes('hey') ||
      lowerInput.includes('هلا')
    ) {
      replyText = `Hey! How are you doing?`;
    } else if (
      lowerInput.includes('play') ||
      lowerInput.includes('game') ||
      lowerInput.includes('تلعب')
    ) {
      replyText = `Sure! I'm down to play in about 10 minutes.`;
    } else if (lowerInput.includes('how') || lowerInput.includes('كيف')) {
      replyText = `I'm doing great, just grinding some achievements!`;
    } else if (
      lowerInput.includes('cool') ||
      lowerInput.includes('nice') ||
      lowerInput.includes('حلو')
    ) {
      replyText = `Haha yeah!`;
    }

    setTimeout(() => {
      setMessages((prev) => ({
        ...prev,
        [userId]: [
          ...(prev[userId] || []),
          {
            text: replyText,
            sender: 'them',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ],
      }));
      playConfirm?.();
    }, 1500);
  };

  return (
    <div
      className={`pt-24 px-10 pb-10 w-full h-full overflow-y-auto custom-scrollbar relative z-10 bg-gradient-to-b from-[#050b14] to-[#000000]`}
      dir={language === 'ar' ? 'rtl' : 'ltr'}
    >
      <div className="flex items-center gap-4 mb-10">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-fuchsia-500 to-purple-600 flex items-center justify-center shadow-[0_0_20px_rgba(217,70,239,0.4)]">
          <User className="text-white" size={24} />
        </div>
        <div>
          <h1 className="text-4xl font-bold text-white tracking-tight">{t('community_title')}</h1>
          <p className="text-white/50 text-sm mt-1">{t('community_desc')}</p>
        </div>
      </div>

      <div className="flex gap-8 h-[calc(100%-100px)]">
        <div className="w-1/3 flex flex-col gap-4">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <img
                  src={CURRENT_USER.avatar}
                  alt="Me"
                  className="w-12 h-12 rounded-full border-2 border-white/10"
                />
                <div
                  className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-[#0a0a0a] ${myStatus === 'online' ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.6)]' : myStatus === 'away' ? 'bg-yellow-500' : 'bg-white/30'}`}
                ></div>
              </div>
              <div>
                <h3 className="text-white font-bold flex items-center gap-1">
                  {CURRENT_USER.name}
                  <span className="text-xs text-white/40 font-normal">{CURRENT_USER.tag}</span>
                </h3>
                <select
                  className="bg-transparent text-xs text-white/50 focus:outline-none cursor-pointer mt-0.5 hover:text-white"
                  value={myStatus}
                  onChange={(e) => {
                    playNav?.();
                    setMyStatus(e.target.value);
                  }}
                >
                  <option value="online" className="bg-[#121212]">
                    {t('status_online')}
                  </option>
                  <option value="away" className="bg-[#121212]">
                    {t('status_away')}
                  </option>
                  <option value="offline" className="bg-[#121212]">
                    {t('status_offline')}
                  </option>
                </select>
              </div>
            </div>
          </div>

          <div className="relative">
            <Search
              className={`absolute ${language === 'ar' ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-white/40`}
              size={18}
            />
            <input
              type="text"
              placeholder={t('search_friends')}
              className={`w-full h-12 bg-white/5 border border-white/10 rounded-xl ${language === 'ar' ? 'pr-12 pl-4' : 'pl-12 pr-4'} text-white placeholder-white/30 focus:outline-none focus:border-cyan-500/50 focus:bg-white/10 transition-all`}
            />
          </div>

          <div className="flex-1 bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col gap-2 overflow-y-auto custom-scrollbar">
            <h3 className="text-xs font-bold text-white/40 uppercase tracking-wider mb-2 px-2">
              {t('all_users')}
            </h3>
            {users.map((user) => (
              <div
                key={user.id}
                onClick={() => {
                  playNav?.();
                  setSelectedUser(user);
                  setShowChat(false);
                }}
                className={`flex items-center gap-4 p-3 rounded-xl cursor-pointer transition-all ${selectedUser?.id === user.id ? 'bg-white/15 border border-white/20' : 'hover:bg-white/10 border border-transparent'}`}
              >
                <div className="relative">
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-12 h-12 rounded-full bg-white/10"
                  />
                  <div
                    className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-[#0a0a0a] ${user.status === 'online' ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.6)]' : 'bg-white/30'}`}
                  ></div>
                </div>
                <div className="flex-1 overflow-hidden">
                  <div className="flex justify-between items-center">
                    <h4 className="text-white font-medium truncate flex items-center gap-1">
                      {user.name}
                      <span className="text-[10px] text-white/30">{user.tag}</span>
                    </h4>
                    {user.isFriend === true && (
                      <div className="text-[10px] bg-cyan-500/20 text-cyan-400 px-2 py-0.5 rounded-full">
                        {t('friend_label')}
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-white/50 truncate mt-0.5">{user.activity}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex-1 bg-white/5 border border-white/10 rounded-2xl overflow-hidden relative flex flex-col">
          {!selectedUser ? (
            <div className="flex-1 flex flex-col items-center justify-center text-white/30">
              <User size={64} className="mb-4 opacity-50" />
              <p>{t('select_user_prompt')}</p>
            </div>
          ) : showChat ? (
            <>
              <div className="h-16 border-b border-white/10 flex items-center justify-between px-6 bg-white/5">
                <div className="flex items-center gap-3">
                  <img
                    src={selectedUser.avatar}
                    alt={selectedUser.name}
                    className="w-10 h-10 rounded-full bg-white/10"
                  />
                  <div>
                    <h3 className="text-white font-medium">{selectedUser.name}</h3>
                    <p className="text-xs text-green-400">
                      {selectedUser.status === 'online' ? t('status_online') : t('status_offline')}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowChat(false)}
                  className="text-white/50 hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 p-6 overflow-y-auto custom-scrollbar flex flex-col gap-4">
                {(messages[selectedUser.id] || []).length === 0 ? (
                  <div className="text-center text-white/30 text-sm mt-10">
                    Say hi to {selectedUser.name}!
                  </div>
                ) : (
                  (messages[selectedUser.id] || []).map((msg, i) => (
                    <div
                      key={i}
                      className={`flex flex-col ${msg.sender === 'me' ? 'items-end' : 'items-start'}`}
                    >
                      <div
                        className={`px-4 py-2 rounded-2xl max-w-[70%] ${msg.sender === 'me' ? 'bg-cyan-600 text-white rounded-br-sm' : 'bg-white/10 text-white rounded-bl-sm'}`}
                      >
                        {msg.text}
                      </div>
                      <span className="text-[10px] text-white/30 mt-1">{msg.time}</span>
                    </div>
                  ))
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Chat Input */}
              <form
                onSubmit={handleSendMessage}
                className="p-4 border-t border-white/10 bg-black/20 flex gap-2"
              >
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 bg-white/10 border border-white/10 rounded-xl px-4 text-sm text-white placeholder-white/40 focus:outline-none focus:border-cyan-500/50"
                />
                <button
                  type="submit"
                  disabled={!chatInput.trim()}
                  className="w-12 h-12 bg-cyan-600 hover:bg-cyan-500 disabled:bg-white/10 disabled:text-white/30 text-white rounded-xl flex items-center justify-center transition-colors"
                >
                  <Send size={18} />
                </button>
              </form>
            </>
          ) : (
            // Profile UI
            <div className="h-full overflow-y-auto custom-scrollbar">
              {/* Profile Header */}
              <div className="h-40 bg-gradient-to-r from-cyan-900/40 to-purple-900/40 relative">
                <div className="absolute -bottom-12 left-8 flex items-end gap-6">
                  <div className="relative">
                    <img
                      src={selectedUser.avatar}
                      alt={selectedUser.name}
                      className="w-28 h-28 rounded-2xl bg-[#1a1a1a] border-4 border-[#0a0a0a] shadow-xl"
                    />
                    <div
                      className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-4 border-[#0a0a0a] ${selectedUser.status === 'online' ? 'bg-green-500' : 'bg-gray-500'}`}
                    ></div>
                  </div>
                  <div className="mb-2">
                    <h2 className="text-3xl font-bold text-white shadow-black drop-shadow-md flex items-end gap-2">
                      {selectedUser.name}
                      <span className="text-lg text-white/50 font-normal">{selectedUser.tag}</span>
                    </h2>
                    <p className="text-white/90 drop-shadow-md font-medium">
                      {selectedUser.activity}
                    </p>
                  </div>
                </div>

                <div className="absolute bottom-4 right-6 flex gap-3">
                  {selectedUser.isFriend === true ? (
                    <>
                      <button
                        onClick={() => handleRemoveFriend(selectedUser.id)}
                        className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-xl font-medium transition-all"
                        title="Remove Friend"
                      >
                        <X size={18} />
                      </button>
                      <button
                        onClick={() => {
                          playConfirm?.();
                          setShowChat(true);
                        }}
                        className="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-medium flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(8,145,178,0.4)]"
                      >
                        <MessageCircle size={18} />
                        Send Message
                      </button>
                    </>
                  ) : selectedUser.isFriend === 'pending' ? (
                    <button
                      disabled
                      className="px-5 py-2 bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 rounded-xl font-medium flex items-center gap-2"
                    >
                      <Clock size={18} />
                      Request Sent...
                    </button>
                  ) : (
                    <button
                      onClick={() => handleAddFriend(selectedUser.id)}
                      className="px-5 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl font-medium flex items-center gap-2 transition-all"
                    >
                      <UserPlus size={18} />
                      Add Friend
                    </button>
                  )}
                </div>
              </div>

              {/* Profile Content */}
              <div className="mt-20 px-8 pb-8 flex gap-8">
                {/* Games */}
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <Gamepad2 size={20} className="text-cyan-400" />
                    Recently Played
                  </h3>
                  <div className="flex flex-col gap-3">
                    {selectedUser.games.map((game, i) => (
                      <div
                        key={i}
                        onClick={() => handleViewAchievements(game)}
                        className="bg-white/5 border border-white/10 rounded-xl p-4 flex justify-between items-center hover:bg-white/10 transition-colors cursor-pointer group"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-white font-medium group-hover:text-cyan-400 transition-colors">
                            {game.title}
                          </span>
                          {loadingAchievements === game.appId && (
                            <Loader2 size={14} className="animate-spin text-cyan-400" />
                          )}
                        </div>
                        <span className="text-white/40 text-sm">{game.hours} hrs on record</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Achievements */}
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <Trophy size={20} className="text-yellow-400" />
                    Recent Achievements
                  </h3>
                  <div className="flex flex-col gap-3">
                    {selectedUser.achievements.map((ach, i) => (
                      <div
                        key={i}
                        className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-start gap-4 hover:bg-white/10 transition-colors cursor-default"
                      >
                        <div className="w-10 h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center shrink-0">
                          <Trophy size={18} className="text-yellow-500" />
                        </div>
                        <div>
                          <h4 className="text-white text-sm font-bold">{ach.name}</h4>
                          <p className="text-white/50 text-xs mt-0.5">{ach.game}</p>
                          <p className="text-white/30 text-[10px] mt-1">Unlocked {ach.date}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Achievements Modal for Friend's Game */}
      <AchievementsModal
        isOpen={!!viewingAchievements}
        onClose={() => setViewingAchievements(null)}
        game={viewingGame}
        data={viewingAchievements}
      />
    </div>
  );
}
