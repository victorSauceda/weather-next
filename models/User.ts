'use client';
import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  image: string;
  favoriteCities: Array<mongoose.Schema.Types.ObjectId>; // Reference to City model
}

const UserSchema: Schema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  image: { type: String },
  favoriteCities: [{ type: mongoose.Schema.Types.ObjectId, ref: 'City' }],
});

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
