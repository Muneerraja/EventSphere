import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Send, Search, User, MoreVertical, Paperclip, Phone, Video, Users } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { useSocket } from '../../contexts/SocketContext.jsx';

const MessagesCenter = () => {
  const { user } = useAuth();
  const { onNewMessage } = useSocket();
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchConversations();
    }
  }, [user]);

  useEffect(() => {
    if (activeConversation) {
      fetchMessages(activeConversation.id);
    }
  }, [activeConversation]);

  // Listen for real-time messages
  useEffect(() => {
    const unsubscribe = onNewMessage((messageData) => {
      // Check if the message belongs to the current active conversation
      if (activeConversation && messageData.conversationId === activeConversation.conversationId) {
        setMessages(prev => [...prev, messageData]);
      }

      // Update conversations list with new message
      setConversations(prev =>
        prev.map(conv =>
          conv.conversationId === messageData.conversationId
            ? {
                ...conv,
                lastMessage: messageData.content,
                lastMessageTime: messageData.createdAt,
                unreadCount: conv.conversationId === activeConversation?.conversationId ? 0 : (conv.unreadCount || 0) + 1
              }
            : conv
        )
      );
    });

    return unsubscribe;
  }, [onNewMessage, activeConversation]);

  const fetchConversations = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/messages/conversations/`);
      setConversations(response.data);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      // Set empty array on error
      setConversations([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (conversationId) => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/messages/${conversationId}`);
      setMessages(response.data);
    } catch (error) {
      console.error('Error fetching messages:', error);
      setMessages([]);
    }
  };

  const filteredConversations = conversations.filter(conv =>
    conv.participant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.lastMessage.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSendMessage = async () => {
    if (newMessage.trim() && activeConversation) {
      try {
        const response = await axios.post(`${import.meta.env.VITE_API_URL}/messages/send`, {
          receiverId: activeConversation.participant._id,
          content: newMessage.trim(),
          type: 'text'
        });

        // Add the sent message to local state
        const sentMessage = {
          ...response.data,
          senderId: response.data.sender._id,
          sender: response.data.sender,
          timestamp: response.data.createdAt
        };

        setMessages(prev => [...prev, sentMessage]);
        setNewMessage('');

        // Update last message in conversation
        setConversations(prev =>
          prev.map(conv =>
            conv.conversationId === activeConversation.conversationId
              ? { ...conv, lastMessage: newMessage.trim(), lastMessageTime: new Date().toISOString(), unreadCount: 0 }
              : conv
          )
        );
      } catch (error) {
        console.error('Error sending message:', error);
        alert('Failed to send message. Please try again.');
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'organizer': return 'bg-purple-100 text-purple-800';
      case 'exhibitor': return 'bg-blue-100 text-blue-800';
      case 'attendee': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-gray-50">
      {/* Conversations Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-xl font-semibold text-gray-900 mb-4">Messages</h1>

          {/* Search */}
          <div className="relative">
            <Search size={18} className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          {filteredConversations.length === 0 ? (
            <div className="p-8 text-center">
              <MessageSquare size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600">No conversations found</p>
            </div>
          ) : (
            filteredConversations.map((conversation) => (
              <motion.div
                key={conversation.id}
                onClick={() => setActiveConversation(conversation)}
                className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                  activeConversation?.id === conversation.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                }`}
                whileHover={{ scale: 1.01 }}
              >
                <div className="flex items-start space-x-3">
                  <div className="relative">
                    <img
                      src={conversation.participant.avatar}
                      alt={conversation.participant.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    {conversation.isOnline && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-sm font-semibold text-gray-900 truncate">
                        {conversation.participant.name}
                      </h3>
                      <span className="text-xs text-gray-500">
                        {formatDate(conversation.timestamp)}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2 mb-1">
                      <span className={`px-2 py-1 rounded text-xs font-medium capitalize ${getRoleColor(conversation.participant.role)}`}>
                        {conversation.participant.role}
                      </span>
                      {conversation.participant.company !== 'Personal Account' && (
                        <span className="text-xs text-gray-500 truncate">
                          {conversation.participant.company}
                        </span>
                      )}
                    </div>

                    <p className="text-sm text-gray-600 truncate mb-1">
                      {conversation.lastMessage}
                    </p>

                    {conversation.unreadCount > 0 && (
                      <div className="inline-flex items-center justify-center px-2 py-1 text-xs font-medium text-white bg-blue-600 rounded-full">
                        {conversation.unreadCount}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      {activeConversation ? (
        <div className="flex-1 flex flex-col">
          {/* Chat Header */}
          <div className="bg-white border-b border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <img
                    src={activeConversation.participant.avatar}
                    alt={activeConversation.participant.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  {activeConversation.isOnline && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                  )}
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    {activeConversation.participant.name}
                  </h2>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium capitalize ${getRoleColor(activeConversation.participant.role)}`}>
                      {activeConversation.participant.role}
                    </span>
                    <span className="text-sm text-gray-600">
                      {activeConversation.participant.company}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
                  <Phone size={18} />
                </button>
                <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
                  <Video size={18} />
                </button>
                <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
                  <MoreVertical size={18} />
                </button>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message, index) => {
              const isMe = message.senderId === 'me';
              const showDate = index === 0 || formatDate(messages[index - 1]?.timestamp) !== formatDate(message.timestamp);

              return (
                <div key={message.id}>
                  {showDate && (
                    <div className="text-center mb-4">
                      <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                        {formatDate(message.timestamp)}
                      </span>
                    </div>
                  )}

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${isMe ? 'justify-end' : 'justify-start'} mb-4`}
                  >
                    <div className={`flex max-w-xs lg:max-w-md ${isMe ? 'flex-row-reverse' : ''}`}>
                      {!isMe && (
                        <img
                          src={message.sender.avatar}
                          alt={message.sender.name}
                          className="w-8 h-8 rounded-full object-cover mr-3 flex-shrink-0"
                        />
                      )}

                      <div>
                        <div
                          className={`px-4 py-2 rounded-lg ${
                            isMe
                              ? 'bg-blue-600 text-white'
                              : 'bg-white border border-gray-200 text-gray-900'
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatTime(message.timestamp)}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                </div>
              );
            })}
          </div>

          {/* Message Input */}
          <div className="bg-white border-t border-gray-200 p-4">
            <div className="flex items-end space-x-3">
              <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full">
                <Paperclip size={20} />
              </button>

              <div className="flex-1">
                <textarea
                  rows={1}
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  style={{ minHeight: '44px', maxHeight: '120px' }}
                />
              </div>

              <button
                onClick={handleSendMessage}
                disabled={!newMessage.trim()}
                className="p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* No Conversation Selected */
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <MessageSquare size={64} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Select a conversation</h3>
            <p className="text-gray-600">Choose a conversation from the sidebar to start messaging</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessagesCenter;
