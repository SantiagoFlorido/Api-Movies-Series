const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET
});

const uploadImage = async (filePath) => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: 'ApiMovies'
    });
    return result.secure_url;
  } catch (err) {
    console.error('Cloudinary upload failed:', err);
    throw err;
  }
};

module.exports = {
  uploadImage
};
