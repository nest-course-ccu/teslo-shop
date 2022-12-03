import { Injectable, BadRequestException } from '@nestjs/common';
import { existsSync } from 'fs';
import { join } from 'path';

@Injectable()
export class FilesService {

  getStaticProductImage(imageName: string) {
    console.log(imageName)
    const path = join(__dirname, '../../static/uploads', imageName);
    console.log(path)
    if(!existsSync(path)) {
      throw new BadRequestException('No product found with image')
    }
    return path;
  }
}
