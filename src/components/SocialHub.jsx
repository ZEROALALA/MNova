import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { PlayFabClient, playFabPromisify } from '../services/playfab';
import { db } from '../services/firebase';
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { Users, UserPlus, MessageSquare, Search, Send, Loader2 } from 'lucide-react';

export default function SocialHub() {
  const { gamerProfile, currentUser } = useAuth();
  const [friends, setFriends] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeChat, setActiveChat] = useState(null); // The friend object
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loadingFriends, setLoadingFriends] = useState(true);
  const [addStatus, setAddStatus] = useState('');
  const [lastMessageTime, setLastMessageTime] = useState(0);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (gamerProfile) {
      loadFriends();
    }
  }, [gamerProfile]);

  const loadFriends = async () => {
    setLoadingFriends(true);
    try {
      const result = await playFabPromisify(PlayFabClient.GetFriendsList, {
        IncludeSteamFriends: false,
        IncludeFacebookFriends: false,
      });
      setFriends(result.Friends || []);
    } catch (err) {
      console.error('Failed to load friends', err);
    }
    setLoadingFriends(false);
  };

  const handleAddFriend = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim() || searchQuery.toLowerCase() === gamerProfile.gamerId.toLowerCase())
      return;

    setAddStatus('adding...');
    try {
      await playFabPromisify(PlayFabClient.AddFriend, {
        FriendTitleDisplayName: searchQuery.trim(),
      });
      setAddStatus('Friend added!');
      setSearchQuery('');
      loadFriends(); // Refresh list
    } catch (err) {
      console.error('Add friend error:', err);
      setAddStatus('Player not found or already added');
    }

    setTimeout(() => setAddStatus(''), 3000);
  };

  // Chat Subscription
  useEffect(() => {
    if (!activeChat || !gamerProfile) return;

    // Chat room ID is a sorted combination of both Gamer IDs to ensure it's identical for both
    const roomIds = [
      gamerProfile.gamerId.toLowerCase(),
      activeChat.TitleDisplayName.toLowerCase(),
    ].sort();
    const roomId = `${roomIds[0]}_${roomIds[1]}`;

    const q = query(
      collection(db, 'messages'),
      where('roomId', '==', roomId),
      orderBy('createdAt', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = [];
      snapshot.forEach((doc) => msgs.push({ id: doc.id, ...doc.data() }));
      setMessages(msgs);
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    });

    return () => unsubscribe();
  }, [activeChat, gamerProfile]);

  const sendMessage = async (e) => {
    e.preventDefault();
    const text = newMessage.trim();
    if (!text || !activeChat) return;

    if (text.length > 1000) {
      alert('Message is too long (maximum 1000 characters).');
      return;
    }

    const now = Date.now();
    if (now - lastMessageTime < 1000) {
      // Anti-spam cooldown
      return;
    }
    setLastMessageTime(now);

    const roomIds = [
      gamerProfile.gamerId.toLowerCase(),
      activeChat.TitleDisplayName.toLowerCase(),
    ].sort();
    const roomId = `${roomIds[0]}_${roomIds[1]}`;

    const msgData = {
      roomId,
      text,
      senderId: gamerProfile.gamerId,
      createdAt: serverTimestamp(),
    };

    setNewMessage('');
    try {
      await addDoc(collection(db, 'messages'), msgData);
    } catch (err) {
      console.error('Failed to send message', err);
    }
  };

  if (!gamerProfile) {
    return (
      <div className="flex h-full items-center justify-center text-white/50">
        Please sign in to access the Social Hub.
      </div>
    );
  }

  return (
    <div className="flex h-full w-full bg-black/40 backdrop-blur-md overflow-hidden rounded-xl border border-white/10">
      {/* Friends Sidebar */}
      <div className="w-1/3 min-w-[250px] border-r border-white/10 flex flex-col bg-black/20">
        <div className="p-4 border-b border-white/10">
          <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-4">
            <Users size={20} className="text-blue-400" />
            Social
          </h2>

          <form onSubmit={handleAddFriend} className="relative">
            <input
              type="text"
              placeholder="Add by Gamer ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg py-2 pl-3 pr-10 text-white placeholder-white/40 focus:outline-none focus:border-blue-500 transition-colors"
            />
            <button
              type="submit"
              className="absolute right-2 top-2 text-white/50 hover:text-white transition-colors"
            >
              <UserPlus size={18} />
            </button>
            {addStatus && <p className="text-xs text-blue-400 mt-2">{addStatus}</p>}
          </form>
        </div>

        <div className="flex-1 overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
          {loadingFriends ? (
            <div className="flex justify-center p-8">
              <Loader2 className="animate-spin text-white/50" />
            </div>
          ) : friends.length === 0 ? (
            <p className="text-center text-white/40 text-sm p-4">No friends added yet.</p>
          ) : (
            friends.map((friend) => (
              <button
                key={friend.FriendPlayFabId}
                onClick={() => setActiveChat(friend)}
                className={`w-full text-left p-3 rounded-lg mb-1 flex items-center gap-3 transition-colors ${
                  activeChat?.FriendPlayFabId === friend.FriendPlayFabId
                    ? 'bg-blue-500/20 border border-blue-500/50'
                    : 'hover:bg-white/5 border border-transparent'
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold uppercase shadow-lg">
                  {friend.TitleDisplayName?.charAt(0) || '?'}
                </div>
                <div>
                  <div className="text-white font-medium">
                    {friend.TitleDisplayName || 'Unknown'}
                  </div>
                  <div className="text-xs text-white/50">PlayFab User</div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-black/10 relative">
        {activeChat ? (
          <>
            {/* Chat Header */}
            <div className="h-16 border-b border-white/10 flex items-center px-6 bg-black/20 shrink-0">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold uppercase mr-3">
                {activeChat.TitleDisplayName?.charAt(0) || '?'}
              </div>
              <div>
                <h3 className="text-white font-bold">{activeChat.TitleDisplayName}</h3>
                <span className="text-xs text-green-400 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-green-400"></span> Connected
                </span>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-white/30 space-y-4">
                  <MessageSquare size={48} className="opacity-20" />
                  <p>Start a conversation with {activeChat.TitleDisplayName}</p>
                </div>
              ) : (
                messages.map((msg) => {
                  const isMe = msg.senderId === gamerProfile.gamerId;
                  return (
                    <div
                      key={msg.id}
                      className={`mb-4 flex ${isMe ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-2xl px-4 py-2 shadow-lg ${
                          isMe
                            ? 'bg-blue-600 text-white rounded-br-sm'
                            : 'bg-white/10 text-white rounded-bl-sm border border-white/5'
                        }`}
                      >
                        <p className="text-sm">{msg.text}</p>
                        <span className="text-[10px] opacity-50 mt-1 block text-right">
                          {msg.createdAt?.toDate
                            ? msg.createdAt
                                .toDate()
                                .toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                            : 'Sending...'}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Chat Input */}
            <div className="p-4 border-t border-white/10 bg-black/20 shrink-0">
              <form onSubmit={sendMessage} className="relative flex items-center">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="w-full bg-white/5 border border-white/10 rounded-full py-3 pl-4 pr-12 text-white placeholder-white/40 focus:outline-none focus:border-blue-500 focus:bg-white/10 transition-all"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="absolute right-2 w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white hover:bg-blue-400 disabled:opacity-50 disabled:hover:bg-blue-500 transition-all shadow-lg"
                >
                  <Send size={18} className="ml-1" />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-white/30">
            <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mb-6 border border-white/10">
              <Users size={40} className="opacity-50" />
            </div>
            <h3 className="text-xl font-medium text-white/50">M NOVA Social Hub</h3>
            <p className="text-sm mt-2">Select a friend to start chatting</p>
          </div>
        )}
      </div>
    </div>
  );
}
