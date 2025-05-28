import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async updateUserColor(userId: number, color: string) {
    return this.prisma.user.update({
      where: { userId },
      data: { color },
      select: {
        userId: true,
        username: true,
        email: true,
        color: true,
      }
    });
  }

  async getUserProfile(userId: number) {
    return this.prisma.user.findUnique({
      where: { userId },
      select: {
        userId: true,
        username: true,
        email: true,
        color: true,
        createdAt: true,
      }
    });
  }
}