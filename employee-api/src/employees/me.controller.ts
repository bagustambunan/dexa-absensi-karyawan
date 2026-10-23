import {
  BadRequestException,
  Body,
  Controller,
  Get,
  FileTypeValidator,
  HttpCode,
  HttpStatus,
  Inject,
  NotFoundException,
  Patch,
  ParseFilePipe,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FileInterceptor } from '@nestjs/platform-express';
import { mkdir, unlink, writeFile } from 'node:fs/promises';
import { basename, join } from 'node:path';
import { randomUUID } from 'node:crypto';
import { Repository } from 'typeorm';
import { JwtAuthGuard, Roles, type AuthenticatedRequest } from '../auth/jwt-auth.guard.ts';
import { Employee } from './employee.entity.ts';
import { ProfileChangesService } from './profile-changes.service.ts';
import { avatarUrl, readAvatarFile, uploadDirectory } from './avatar-files.ts';

@Controller('me')
@UseGuards(JwtAuthGuard)
@Roles('EMPLOYEE')
export class MeController {
  constructor(
    @InjectRepository(Employee)
    private readonly employees: Repository<Employee>,
    @Inject(ProfileChangesService)
    private readonly profileChanges: ProfileChangesService,
  ) {}

  private async activeEmployee(id: string) {
    const employee = await this.employees.findOne({
      where: { id, role: 'EMPLOYEE', isActive: true },
      select: {
        id: true, fullName: true, email: true, position: true,
        phone: true, avatarPath: true,
      },
    });
    if (!employee) throw new UnauthorizedException('Akun tidak aktif atau tidak tersedia');
    return employee;
  }

  @Get()
  async me(@Req() request: AuthenticatedRequest) {
    const employee = await this.activeEmployee(request.user.sub);
    return {
      id: employee.id,
      fullName: employee.fullName,
      email: employee.email,
      position: employee.position,
      phone: employee.phone,
      avatarUrl: employee.avatarPath ? avatarUrl(employee.avatarPath) : null,
    };
  }

  @Patch('phone')
  async updatePhone(@Req() request: AuthenticatedRequest, @Body() body: unknown) {
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      throw new BadRequestException('Data nomor HP tidak valid');
    }
    const input = body as Record<string, unknown>;
    if (
      Object.keys(input).some((key) => key !== 'phone') ||
      typeof input.phone !== 'string' ||
      !/^\+?[0-9]{8,15}$/.test(input.phone.trim())
    ) {
      throw new BadRequestException('phone wajib berisi 8–15 digit, boleh diawali +');
    }
    await this.profileChanges.update(
      request.user.sub,
      { phone: input.phone.trim() },
      'EMPLOYEE',
      { requireActive: true },
    );
    return this.me(request);
  }

  @Patch('password')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updatePassword(
    @Req() request: AuthenticatedRequest,
    @Body() body: unknown,
  ): Promise<void> {
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      throw new BadRequestException('Data password tidak valid');
    }
    const input = body as Record<string, unknown>;
    if (
      Object.keys(input).some((key) => key !== 'currentPassword' && key !== 'newPassword') ||
      typeof input.currentPassword !== 'string' ||
      !input.currentPassword ||
      Buffer.byteLength(input.currentPassword, 'utf8') > 72 ||
      typeof input.newPassword !== 'string'
    ) {
      throw new BadRequestException('currentPassword dan newPassword wajib diisi, maksimal 72 byte');
    }
    await this.profileChanges.update(
      request.user.sub,
      { password: input.newPassword },
      'EMPLOYEE',
      { requireActive: true, currentPassword: input.currentPassword },
    );
  }

  @Post('avatar')
  @UseInterceptors(FileInterceptor('file', {
    limits: { fileSize: 2 * 1024 * 1024, files: 1, fields: 0 },
  }))
  async uploadAvatar(
    @Req() request: AuthenticatedRequest,
    @UploadedFile(new ParseFilePipe({
      validators: [new FileTypeValidator({
        fileType: /^image\/(jpeg|png|webp)$/,
        overrideMimeType: true,
        errorMessage: 'File harus berisi gambar JPEG, PNG, atau WebP',
      })],
    })) file: { buffer: Buffer; mimetype: string },
  ) {
    await this.activeEmployee(request.user.sub);
    const extension = file.mimetype === 'image/jpeg' ? 'jpg' : file.mimetype.slice(6);
    const fileName = `${randomUUID()}.${extension}`;
    const directory = uploadDirectory();
    await mkdir(directory, { recursive: true });
    const path = join(directory, fileName);
    await writeFile(path, file.buffer, { flag: 'wx' });
    try {
      await this.profileChanges.update(
        request.user.sub,
        { avatarPath: fileName },
        'EMPLOYEE',
        { requireActive: true },
      );
    } catch (error) {
      await unlink(path);
      throw error;
    }
    return { avatarUrl: avatarUrl(fileName) };
  }

  @Get('avatar')
  async avatar(@Req() request: AuthenticatedRequest) {
    const employee = await this.activeEmployee(request.user.sub);
    if (!employee.avatarPath) throw new NotFoundException('Foto tidak tersedia');
    return readAvatarFile(basename(employee.avatarPath));
  }
}
