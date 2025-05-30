import { io, Socket } from 'socket.io-client';

interface User {
  userId: number;
  username: string;
  color: string;
}

interface Message {
  messageId: number;
  user: User;
  content: string;
  createdAt: string;
}

interface ServerToClientEvents {
  messageHistory: (messages: Message[]) => void;
  newMessage: (message: Message) => void;
  moreMessages: (messages: Message[]) => void;
  messageError: (error: string) => void;
  connectedUsers: (users: User[]) => void;
  userJoined: (user: User) => void;
  userLeft: (user: User) => void;
  userTyping: (data: { user: User; isTyping: boolean }) => void;
}

interface ClientToServerEvents {
  sendMessage: (data: { content: string }) => void;
  typing: (data: { isTyping: boolean }) => void;
  loadMoreMessages: (data: { before: string }) => void;
}

class SocketService {
  private socket: Socket<ServerToClientEvents, ClientToServerEvents> | null = null;
  private URL_BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

  connect(token: string): Socket<ServerToClientEvents, ClientToServerEvents> {
    if (this.socket?.connected) {
      return this.socket;
    }

    this.socket = io(this.URL_BACKEND, {
      auth: {
        token: token
      },
      autoConnect: false
    });

    this.socket.connect();
    return this.socket;
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  on<K extends keyof ServerToClientEvents>(event: K, callback: ServerToClientEvents[K]): void {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  off<K extends keyof ServerToClientEvents>(event: K, callback?: ServerToClientEvents[K]): void {
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }

  emit<K extends keyof ClientToServerEvents>(event: K, data: Parameters<ClientToServerEvents[K]>[0]): void {
    if (this.socket) {
      this.socket.emit(event, data);
    }
  }
}

export default new SocketService();
export type { User, Message };