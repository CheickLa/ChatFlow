import { Body, Controller, Post } from '@nestjs/common';
import { SignupDto } from './dto/SignupDto';
import { SignInDto } from './dto/SignInDto';

import { AuthService } from './auth.service';
import { ApiTags } from '@nestjs/swagger';
@ApiTags()
@Controller('auth')
export class AuthController {
    constructor (private readonly authService : AuthService) {}

    // Inscription
    @Post("signup")
    signup(@Body() signupDto: SignupDto) {
        return this.authService.signup(signupDto)
    }

    // Connexion
    @Post('signin')
    signin(@Body() signInDto: SignInDto) {
        return this.authService.signIn(signInDto)
    }
}
