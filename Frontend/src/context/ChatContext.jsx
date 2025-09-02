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
      console.log('Initializing socket connection for user:', user.id);
      
      const newSocket = io( 'https://event-platform-ktlv.onrender.com', {
        withCredentials: true,
        transports: ['websocket', 'polling'],
        forceNew: true
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
        console.log('User came online:', userId);
        setOnlineUsers(prev => new Set([...prev, userId]));
      });

      newSocket.on('userOffline', (userId) => {
        console.log('User went offline:', userId);
        setOnlineUsers(prev => {
          const newSet = new Set(prev);
          newSet.delete(userId);
          return newSet;
        });
      });

      newSocket.on('userTyping', ({ isTyping, userName, conversationId }) => {
        console.log('User typing event:', { isTyping, userName, conversationId });
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
        if (isTyping) {
          setTimeout(() => {
            setTypingUsers(prev => {
              const newMap = new Map(prev);
              if (newMap.get(conversationId) === userName) {
                newMap.delete(conversationId);
              }
              return newMap;
            });
          }, 3000);
        }
      });

      // Handle incoming messages
      newSocket.on('newMessage', (message) => {
        console.log('Received new message from socket:', message);
      });

      setSocket(newSocket);

      return () => {
        console.log('Cleaning up socket connection');
        newSocket.disconnect();
      };
    }
  }, [user]);

  const joinConversation = (conversationId) => {
    if (socket && socket.connected && conversationId) {
      console.log('Joining conversation:', conversationId);
      socket.emit('joinConversation', conversationId);
    }
  };

  const leaveConversation = (conversationId) => {
    if (socket && socket.connected && conversationId) {
      console.log('Leaving conversation:', conversationId);
      socket.emit('leaveConversation', conversationId);
    }
  };

  const sendTyping = (conversationId, isTyping) => {
    if (socket && socket.connected && user && conversationId) {
      socket.emit('typing', {
        conversationId,
        isTyping,
        userName: user.firstName || user.username
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
