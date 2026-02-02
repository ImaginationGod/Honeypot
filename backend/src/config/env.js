import dotenv from "dotenv";
dotenv.config();

export const PORT = process.env.PORT || 4000;
export const MONGO_URI = process.env.MONGO_URI;
export const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
export const API_KEY = process.env.API_KEY;
