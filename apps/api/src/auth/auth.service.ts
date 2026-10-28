import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { RegisterInput, LoginInput } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async register(input: RegisterInput) {
    const existing = await this.usersService.findByEmail(input.email);
    if (existing) {
      throw new ConflictException('Email already exists');
    }

    const passwordHash = await bcrypt.hash(input.password, 10);
    const user = await this.usersService.create({
      email: input.email,
      passwordHash,
      firstName: input.firstName,
      lastName: input.lastName,
      phone: input.phone,
    });

    const accessToken = this.generateToken(user._id.toString());

    return {
      accessToken,
      user: {
        id: user._id.toString(),
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        role: user.role,
        status: user.status,
        permissions: Array.isArray((user as any).permissions)
          ? (user as any).permissions
          : [],
      },
    };
  }

  async login(input: LoginInput) {
    console.log('LOGIN ATTEMPT:', input.email);
    const user = await this.usersService.findByEmail(input.email);
    if (!user) {
      console.log('USER NOT FOUND');
      throw new UnauthorizedException('Invalid credentials');
    }

    const isValid = await bcrypt.compare(input.password, user.passwordHash);
    console.log('PASSWORD VALID:', isValid);
    if (!isValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.status !== 'active') {
      throw new UnauthorizedException('Account is not active');
    }

    await this.usersService.updateLastLogin(user._id.toString());
    const accessToken = this.generateToken(user._id.toString());

    return {
      accessToken,
      user: {
        id: user._id.toString(),
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        role: user.role,
        status: user.status,
        permissions: Array.isArray((user as any).permissions)
          ? (user as any).permissions
          : [],
      },
    };
  }

  private generateToken(userId: string) {
    return this.jwtService.sign({ sub: userId });
  }
}
