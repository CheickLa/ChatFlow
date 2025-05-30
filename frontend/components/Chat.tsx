import { useState, useEffect, useRef } from 'react';
import socketService, { User, Message } from '../lib/socket';
import ColorPickerModal from './ColorPickerModal';
import Logout from './Logout';

interface ChatProps {
  token: string;
  user: User;
}

export default function Chat({ token, user }: ChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState<string>('');
  const [connectedUsers, setConnectedUsers] = useState<User[]>([]);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [userColor, setUserColor] = useState(user.color  ?? '#000000');

  useEffect(() => {
    const socket = socketService.connect(token);

    socket.on('messageHistory', (history: Message[]) => {
      setMessages(history);
    });

    socket.on('newMessage', (message: Message) => {
      setMessages(prev => [...prev, message]);
    });

    socket.on('moreMessages', (olderMessages: Message[]) => {
      setMessages(prev => [...olderMessages, ...prev]);
      setIsLoadingMore(false);
    });

    socket.on('messageError', (error: string) => {
      console.error('Erreur message:', error);
    });

    socket.on('connectedUsers', (users: User[]) => {
      setConnectedUsers(users);
    });

    socket.on('userJoined', (user: User) => {
      setConnectedUsers(prev => [...prev, user]);
    });

    socket.on('userLeft', (user: User) => {
      setConnectedUsers(prev => prev.filter(u => u.userId !== user.userId));
    });

    socket.on('userTyping', ({ user, isTyping }: { user: User; isTyping: boolean }) => {
      setTypingUsers(prev => {
        if (isTyping) {
          return prev.includes(user.username) ? prev : [...prev, user.username];
        } else {
          return prev.filter(username => username !== user.username);
        }
      });
    });

    return () => {
      socketService.disconnect();
    };
  }, [token]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadMoreMessages = (): void => {
    if (messages.length === 0 || isLoadingMore) return;

    setIsLoadingMore(true);
    const oldestMessage = messages[0];
    socketService.emit('loadMoreMessages', { before: oldestMessage.createdAt });
  };

  const sendMessage = (e: React.FormEvent): void => {
    e.preventDefault();
    if (newMessage.trim()) {
      socketService.emit('sendMessage', { content: newMessage });
      setNewMessage('');
      socketService.emit('typing', { isTyping: false });
    }
  };

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setNewMessage(e.target.value);
    socketService.emit('typing', { isTyping: true });
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    typingTimeoutRef.current = setTimeout(() => {
      socketService.emit('typing', { isTyping: false });
    }, 2000);
  };

  const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

  return (
    <div className="flex h-screen bg-gray-100 relative">
      {/* Modal color picker */}
      {showColorPicker && (
        <ColorPickerModal
          initialColor={userColor}
          onClose={() => setShowColorPicker(false)}
          onSave={async (newColor: string) => {
            try {
              const res = await fetch(`${API_URL}/users/color`, {
                method: 'PATCH',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ color: newColor }),
              });

              if (!res.ok) throw new Error('Erreur lors de la mise à jour de la couleur');

              const updatedUser = await res.json();

              setUserColor(updatedUser.color);
              setShowColorPicker(false);

              // Mise à jour des utilisateurs connectés
              setConnectedUsers(users =>
                users.map(u =>
                  u.userId === user.userId ? { ...u, color: updatedUser.color } : u
                )
              );

              // Mise à jour des messages
              setMessages(msgs =>
                msgs.map(m =>
                  m.user.userId === user.userId
                    ? { ...m, user: { ...m.user, color: updatedUser.color } }
                    : m
                )
              );
            } catch (err) {
              alert('Impossible de changer la couleur. Réessayez plus tard.');
              console.error(err);
            }
          }}
        />
      )}

      {/* Sidebar des utilisateurs */}
      <div className="w-64 bg-white border-r border-gray-200 p-4">
        <h3 className="text-lg font-semibold mb-4">Utilisateurs connectés</h3>
        <ul className="space-y-2">
          {connectedUsers.map(user => (
            <li key={user.userId} className="flex items-center space-x-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: user.color }}
              ></div>
              <span className="text-sm">{user.username}</span>
            </li>
          ))}
        </ul>        
      </div>

      {/* Zone de chat */}
      <div className="flex-1 flex flex-col">
        {/* Messages */}
        <div
          ref={messagesContainerRef}
          className="flex-1 overflow-y-auto p-4 space-y-4"
        >
          {messages.length > 0 && (
            <button
              onClick={loadMoreMessages}
              disabled={isLoadingMore}
              className="w-full py-2 text-sm text-gray-500 hover:text-gray-700 disabled:opacity-50"
            >
              {isLoadingMore ? 'Chargement...' : 'Charger plus de messages'}
            </button>
          )}

          {messages.map(message => {
            const isOwnMessage = message.user.userId === user.userId;

            return (
              <div
                key={message.messageId}
                className={`flex items-start space-x-3 ${
                  isOwnMessage ? 'justify-end' : ''
                }`}
              >
                {!isOwnMessage && (
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
                    style={{ backgroundColor: message.user.color }}
                  >
                    {message.user.username.charAt(0).toUpperCase()}
                  </div>
                )}

                <div className={`flex flex-col ${isOwnMessage ? 'items-end' : 'items-start'}`}>
                  <div className="flex items-center space-x-2 mb-1">
                    {!isOwnMessage && (
                      <span className="font-semibold text-sm">{message.user.username}</span>
                    )}
                    <span className="text-xs text-gray-500">
                      {new Date(message.createdAt).toLocaleTimeString()}
                    </span>
                  </div>
                  <p
                    className={`text-sm rounded-lg px-3 py-2 shadow-sm max-w-xs ${
                      isOwnMessage
                        ? 'bg-blue-500 text-white'
                        : 'bg-white text-gray-800'
                    }`}
                  >
                    {message.content}
                  </p>
                </div>

                {isOwnMessage && (
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
                    style={{ backgroundColor: message.user.color }}
                  >
                    {message.user.username.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
            );
          })}

          {typingUsers.length > 0 && (
            <div className="text-sm text-gray-500 italic">
              {typingUsers.join(', ')} {typingUsers.length === 1 ? 'tape' : 'tapent'}...
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Formulaire d'envoi */}
        <form onSubmit={sendMessage} className="border-t border-gray-200 p-4">
          <div className="flex space-x-2">
            <input
              type="text"
              value={newMessage}
              onChange={handleTyping}
              placeholder="Tapez votre message..."
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Envoyer
            </button>
            {/* Bouton pour changer la couleur */}
            <button
              onClick={() => setShowColorPicker(true)}
              style={{ backgroundColor: userColor }}
              className=" w-12 h-12 rounded-full border-4 border-white shadow-lg"
              title="Changer ma couleur"
            />
            <Logout />
          </div>
        </form>
      </div>
    </div>
  );
}
