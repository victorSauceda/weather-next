// import mongoose, { Schema, Document, model, models, Types } from 'mongoose';

// // Define the IUser interface extending mongoose.Document
// export interface IUser extends Document {
//   name?: string;
//   email: string;
//   password: string;
//   image?: string;
//   favoriteCities: Types.ObjectId[];
//   emailVerified: boolean;
//   token?: string;
//   tokenExpiry?: Date;
// }

// // Define the User schema
// export const UserSchema: Schema<IUser> = new Schema({
//   name: { type: String },
//   email: { type: String, required: true, unique: true },
//   password: { type: String, required: true },
//   image: { type: String },
//   favoriteCities: [{ type: mongoose.Schema.Types.ObjectId, ref: 'City' }],
//   emailVerified: { type: Boolean, default: false },
//   token: { type: String, default: null },
//   tokenExpiry: { type: Date, default: null },
// });

// // Export the User model, handling the case where the model is already compiled
// const User = models.User || model<IUser>('User', UserSchema);
// export default User;
import mongoose, { Document, Schema, Types } from 'mongoose';
import { ICity } from './City'; // Assuming City is defined in another file

export interface IUser extends Document {
  email: string;
  name: string;
  image: string;
  favoriteCities: ICity[]; // This allows both unpopulated and populated states
}

const UserSchema: Schema<IUser> = new Schema({
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  image: { type: String },
  favoriteCities: [{ type: mongoose.Schema.Types.ObjectId, ref: 'City' }],
});

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
