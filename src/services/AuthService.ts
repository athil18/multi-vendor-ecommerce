/**
 * Authentication & Identity Service
 * 
 * @agent engineering-identity-access-engineer
 * @agent engineering-backend-architect
 * @agent security-appsec-engineer
 */

import bcrypt from 'bcryptjs';
import { IUserRepository, UserEntity } from '@/core/ports/IUserRepository';
import { prismaUserRepository } from '@/infrastructure/database/repositories/PrismaUserRepository';
import { generateToken, generateRefreshToken, verifyRefreshToken } from '@/lib/jwt';
import { AppError } from '@/lib/errors';
import { sanitizeObject } from '@/lib/pii';

export interface RegisterDTO {
  name: string;
  email: string;
  password: string;
  role?: 'customer' | 'seller';
}

export interface LoginDTO {
  email: string;
  password: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

export class AuthService {
  constructor(private userRepo: IUserRepository = prismaUserRepository) {}

  async register(dto: RegisterDTO): Promise<AuthTokens> {
    const existing = await this.userRepo.findByEmail(dto.email);
    if (existing) {
      throw new AppError('Email address already registered', 409, 'AUTH_USER_EXISTS');
    }

    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(dto.password, salt);

    const user = await this.userRepo.create({
      name: dto.name,
      email: dto.email,
      password: hashedPassword,
      role: dto.role || 'customer',
      status: 'active',
    });

    const accessToken = generateToken({ id: user.id, email: user.email, role: user.role });
    const refreshToken = generateRefreshToken({ id: user.id, email: user.email, role: user.role });

    await this.userRepo.updateRefreshTokens(user.id, [refreshToken]);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }

  async login(dto: LoginDTO): Promise<AuthTokens> {
    const user = await this.userRepo.findByEmail(dto.email);
    if (!user || !user.password) {
      throw new AppError('Invalid email or password', 401, 'AUTH_INVALID_CREDENTIALS');
    }

    if (user.status === 'suspended') {
      throw new AppError('Account has been suspended. Please contact support.', 403, 'AUTH_ACCOUNT_SUSPENDED');
    }

    const isMatch = await bcrypt.compare(dto.password, user.password);
    if (!isMatch) {
      throw new AppError('Invalid email or password', 401, 'AUTH_INVALID_CREDENTIALS');
    }

    const accessToken = generateToken({ id: user.id, email: user.email, role: user.role });
    const refreshToken = generateRefreshToken({ id: user.id, email: user.email, role: user.role });

    // Rotate refresh token
    const existingTokens = (user.refreshTokens || []).slice(-4);
    existingTokens.push(refreshToken);
    await this.userRepo.updateRefreshTokens(user.id, existingTokens);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }

  async refreshToken(token: string): Promise<{ accessToken: string; refreshToken: string }> {
    const payload = verifyRefreshToken(token);
    if (!payload || !payload.id) {
      throw new AppError('Invalid or expired refresh token', 401, 'AUTH_TOKEN_EXPIRED');
    }

    const user = await this.userRepo.findById(payload.id);
    if (!user || !user.refreshTokens?.includes(token)) {
      throw new AppError('Refresh token revoked or invalid', 401, 'AUTH_TOKEN_REVOKED');
    }

    const newAccessToken = generateToken({ id: user.id, email: user.email, role: user.role });
    const newRefreshToken = generateRefreshToken({ id: user.id, email: user.email, role: user.role });

    const updatedTokens = user.refreshTokens.filter((t) => t !== token);
    updatedTokens.push(newRefreshToken);
    await this.userRepo.updateRefreshTokens(user.id, updatedTokens);

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }
}

export const authService = new AuthService();
