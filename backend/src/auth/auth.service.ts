import { ConflictException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { SignupDto } from './dto/SignupDto';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'src/prisma/prisma.service';
import { SignInDto } from './dto/SignInDto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
    constructor(
        private readonly prismaService: PrismaService,
        private readonly JwtService : JwtService,
        private readonly configService : ConfigService,
    ) {}

    // Inscription
      async signup(signupDto: SignupDto) {
        // Vérifier si l'utilisateur existe déjà
        const {email, password, username} = signupDto

        const user = await this.prismaService.user.findUnique({ where : { email }});

        if (user) throw new ConflictException('User already exist');

        // Hasher le mot de passe
        const hash = await bcrypt.hash(password, 10);
        
        // Enregistrer l'utilisateur dans la base de données
        await this.prismaService.user.create({
            data: {email, username, password : hash }
        })

        // Retourner une réponse de succès
        return {data : 'User successfuly created'}
    }

    // Connexion
    async signIn(signInDto: SignInDto) {
        // ** Récuprère l'user
        const {email, password} = signInDto
        const user = await this.prismaService.user.findUnique({ where : { email }})

        // ** Vérifie si il existe
        if(!user) throw new NotFoundException('User not found');

        // ** Compare le hash
        const match = await bcrypt.compare(password, user.password);
        if(!match) throw new UnauthorizedException("Password does not match");

        // ** Si l'utilisateur est confirmé on génère le jwt
        const payload = {
            sub: user.userId,
            email: user.email
        }

        const token = this.JwtService.sign(payload, { 
            expiresIn: "2h",
            secret: this.configService.get('SECRET_KEY'),
        })

        return {
            message : `Bienvenu M. ${user.username}`,
            token, 
            user : {
                username: user.username,
                email: user.email,
            }
        }
    }
}
