import {
  Controller,
  Post,
  Get,
  Body,
  Req,
  Res,
  UseGuards,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Role } from '../common/role.enum';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard('jwt'))
  async logout(@Req() req: Request) {
    const userId = (req.user as any).id;
    return this.authService.logout(userId);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Body() { refreshToken }: { refreshToken: string }) {
    return this.authService.refreshToken(refreshToken);
  }

  @Get('profile')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard('jwt'))
  async getProfile(@Req() req: Request) {
    const userId = (req.user as any).id;
    return this.authService.getProfile(userId);
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth(@Query('role') role: string) {}

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleCallback(@Req() req: Request, @Res() res: Response) {
    const result = await this.authService.googleLogin(req.user as any);

    if (result.isNewUser) {
      return res.redirect(
        `http://localhost:3000/complete-profile?token=${result.accessToken}&role=${result.role}`,
      );
    }

    return res.redirect(
      `http://localhost:3000/login-success?token=${result.accessToken}`,
    );
  }

  @Post('google/mobile')
  @HttpCode(HttpStatus.OK)
  async googleMobileAuth(
    @Body('idToken') idToken: string,
    @Body('platform') platform: 'android' | 'ios',
    @Body('role') role: Role,
  ) {
    return this.authService.googleMobileLogin(idToken, platform, role);
  }

  @Post('complete-profile')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard('jwt'))
  async completeProfile(@Req() req: Request, @Body() body: any) {
    const userId = (req.user as any).id;
    return this.authService.completeProfile(userId, body);
  }
}