import { Request } from "express";

export const fileFilter = (req: Request, file: Express.Multer.File, cb: Function) => {
  if(!file) {
    return cb(new Error('file is empty'), false);
  }
  const extension = file.mimetype.split('/')[1];
  const validExtensions = ['jpg', 'jpeg', 'png', 'gif']

  if(validExtensions.includes(extension)) {
    return cb(null, true);
  }

  cb(null, false)
}