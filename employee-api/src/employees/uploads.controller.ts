import { Controller, Get, Header, Param } from '@nestjs/common';
import { readAvatarFile } from './avatar-files.ts';

@Controller('uploads')
export class UploadsController {
  @Get(':fileName')
  @Header('X-Content-Type-Options', 'nosniff')
  file(@Param('fileName') fileName: string) {
    return readAvatarFile(fileName);
  }
}
