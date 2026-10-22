import {
  BadRequestException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { compare } from 'bcrypt';
import { Repository } from 'typeorm';
import { Employee } from '../employees/employee.entity.ts';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Employee)
    private readonly employees: Repository<Employee>,
    @Inject(JwtService) private readonly jwt: JwtService,
  ) {}

  async login(body: unknown) {
    if (!body || typeof body !== 'object') {
      throw new BadRequestException('Email dan password wajib diisi');
    }
    const { email, password } = body as Record<string, unknown>;
    if (
      typeof email !== 'string' ||
      !email.trim() ||
      typeof password !== 'string' ||
      !password
    ) {
      throw new BadRequestException('Email dan password wajib diisi');
    }

    const employee = await this.employees.findOne({
      where: { email: email.trim().toLowerCase() },
      select: {
        id: true,
        fullName: true,
        role: true,
        isActive: true,
        passwordHash: true,
      },
    });
    if (
      !employee ||
      !employee.isActive ||
      !(await compare(password, employee.passwordHash))
    ) {
      throw new UnauthorizedException('Email atau password salah');
    }

    const accessToken = await this.jwt.signAsync({
      sub: employee.id,
      role: employee.role,
    });
    return {
      accessToken,
      user: {
        id: employee.id,
        fullName: employee.fullName,
        role: employee.role,
      },
    };
  }
}
