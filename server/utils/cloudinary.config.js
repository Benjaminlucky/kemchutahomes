// utils/cloudinary.config.js
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "dyzddoekw",
  api_key: process.env.CLOUDINARY_API_KEY || "782416744767778",
  api_secret:
    process.env.CLOUDINARY_API_SECRET || "0GvIBCC88_VX_7x2erDXxMLO5F4",
  secure: true,
});

export default cloudinary;
