import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { ChatModule } from './chat/chat.module';
import { UsersModule } from './users/users.module';
@Module({
  imports: [ConfigModule.forRoot({isGlobal : true}), AuthModule, PrismaModule, ChatModule, UsersModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
