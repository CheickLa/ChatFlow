import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
@Module({
  imports: [ConfigModule.forRoot({isGlobal : true}), AuthModule, PrismaModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
