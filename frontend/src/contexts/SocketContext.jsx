import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import { useAuth } from './AuthContext.jsx';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated && user) {
      // Create socket connection with auth token
      const token = localStorage.getItem('token');
      const newSocket = io(import.meta.env.VITE_API_URL.replace('/api', ''), {
        query: { token },
        transports: ['websocket', 'polling']
      });

      // Connection events
      newSocket.on('connect', () => {
        console.log('Connected to server');
        setIsConnected(true);
      });

      newSocket.on('disconnect', () => {
        console.log('Disconnected from server');
        setIsConnected(false);
      });

      // Error handling
      newSocket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        setIsConnected(false);
      });

      setSocket(newSocket);

      // Cleanup on unmount
      return () => {
        newSocket.close();
      };
    } else {
      // Close socket if user logs out
      if (socket) {
        socket.close();
        setSocket(null);
        setIsConnected(false);
      }
    }
  }, [isAuthenticated, user]);

  // Join expo room
  const joinExpo = (expoId) => {
    if (socket && isConnected) {
      socket.emit('join-expo', expoId);
    }
  };

  // Leave expo room
  const leaveExpo = (expoId) => {
    if (socket && isConnected) {
      socket.emit('leave-expo', expoId);
    }
  };

  // Listen to real-time events
  const onSessionUpdated = (callback) => {
    if (socket) {
      socket.on('session-updated', callback);
      return () => socket.off('session-updated', callback);
    }
  };

  const onAttendanceUpdated = (callback) => {
    if (socket) {
      socket.on('attendance-updated', callback);
      return () => socket.off('attendance-updated', callback);
    }
  };

  const onNewMessage = (callback) => {
    if (socket) {
      socket.on('new-message', callback);
      return () => socket.off('new-message', callback);
    }
  };

  const onNewNotification = (callback) => {
    if (socket) {
      socket.on('new-notification', callback);
      return () => socket.off('new-notification', callback);
    }
  };

  const onExpoCreated = (callback) => {
    if (socket) {
      socket.on('expo-created', callback);
      return () => socket.off('expo-created', callback);
    }
  };

  const onUserRegistered = (callback) => {
    if (socket) {
      socket.on('user-registered', callback);
      return () => socket.off('user-registered', callback);
    }
  };

  const onAttendeeRegistered = (callback) => {
    if (socket) {
      socket.on('attendee-registered', callback);
      return () => socket.off('attendee-registered', callback);
    }
  };

  const onSessionBookmarked = (callback) => {
    if (socket) {
      socket.on('session-bookmarked', callback);
      return () => socket.off('session-bookmarked', callback);
    }
  };

  const onApplicationStatusChanged = (callback) => {
    if (socket) {
      socket.on('application-status-changed', callback);
      return () => socket.off('application-status-changed', callback);
    }
  };

  const onSessionRegistered = (callback) => {
    if (socket) {
      socket.on('session-registered', callback);
      return () => socket.off('session-registered', callback);
    }
  };

  const onExpoUpdated = (callback) => {
    if (socket) {
      socket.on('expo-updated', callback);
      return () => socket.off('expo-updated', callback);
    }
  };

  const onBoothAllocated = (callback) => {
    if (socket) {
      socket.on('booth-allocated', callback);
      return () => socket.off('booth-allocated', callback);
    }
  };

  const value = {
    socket,
    isConnected,
    joinExpo,
    leaveExpo,
    onSessionUpdated,
    onAttendanceUpdated,
    onNewMessage,
    onNewNotification,
    onExpoCreated,
    onUserRegistered,
    onAttendeeRegistered,
    onSessionBookmarked,
    onApplicationStatusChanged,
    onSessionRegistered,
    onExpoUpdated,
    onBoothAllocated
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

export default SocketContext;
