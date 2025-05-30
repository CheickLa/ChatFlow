import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private prismaService: PrismaService,
  ) {
    const secretKey = configService.get<string>('SECRET_KEY');
    if (!secretKey) {
      throw new Error('SECRET_KEY must be defined in environment variables');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secretKey,
    });
  }

  async validate(payload: any) { 
    const user = await this.prismaService.user.findUnique({
      where: { userId: payload.sub }
    });
    
    if (!user) {
      throw new UnauthorizedException('Utilisateur non trouvé');
    }
    
    return { 
      userId: payload.sub, 
      email: payload.email,
      sub: payload.sub 
    };
  }
}