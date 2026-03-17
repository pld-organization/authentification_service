import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { SessionService } from '../session/session.service';
import { UsersService } from '../users/users.service';
import { JwtPayload } from '../common/jwt-payload.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {

  constructor(
    private readonly configService: ConfigService,
    private readonly sessionService: SessionService,
    private readonly usersService: UsersService,
  ) {
    const jwtSecret = configService.get<string>('jwt.secret');
    if (!jwtSecret) {
      throw new Error('JWT secret is not defined in .env');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtSecret,
    });
  }

  async validate(payload: JwtPayload) {
    
    const userId = (payload.sub ?? payload.id)?.toString();

    if (!userId) {
      throw new UnauthorizedException('Token invalide');
    }

    const sessionExists = await this.sessionService.sessionExists(userId);
    if (!sessionExists) {
      throw new UnauthorizedException('Session expirée, reconnectez-vous');
    }

    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new UnauthorizedException('Utilisateur introuvable');
    }

    return {
      id: user.id,
      email: user.email,
      role: user.role,
    };
  }
}