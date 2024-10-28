import mongoose, { Document, Schema } from 'mongoose';
import { ICity } from './City'; // Import the ICity interface from the City model

// Define the IUser interface extending Mongoose's Document interface
export interface IUser extends Document {
  email: string; // Email of the user, required and unique
  name: string;  // Name of the user, required
  password?: string; // Password field
  image?: string; // Optional URL for the user's profile image
  favoriteCities: ICity[]; // Array of city references (ICity objects) or empty array by default
  emailVerified?: boolean;
  token?: string | null;
  tokenExpiry?: Date | null;
}

// Define the User schema
const UserSchema: Schema<IUser> = new Schema({
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  password: { type: String },
  image: { type: String, default: '' },
  favoriteCities: [{ type: mongoose.Schema.Types.ObjectId, ref: 'City', default: [] }], // Array of ObjectIds referencing City model, populated as ICity
  emailVerified: { type: Boolean, default: false },
  token: { type: String, default: null },
  tokenExpiry: { type: Date, default: null }
});

// Export the User model, checking if it's already registered in Mongoose
export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
