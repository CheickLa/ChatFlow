import { Controller, Get, Patch, Body, UseGuards, Request, BadRequestException } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UsersService } from './users.service';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('profile')
  async getProfile(@Request() req) {
    return this.usersService.getUserProfile(req.user.sub);
  }

  @Patch('color')
  async updateColor(
    @Request() req,
    @Body() updateColorDto: { color: string }
  ) {
    // Validation basique de la couleur hex
    const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    if (!hexColorRegex.test(updateColorDto.color)) {
      throw new BadRequestException('Format de couleur invalide. Utilisez le format hex (#RRGGBB)');
    }

    return this.usersService.updateUserColor(req.user.sub, updateColorDto.color);
  }
}