import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { OAuth2Client } from 'google-auth-library';
import { UsersService } from '../users/users.service';
import { SessionService } from '../session/session.service';
import { comparePassword } from '../common/hash.util';
import { Role } from '../common/role.enum';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  private readonly webClient: OAuth2Client;
  private readonly androidClient: OAuth2Client;

  constructor(
    private readonly usersService: UsersService,
    private readonly sessionService: SessionService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    this.webClient = new OAuth2Client(
      this.configService.get<string>('GOOGLE_CLIENT_ID'),
    );

    this.androidClient = new OAuth2Client(
      this.configService.get<string>('ANDROID_GOOGLE_CLIENT_ID'),
    );
  }

  async register(dto: RegisterDto) {
    const existingUser = await this.usersService.findByEmail(dto.email);
    if (existingUser) {
      throw new ConflictException('Email déjà utilisé');
    }

    let user;
    if (dto.role === Role.PATIENT) {
      user = await this.usersService.createPatient({
        email: dto.email,
        password: dto.password,
        firstName: dto.firstName!,
        lastName: dto.lastName!,
        phoneNumber: dto.phoneNumber,
        bloodType: dto.bloodType,
        gender: dto.gender,
      });
    } else if (dto.role === Role.DOCTOR) {
      user = await this.usersService.createDoctor({
        email: dto.email,
        password: dto.password,
        firstName: dto.firstName!,
        lastName: dto.lastName!,
        speciality: dto.speciality!,
        establishment: dto.establishment,
      });
    } else {
      throw new BadRequestException('Rôle invalide');
    }

    const tokens = await this.generateTokens(user.id, user.email, user.role);

    await this.sessionService.createSession(user.id, {
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      message: 'Inscription réussie',
      ...tokens,
    };
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException('Email ou mot de passe incorrect');
    }

    const isPasswordValid = await comparePassword(dto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Email ou mot de passe incorrect');
    }

    const tokens = await this.generateTokens(user.id, user.email, user.role);

    await this.sessionService.createSession(user.id, {
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      message: 'Connexion réussie',
      ...tokens,
    };
  }

  async logout(userId: string) {
    await this.sessionService.deleteSession(userId);
    return { message: 'Déconnexion réussie' };
  }

  async getProfile(userId: string) {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new UnauthorizedException('Utilisateur introuvable');
    }

    const profile: any = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      createdAt: user.createdAt,
    };

    if (user.role === Role.PATIENT && user.patient) {
      profile.patient = {
        dateOfBirth: user.patient.dateOfBirth,
        phoneNumber: user.patient.phoneNumber,
        bloodType: user.patient.bloodType,
        gender: user.patient.gender,
      };
    }

    if (user.role === Role.DOCTOR && user.doctor) {
      profile.doctor = {
        speciality: user.doctor.speciality,
        establishment: user.doctor.establishment,
      };
    }

    return profile;
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('jwt.refreshSecret'),
      });

      const sessionExists = await this.sessionService.sessionExists(payload.id);
      if (!sessionExists) {
        throw new UnauthorizedException('Session expirée');
      }

      const tokens = await this.generateTokens(
        payload.id,
        payload.email,
        payload.role,
      );

      return {
        message: 'Token rafraîchi',
        ...tokens,
      };
    } catch {
      throw new UnauthorizedException('Refresh token invalide');
    }
  }

  async googleLogin(googleUser: {
    email: string;
    googleId: string;
    firstName?: string;
    lastName?: string;
    role?: Role;
  }) {
    let user = await this.usersService.findByGoogleId(googleUser.googleId);
    let isNewUser = false;

    if (!user) {
      user = await this.usersService.createGoogleUser({
        email: googleUser.email,
        googleId: googleUser.googleId,
        firstName: googleUser.firstName || '',
        lastName: googleUser.lastName || '',
        role: (googleUser.role as Role) || Role.PATIENT,
      });
      isNewUser = true;
    }

    const tokens = await this.generateTokens(user.id, user.email, user.role);

    await this.sessionService.createSession(user.id, {
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      isNewUser,
      role: user.role,
      ...tokens,
    };
  }

  async googleMobileLogin(
    idToken: string,
    platform: 'android' | 'ios',
    role?: Role,
  ) {
    try {
      const client =
        platform === 'android' ? this.androidClient : this.webClient;

      const clientId =
        platform === 'android'
          ? this.configService.get<string>('ANDROID_GOOGLE_CLIENT_ID')
          : this.configService.get<string>('GOOGLE_CLIENT_ID');

      const ticket = await client.verifyIdToken({
        idToken,
        audience: clientId,
      });

      const payload = ticket.getPayload();
      if (!payload?.email) {
        throw new UnauthorizedException('Token Google invalide');
      }

      let user = await this.usersService.findByGoogleId(payload.sub);
      let isNewUser = false;

      if (!user) {
        user = await this.usersService.createGoogleUser({
          email: payload.email,
          googleId: payload.sub,
          firstName: payload.given_name || '',
          lastName: payload.family_name || '',
          role: role || Role.PATIENT,
        });
        isNewUser = true;
      }

      const tokens = await this.generateTokens(user.id, user.email, user.role);

      await this.sessionService.createSession(user.id, {
        userId: user.id,
        email: user.email,
        role: user.role,
      });

      return {
        isNewUser,
        role: user.role,
        ...tokens,
      };
    } catch {
      throw new UnauthorizedException('Authentification Google échouée');
    }
  }

  async completeProfile(userId: string, data: any) {
    const user = await this.usersService.findById(userId);

    if (user!.role === Role.PATIENT) {
      await this.usersService.updatePatientProfile(userId, data);
    } else if (user!.role === Role.DOCTOR) {
      await this.usersService.updateDoctorProfile(userId, data);
    }

    return { message: 'Profil complété avec succès' };
  }

  private async generateTokens(id: string, email: string, role: string) {
    const payload = { id, email, role };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('jwt.secret'),
      expiresIn: (this.configService.get<string>('jwt.expiresIn') ?? '15m') as any,
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('jwt.refreshSecret'),
      expiresIn: (this.configService.get<string>('jwt.refreshExpiresIn') ?? '7d') as any,
    });

    return { accessToken, refreshToken };
  }
}