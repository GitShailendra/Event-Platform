// components/user/UserChat.jsx
import React, { useState, useEffect } from 'react';
import { chatAPI } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '../../context/ChatContext';
import ChatWindow from '../../components/chat/ChatWindow';
import StartConversationModal from './StartConversationModel';

const UserChat = () => {
  const { user } = useAuth();
  const { onlineUsers } = useChat();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showStartModal, setShowStartModal] = useState(false);

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const data = await chatAPI.getConversations();
      setConversations(data);
    } catch (err) {
      setError(err.message || 'Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  const handleStartConversation = async (eventId) => {
    try {
      const conversation = await chatAPI.startConversation(eventId);
      setConversations(prev => [conversation, ...prev]);
      setSelectedConversation(conversation);
      setShowStartModal(false);
    } catch (err) {
      alert(err.message || 'Failed to start conversation');
    }
  };

  const formatLastMessageTime = (date) => {
    const now = new Date();
    const messageDate = new Date(date);
    const diff = now - messageDate;
    
    if (diff < 60000) return 'now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return messageDate.toLocaleDateString();
  };

  const isUserOnline = (userId) => {
    return onlineUsers.has(userId);
  };

  if (loading) {
    return (
      <div className="space-y-8 animate-fade-in">
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <span className="ml-3 text-gray-400">Loading conversations...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-8 animate-fade-in">
        <div className="text-center py-16">
          <div className="text-6xl mb-4">💬</div>
          <h2 className="text-2xl font-bold text-white mb-2">Chat Error</h2>
          <p className="text-gray-400 mb-6">{error}</p>
          <button onClick={fetchConversations} className="btn-primary">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">💬 Event Organizers</h1>
            <p className="text-gray-400">
              Chat with organizers of events you've joined
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowStartModal(true)}
              className="btn-primary"
            >
              ➕ Start Chat
            </button>
            <span className="px-3 py-1 bg-blue-900 text-blue-300 rounded-full text-sm">
              {conversations.length} organizers
            </span>
          </div>
        </div>
      </div>

      {/* Chat Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
        {/* Organizers List */}
        <div className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden">
          <div className="p-4 border-b border-gray-700">
            <h3 className="text-lg font-semibold text-white">Event Organizers</h3>
          </div>
          
          <div className="overflow-y-auto h-full">
            {conversations.length === 0 ? (
              <div className="p-8 text-center">
                <div className="text-4xl mb-4">🎪</div>
                <h4 className="text-white font-medium mb-2">No organizers to chat with</h4>
                <p className="text-gray-400 text-sm mb-4">
                  Join events to chat with their organizers
                </p>
                <button
                  onClick={() => setShowStartModal(true)}
                  className="btn-primary text-sm"
                >
                  Find Events
                </button>
              </div>
            ) : (
              <div className="divide-y divide-gray-700">
                {conversations.map((conversation) => (
                  <div
                    key={conversation._id}
                    onClick={() => setSelectedConversation(conversation)}
                    className={`p-4 cursor-pointer hover:bg-gray-700 transition-colors ${
                      selectedConversation?._id === conversation._id 
                        ? 'bg-gray-700 border-r-4 border-blue-500' 
                        : ''
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="relative">
                        <img
                          src={conversation.organizer.profileImage || '/default-avatar.png'}
                          alt={`${conversation.organizer.firstName} ${conversation.organizer.lastName}`}
                          className="w-12 h-12 rounded-full object-cover"
                          onError={(e) => {
                            e.target.src = '/default-avatar.png';
                          }}
                        />
                        {isUserOnline(conversation.organizer._id) && (
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 border-2 border-gray-800 rounded-full"></div>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="text-white font-medium truncate">
                            {conversation.organizer.firstName} {conversation.organizer.lastName}
                          </h4>
                          {conversation.lastMessage && (
                            <span className="text-xs text-gray-400">
                              {formatLastMessageTime(conversation.lastMessageTime)}
                            </span>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-1 mb-2">
                          <span className="text-xs text-blue-400">📅</span>
                          <span className="text-xs text-blue-400 truncate">
                            {conversation.event.title}
                          </span>
                        </div>
                        
                        {conversation.lastMessage && (
                          <p className="text-sm text-gray-400 truncate">
                            {conversation.lastMessage.sender._id === user.id ? 'You: ' : ''}
                            {conversation.lastMessage.content}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Chat Window */}
        <div className="lg:col-span-2">
          {selectedConversation ? (
            <ChatWindow
              conversation={selectedConversation}
              currentUser={user}
              onConversationUpdate={fetchConversations}
            />
          ) : (
            <div className="bg-gray-800 border border-gray-700 rounded-xl h-full flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl mb-4">🎪</div>
                <h3 className="text-xl font-bold text-white mb-2">Select an organizer</h3>
                <p className="text-gray-400 mb-4">
                  Choose an event organizer to start chatting
                </p>
                <button
                  onClick={() => setShowStartModal(true)}
                  className="btn-secondary"
                >
                  Start New Chat
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Start Conversation Modal */}
      {showStartModal && (
        <StartConversationModal
          onClose={() => setShowStartModal(false)}
          onStartConversation={handleStartConversation}
        />
      )}
    </div>
  );
};

export default UserChat;
