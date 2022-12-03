import { v4 as uuid } from 'uuid';
import { Request } from "express";

export const fileNamer = (req: Request, file: Express.Multer.File, cb: Function) => {
  if(!file) {
    return cb(new Error('file is empty'), false);
  }
  const fileExtension = file.mimetype.split('/')[1];
  const fileName = `${uuid()}.${fileExtension}`;
  cb(null, fileName)
}