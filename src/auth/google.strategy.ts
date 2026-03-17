import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';
import { Role } from '../common/role.enum';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private readonly configService: ConfigService) {
    super({
      clientID: configService.get<string>('GOOGLE_CLIENT_ID')!,
      clientSecret: configService.get<string>('GOOGLE_CLIENT_SECRET')!,
      callbackURL: configService.get<string>('GOOGLE_CALLBACK_URL'),
      scope: ['email', 'profile'],
      passReqToCallback: true,
      
    });
  }

  
  authenticate(req: any, options?: any) {
  let role = req.query?.role ?? Role.PATIENT;
  
  if (typeof role === 'string') {
    role = role.replace(/^"|"$/g, '').trim();
  }
  
  if (!Object.values(Role).includes(role)) {
    role = Role.PATIENT;
  }

  const state = Buffer.from(JSON.stringify({ role })).toString('base64');
  super.authenticate(req, { ...options, state });
}

  async validate(
    req: any,
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ) {
    const { id, emails, name } = profile;

    let role = Role.DOCTOR;
      console.log('=== GOOGLE CALLBACK ===');
  console.log('req.query:', req.query);
  console.log('req.query.state:', req.query.state);

    try {
      const rawState = req.query.state;
      if (rawState) {
        const decoded = JSON.parse(Buffer.from(rawState, 'base64').toString());
        if (decoded.role && Object.values(Role).includes(decoded.role)) {
          role = decoded.role;
        }
      }
    } catch {
      role = Role.PATIENT;
    }

    const user = {
      googleId: id,
      email: emails[0].value,
      firstName: name?.givenName || '',
      lastName: name?.familyName || '',
      role,
    };

    done(null, user);
  }
}