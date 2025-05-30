import {
    WebSocketGateway,
    SubscribeMessage,
    MessageBody,
    ConnectedSocket,
    OnGatewayConnection,
    OnGatewayDisconnect,
    WebSocketServer,
  } from '@nestjs/websockets';
  import { Server, Socket } from 'socket.io';
  import { JwtService } from '@nestjs/jwt';
  import { Logger } from '@nestjs/common';
  import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
  
  interface User {
    userId: number;
    username: string;
    color: string;
  }
  
  interface Message {
    messageId: number;
    user: User;
    content: string;
    createdAt: Date;
  }

  const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
  @WebSocketGateway({
    cors: {
      origin: FRONTEND_URL,
      credentials: true,
    },
  })
  export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;
  
    private readonly logger = new Logger(ChatGateway.name);
    private connectedUsers = new Map<string, User>();
  
    constructor(
      private jwtService: JwtService,
      private prisma: PrismaService,
      private configService: ConfigService
    ) {}
  
    async handleConnection(client: Socket) {
      try {
        // Récupérer le token depuis les headers
        const token = client.handshake.auth.token;
        
        if (!token) {
          client.disconnect();
          return;
        }
  
        // Vérifier le JWT
        const payload = this.jwtService.verify(token, { secret: this.configService.get('SECRET_KEY') });
        
        const user = await this.prisma.user.findUnique({
          where: { userId: payload.sub },
          select: {
            userId: true,
            username: true,
            color: true,
          }
        });
  
        if (!user) {
          client.disconnect();
          return;
        }
  
        // Stocker les infos utilisateur dans le socket
        client.data.user = user;
  
        // Ajouter à la liste des utilisateurs connectés
        this.connectedUsers.set(client.id, user);
  
        this.logger.log(`Client connecté: ${user.username}`);
  
        // Envoyer l'historique des messages récents au nouveau client
        const recentMessages = await this.getRecentMessages();
        client.emit('messageHistory', recentMessages);
  
        // Notifier les autres utilisateurs
        client.broadcast.emit('userJoined', user);
        
        // Envoyer la liste des utilisateurs connectés au nouveau client
        client.emit('connectedUsers', Array.from(this.connectedUsers.values()));
  
      } catch (error) {
        this.logger.error('Erreur lors de la connexion:', error);
        client.disconnect();
      }
    }
  
    handleDisconnect(client: Socket) {
      if (client.data.user) {
        const user = this.connectedUsers.get(client.id);
        this.connectedUsers.delete(client.id);
        
        this.logger.log(`Client déconnecté: ${client.data.user.username}`);
        
        // Notifier les autres utilisateurs
        this.server.emit('userLeft', user);
      }
    }
  
    @SubscribeMessage('sendMessage')
    async handleMessage(
      @MessageBody() data: { content: string },
      @ConnectedSocket() client: Socket,
    ) {
      if (!client.data.user || !data.content.trim()) {
        return;
      }
  
      try {
        // Stockage du message dans la base de données
        const savedMessage = await this.prisma.message.create({
          data: {
            content: data.content.trim(),
            userId: client.data.user.userId,
          },
          include: {
            user: {
              select: {
                userId: true,
                username: true,
                color: true,
              }
            }
          }
        });
  
        const message: Message = {
          messageId: savedMessage.messageId,
          user: savedMessage.user,
          content: savedMessage.content,
          createdAt: savedMessage.createdAt,
        };
  
        // Diffuser le message à tous les clients connectés
        this.server.emit('newMessage', message);
  
      } catch (error) {
        this.logger.error('Erreur lors de la sauvegarde du message:', error);
        client.emit('messageError', 'Erreur lors de l\'envoi du message');
      }
    }
  
    @SubscribeMessage('typing')
    handleTyping(
      @MessageBody() data: { isTyping: boolean },
      @ConnectedSocket() client: Socket,
    ) {
      if (!client.data.user) return;
  
      client.broadcast.emit('userTyping', {
        user: client.data.user,
        isTyping: data.isTyping,
      });
    }
  
    @SubscribeMessage('loadMoreMessages')
    async handleLoadMoreMessages(
      @MessageBody() data: { before: string },
      @ConnectedSocket() client: Socket,
    ) {
      try {
        const messages = await this.getMessagesBefore(new Date(data.before));
        client.emit('moreMessages', messages);
      } catch (error) {
        this.logger.error('Erreur lors du chargement des messages:', error);
      }
    }
  
    private async getRecentMessages(limit = 50): Promise<Message[]> {
      const messages = await this.prisma.message.findMany({
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              userId: true,
              username: true,
              color: true,
            }
          }
        }
      });
  
      return messages.reverse().map(msg => ({
        messageId: msg.messageId,
        user: msg.user,
        content: msg.content,
        createdAt: msg.createdAt,
      }));
    }
  
    private async getMessagesBefore(before: Date, limit = 20): Promise<Message[]> {
      const messages = await this.prisma.message.findMany({
        take: limit,
        where: {
          createdAt: { lt: before }
        },
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              userId: true,
              username: true,
              color: true,
            }
          }
        }
      });
  
      return messages.reverse().map(msg => ({
        messageId: msg.messageId,
        user: msg.user,
        content: msg.content,
        createdAt: msg.createdAt,
      }));
    }
  }