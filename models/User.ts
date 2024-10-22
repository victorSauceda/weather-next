'use client';

import mongoose, { Schema, Document, model, models, Types } from 'mongoose';

// Define the IUser interface extending mongoose.Document
export interface IUser extends Document {
  name?: string;
  email: string;
  password: string;
  image?: string; // Optional field
  favoriteCities: Types.ObjectId[]; // Array of ObjectId referencing City model
  emailVerified: boolean; // Boolean to track if email is verified
  token?: string; // Token for magic link or email verification
  tokenExpiry?: Date; // Expiration date for the token
}

// Define the User schema
const UserSchema: Schema<IUser> = new Schema({
  name: { type: String},
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  image: { type: String }, // Optional field
  favoriteCities: [{ type: mongoose.Schema.Types.ObjectId, ref: 'City' }], // Reference to City model
  emailVerified: { type: Boolean, default: false }, // Defaults to false (user needs to verify email)
  token: { type: String, default: null }, // Token for magic link or verification
  tokenExpiry: { type: Date, default: null }, // Expiration time for the magic token
});

// Export the User model, handling the case where the model is already compiled
export default models.User || model<IUser>('User', UserSchema);
