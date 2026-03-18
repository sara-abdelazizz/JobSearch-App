import multer from "multer";
import { imageMimeTypes } from "../enums/user.enums";

export const cloudFileUploadMulter = () => {
  const storage = multer.memoryStorage();

  const fileFilter = (req, file, cb) => {
    if (imageMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type"), false);
    }
  };

  return multer({ storage, fileFilter });
};
