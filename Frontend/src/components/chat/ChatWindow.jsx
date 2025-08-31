// components/chat/ChatWindow.jsx
import React, { useState, useEffect, useRef } from 'react';
import { chatAPI } from '../../api';
import { useChat } from '../../context/ChatContext';

const ChatWindow = ({ conversation, currentUser, onConversationUpdate }) => {
  const { socket, joinConversation, leaveConversation, sendTyping, typingUsers } = useChat();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const chatPartner = conversation.organizer || conversation.participant;
  const isTyping = typingUsers.has(conversation._id);

  useEffect(() => {
    if (conversation) {
      fetchMessages();
      joinConversation(conversation._id);
    }

    return () => {
      if (conversation) {
        leaveConversation(conversation._id);
      }
    };
  }, [conversation]);

  useEffect(() => {
    if (socket) {
      socket.on('newMessage', handleNewMessage);
      return () => socket.off('newMessage', handleNewMessage);
    }
  }, [socket]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleNewMessage = (message) => {
    if (message.conversation === conversation._id) {
      setMessages(prev => [...prev, message]);
      onConversationUpdate?.();
    }
  };

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const data = await chatAPI.getMessages(conversation._id);
      console.log('Fetched messages:', data);
      setMessages(data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    try {
      setSending(true);
      const messageData = { content: newMessage.trim() };
      
      const sentMessage = await chatAPI.sendMessage(conversation._id, messageData);
      setMessages(prev => [...prev, sentMessage]);
      setNewMessage('');
      onConversationUpdate?.();

      // Emit to socket for real-time update
      if (socket) {
        socket.emit('sendMessage', {
          ...sentMessage,
          conversationId: conversation._id
        });
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  const handleTyping = () => {
    sendTyping(conversation._id, true);
    
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      sendTyping(conversation._id, false);
    }, 1000);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatMessageTime = (date) => {
    return new Date(date).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatMessageDate = (date) => {
    const messageDate = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (messageDate.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (messageDate.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return messageDate.toLocaleDateString();
    }
  };

  const groupMessagesByDate = (messages) => {
    const groups = {};
    messages.forEach(message => {
      const date = new Date(message.createdAt).toDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
    });
    return groups;
  };

  if (!conversation) {
    return (
      <div className="bg-gray-800 border border-gray-700 rounded-xl h-full flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">💬</div>
          <h3 className="text-xl font-bold text-white mb-2">Select a conversation</h3>
          <p className="text-gray-400">
            Choose a conversation to start chatting
          </p>
        </div>
      </div>
    );
  }

  const messageGroups = groupMessagesByDate(messages);

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-xl h-full flex flex-col overflow-hidden animate-fade-in">
      {/* Chat Header */}
      <div className="p-4 border-b border-gray-700 bg-gray-800">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <img
              src={chatPartner.profileImage || '/default-avatar.png'}
              alt={`${chatPartner.firstName} ${chatPartner.lastName}`}
              className="w-12 h-12 rounded-full object-cover"
              onError={(e) => {
                e.target.src = '/default-avatar.png';
              }}
            />
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 border-2 border-gray-800 rounded-full"></div>
          </div>
          <div className="flex-1">
            <h3 className="text-white font-semibold text-lg">
              {chatPartner.firstName} {chatPartner.lastName}
            </h3>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-blue-400">📅</span>
              <span className="text-sm text-blue-400">{conversation.event.title}</span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-xs text-green-400">Active</span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-900">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <span className="ml-2 text-gray-400">Loading messages...</span>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="text-4xl mb-4">🎪</div>
              <h4 className="text-white font-medium mb-2">Start the conversation</h4>
              <p className="text-gray-400 text-sm">
                Send your first message about {conversation.event.title}
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(messageGroups).map(([date, dateMessages]) => (
              <div key={date}>
                <div className="text-center my-4">
                  <span className="px-3 py-1 bg-gray-700 text-gray-300 text-xs rounded-full">
                    {formatMessageDate(dateMessages[0].createdAt)}
                  </span>
                </div>
                
                {dateMessages.map((message, index) => {
                  const isOwnMessage = message.sender._id === currentUser.id;
                  const showAvatar = index === dateMessages.length - 1 || 
                    dateMessages[index + 1]?.sender._id !== message.sender._id;
                  
                  return (
                    <div
                      key={message._id}
                      className={`flex items-end space-x-2 ${
                        isOwnMessage ? 'flex-row-reverse space-x-reverse' : ''
                      }`}
                    >
                      {!isOwnMessage && (
                        <img
                          src={message.sender.profileImage || '/default-avatar.png'}
                          alt={message.sender.firstName}
                          className={`w-8 h-8 rounded-full object-cover ${
                            showAvatar ? 'opacity-100' : 'opacity-0'
                          }`}
                          onError={(e) => {
                            e.target.src = '/default-avatar.png';
                          }}
                        />
                      )}
                      
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                          isOwnMessage
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-700 text-white border border-gray-600'
                        } hover:scale-105 transition-transform duration-200`}
                      >
                        <p className="text-sm leading-relaxed">{message.content}</p>
                        <span className={`text-xs mt-1 block ${
                          isOwnMessage ? 'text-blue-200' : 'text-gray-400'
                        }`}>
                          {formatMessageTime(message.createdAt)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
            
            {isTyping && (
              <div className="flex items-center space-x-2 animate-fade-in">
                <img
                  src={chatPartner.profileImage || '/default-avatar.png'}
                  alt={chatPartner.firstName}
                  className="w-8 h-8 rounded-full object-cover"
                  onError={(e) => {
                    e.target.src = '/default-avatar.png';
                  }}
                />
                <div className="bg-gray-700 px-4 py-2 rounded-2xl flex items-center space-x-2 border border-gray-600">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                  <span className="text-xs text-gray-400">
                    {chatPartner.firstName} is typing...
                  </span>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Message Input */}
      <form onSubmit={sendMessage} className="p-4 border-t border-gray-700 bg-gray-800">
        <div className="flex items-center space-x-3">
          <div className="flex-1 relative">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => {
                setNewMessage(e.target.value);
                handleTyping();
              }}
              placeholder={`Message ${chatPartner.firstName} about ${conversation.event.title}...`}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-full text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              disabled={sending}
              maxLength={500}
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-500">
              {newMessage.length}/500
            </div>
          </div>
          
          <button
            type="submit"
            disabled={!newMessage.trim() || sending}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-full font-medium transition-all duration-200 flex items-center space-x-2 hover:scale-105 active:scale-95"
          >
            {sending ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Sending...</span>
              </>
            ) : (
              <>
                <span>Send</span>
                <svg className="w-4 h-4 transform rotate-45" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </>
            )}
          </button>
        </div>
        
        {/* Quick Actions */}
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center space-x-4 text-xs text-gray-400">
            <span>Press Enter to send</span>
            <span>•</span>
            <span>Shift + Enter for new line</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              type="button"
              className="p-2 text-gray-400 hover:text-white transition-colors rounded-full hover:bg-gray-700"
              title="Add emoji"
            >
              😊
            </button>
            <button
              type="button"
              className="p-2 text-gray-400 hover:text-white transition-colors rounded-full hover:bg-gray-700"
              title="Attach file"
            >
              📎
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ChatWindow;
