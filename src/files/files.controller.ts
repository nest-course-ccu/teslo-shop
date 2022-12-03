import { BadRequestException, Controller, Get, Param, Post, UploadedFile, UseInterceptors, Patch, Res } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { diskStorage } from 'multer';
import { FilesService } from './files.service';
import { fileNamer, fileFilter } from './helpers';

@Controller('files')
export class FilesController {
  Patc
  constructor(
    private readonly filesService: FilesService,
    private readonly configService: ConfigService
  ) {}

  @Get('products/:imageName')
  findProductImage(
    @Res() res: Response,
    @Param(`imageName`) imageName: string
  ) {
    const path = this.filesService.getStaticProductImage(imageName);
    res.sendFile(path);
  }

  @Post('products/upload')
  @UseInterceptors(FileInterceptor('file', {
    fileFilter: fileFilter,
    //limits: { fileSize: 1000 },
    storage: diskStorage({
      destination: './static/uploads',
      filename: fileNamer
    })
  }))
  uploadFile(
    @UploadedFile() file: Express.Multer.File
  ) {
    if(!file) {
      throw new BadRequestException('Make sure the file is image');
    }
    const secureUrl = `${this.configService.get('HOST_API')}/files/products/${file.filename}`
    return {
      secureUrl
    };
  }

}
