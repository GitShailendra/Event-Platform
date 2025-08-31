// context/ChatContext.jsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import { useAuth } from './AuthContext';

const ChatContext = createContext();

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

export const ChatProvider = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [typingUsers, setTypingUsers] = useState(new Map());
  const [connectionStatus, setConnectionStatus] = useState('disconnected');

  useEffect(() => {
    if (user) {
      const newSocket = io('http://localhost:5000', {
        withCredentials: true,
        transports: ['websocket', 'polling']
      });

      newSocket.on('connect', () => {
        console.log('Connected to chat server');
        setConnectionStatus('connected');
        newSocket.emit('userOnline', user.id);
      });

      newSocket.on('disconnect', () => {
        console.log('Disconnected from chat server');
        setConnectionStatus('disconnected');
      });

      newSocket.on('connect_error', (error) => {
        console.error('Connection error:', error);
        setConnectionStatus('error');
      });

      newSocket.on('userOnline', (userId) => {
        setOnlineUsers(prev => new Set([...prev, userId]));
      });

      newSocket.on('userOffline', (userId) => {
        setOnlineUsers(prev => {
          const newSet = new Set(prev);
          newSet.delete(userId);
          return newSet;
        });
      });

      newSocket.on('userTyping', ({ isTyping, userName, conversationId }) => {
        setTypingUsers(prev => {
          const newMap = new Map(prev);
          if (isTyping) {
            newMap.set(conversationId, userName);
          } else {
            newMap.delete(conversationId);
          }
          return newMap;
        });

        // Clear typing after 3 seconds if no update
        setTimeout(() => {
          setTypingUsers(prev => {
            const newMap = new Map(prev);
            if (newMap.get(conversationId) === userName) {
              newMap.delete(conversationId);
            }
            return newMap;
          });
        }, 3000);
      });

      setSocket(newSocket);

      return () => {
        newSocket.disconnect();
      };
    }
  }, [user]);

  const joinConversation = (conversationId) => {
    if (socket && socket.connected) {
      socket.emit('joinConversation', conversationId);
    }
  };

  const leaveConversation = (conversationId) => {
    if (socket && socket.connected) {
      socket.emit('leaveConversation', conversationId);
    }
  };

  const sendTyping = (conversationId, isTyping) => {
    if (socket && socket.connected && user) {
      socket.emit('typing', {
        conversationId,
        isTyping,
        userName: user.firstName
      });
    }
  };

  const value = {
    socket,
    onlineUsers,
    typingUsers,
    connectionStatus,
    joinConversation,
    leaveConversation,
    sendTyping
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};
