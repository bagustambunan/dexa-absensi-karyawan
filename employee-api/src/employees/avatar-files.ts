import { NotFoundException, StreamableFile } from '@nestjs/common';
import { open } from 'node:fs/promises';
import { basename, extname, join, resolve } from 'node:path';

export const uploadDirectory = () => resolve(process.env.UPLOAD_DIR || 'uploads');
export const avatarUrl = (path: string) => `/uploads/${encodeURIComponent(basename(path))}`;

export async function readAvatarFile(fileName: string) {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\.(jpg|png|webp)$/.test(fileName)) {
    throw new NotFoundException('Foto tidak tersedia');
  }
  try {
    const file = await open(join(uploadDirectory(), fileName), 'r');
    return new StreamableFile(file.createReadStream(), {
      type: extname(fileName) === '.jpg' ? 'image/jpeg' : `image/${extname(fileName).slice(1)}`,
    });
  } catch {
    throw new NotFoundException('Foto tidak tersedia');
  }
}
