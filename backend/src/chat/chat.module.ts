import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { JwtModule } from '@nestjs/jwt';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-secret-your-secret-',
      signOptions: { expiresIn: '24h' },
    }),
    PrismaModule,
  ],
  providers: [ChatGateway],
})
export class ChatModule {}