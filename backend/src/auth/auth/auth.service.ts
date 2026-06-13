import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare } from 'bcryptjs';

import { Role as UserRole } from '../../generated/prisma/enums';
import { UsersService } from '../../users/users/users.service';
import { LoginDto } from './dto/login.dto';
import { Role } from '../enums/role.enum';
import { JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);

    if (!user) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    const passwordMatches = await compare(dto.password, user.passwordHash);

    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    const role = user.role === UserRole.ADMIN ? Role.ADMIN : Role.USER;

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role,
    };

    const token = await this.jwtService.signAsync(payload);

    return {
      token,
      user: {
        email: user.email,
        role,
      },
    };
  }
}
