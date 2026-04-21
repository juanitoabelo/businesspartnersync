import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { FiSend, FiPaperclip } from 'react-icons/fi';

const API_URL = '/api';

const Messages = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (loading) return;
    const userId = searchParams.get('userId');
    if (!userId) return;
    
    const existingConv = conversations.find(c => c.otherUser?._id === userId);
    if (existingConv) {
      setActiveConversation(existingConv);
    } else {
      createNewConversation(userId);
    }
  }, [searchParams, conversations, loading]);

  const createNewConversation = async (userId) => {
    try {
      const res = await axios.post(`${API_URL}/messages/conversations`, { participantId: userId });
      setConversations(prev => [...prev, res.data]);
      setActiveConversation(res.data);
    } catch (error) {
      console.error('Error creating conversation:', error);
    }
  };

  useEffect(() => {
    if (activeConversation) {
      fetchMessages(activeConversation._id);
    }
  }, [activeConversation]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchConversations = async () => {
    try {
      const res = await axios.get(`${API_URL}/messages/conversations`);
      setConversations(res.data);
      if (res.data.length > 0) {
        setActiveConversation(res.data[0]);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (conversationId) => {
    try {
      const res = await axios.get(`${API_URL}/messages/conversations/${conversationId}/messages`);
      setMessages(res.data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeConversation) return;

    try {
      const res = await axios.post(
        `${API_URL}/messages/conversations/${activeConversation._id}/messages`,
        { content: newMessage }
      );
      setMessages([...messages, res.data]);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const getInitials = (profile) => {
    if (profile?.firstName) {
      return `${profile.firstName[0]}${profile.lastName?.[0] || ''}`.toUpperCase();
    }
    return 'U';
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '64px' }}>Loading...</div>;
  }

  return (
    <div>
      <div className="page-header">
        <h2>Messages</h2>
        <p>Chat with your connections</p>
      </div>

      {conversations.length === 0 ? (
        <div className="card empty-state">
          <h3>No conversations yet</h3>
          <p>Connect with partners to start chatting</p>
        </div>
      ) : (
        <div className="messages-container">
          <div className="conversations-list">
            {conversations.map((conv) => (
              <div
                key={conv._id}
                className={`conversation-item ${activeConversation?._id === conv._id ? 'active' : ''}`}
                onClick={() => setActiveConversation(conv)}
              >
                <div className="user-avatar" style={{ width: '48px', height: '48px', fontSize: '16px' }}>
                  {getInitials(conv.otherUser?.profile)}
                </div>
                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <h4 style={{ fontSize: '14px', fontWeight: 600 }}>
                      {conv.otherUser?.profile?.companyName || 'Unknown'}
                    </h4>
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                      {formatTime(conv.lastMessageAt)}
                    </span>
                  </div>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {conv.lastMessage || 'Start a conversation'}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="chat-area">
            {activeConversation ? (
              <>
                <div className="chat-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div className="user-avatar" style={{ width: '44px', height: '44px', fontSize: '14px' }}>
                      {getInitials(activeConversation.otherUser?.profile)}
                    </div>
                    <div>
                      <h4>{activeConversation.otherUser?.profile?.companyName}</h4>
                      <p style={{ fontSize: '13px', color: 'var(--text-secondary)', textTransform: 'capitalize' }}>
                        {activeConversation.otherUser?.role}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="chat-messages">
                  {messages.map((msg) => (
                    <div
                      key={msg._id}
                      className={`message ${msg.senderId?._id === user._id ? 'sent' : 'received'}`}
                    >
                      <div className="message-bubble">
                        <p>{msg.content}</p>
                        <span style={{ fontSize: '11px', opacity: 0.7, display: 'block', marginTop: '4px' }}>
                          {formatTime(msg.createdAt)}
                        </span>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                <form className="message-input" onSubmit={sendMessage}>
                  <input
                    type="text"
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                  />
                  <button type="button" className="btn btn-secondary" style={{ padding: '12px' }}>
                    <FiPaperclip />
                  </button>
                  <button type="submit" className="btn btn-primary" style={{ padding: '12px' }}>
                    <FiSend />
                  </button>
                </form>
              </>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-secondary)' }}>
                Select a conversation to start chatting
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Messages;