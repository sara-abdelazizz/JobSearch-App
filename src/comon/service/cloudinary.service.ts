import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { v2 as cloudinary } from "cloudinary";
import { Readable } from "stream";

@Injectable()
export class CloudinaryService {
  constructor(private readonly configService: ConfigService) {
    cloudinary.config({
      cloud_name: this.configService.get<string>("CLOUD_NAME"),
      api_key: this.configService.get<string>("API_KEY"),
      api_secret: this.configService.get<string>("API_SECRET"),
    });
  }

  uploadToCloudinary(fileBuffer: Buffer, folder: string) {
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        },
      );

      Readable.from(fileBuffer).pipe(stream);
    });
  }

  async deleteFromCloudinary(publicId: string) {
    return await cloudinary.uploader.destroy(publicId);
  }
}