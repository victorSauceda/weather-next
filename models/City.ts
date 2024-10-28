import mongoose, { Schema, Document, Model } from 'mongoose';

// Define the ICity interface that extends the mongoose Document interface
// This interface represents the structure of a City document in MongoDB
export interface ICity extends Document {
  id: number; // Unique ID for the city
  name: string; // Name of the city
  state?: string; // Optional state (some cities may not have states)
  country: string; // Country where the city is located
  coord: {
    lon: number; // Longitude coordinate of the city
    lat: number; // Latitude coordinate of the city
  };
}

// Create the CitySchema schema for the City model
// This schema defines the structure of city documents in the database
const CitySchema: Schema<ICity> = new Schema({
  id: { type: Number, required: true }, // Unique identifier for the city, required
  name: { type: String, required: true }, // Name of the city, required
  state: { type: String }, // Optional state, can be null or undefined
  country: { type: String, required: true }, // Country where the city is located, required
  coord: {
    lon: { type: Number, required: true }, // Longitude of the city, required
    lat: { type: Number, required: true }, // Latitude of the city, required
  },
});

// Create or retrieve the City model from Mongoose
// If the model is already registered, it will use the existing model (mongoose.models.City),
// otherwise, it creates a new model using the CitySchema
const City: Model<ICity> = mongoose.models.City || mongoose.model<ICity>('City', CitySchema);

// Export the City model to be used in other parts of the application
export default City;
