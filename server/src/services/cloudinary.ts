import cloudinary from "../config/cloudinary.js";

export async function uploadImage(buffer: Buffer) {
  return new Promise<{ url: string; publicId: string }>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: process.env.CLOUDINARY_UPLOAD_FOLDER,
      },
      (error, result) => {
        if (error || !result) return reject(error);

        resolve({
          url: result.secure_url,
          publicId: result.public_id,
        });
      }
    );

    stream.end(buffer);
  });
}

export async function deleteImage(publicId: string) {
  return cloudinary.uploader.destroy(publicId);
}

export async function deleteImages(publicIds: string[]) {
  if (publicIds.length === 0) return;
  return cloudinary.api.delete_resources(publicIds);
}