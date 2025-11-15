import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// console.log("Cloudinary Config Loaded:", {
//   cloud_name: cloudinary.config().cloud_name,
//   api_key: cloudinary.config().api_key,
//   // DO NOT log api_secret in production
// });

export default cloudinary;
