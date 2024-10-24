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
