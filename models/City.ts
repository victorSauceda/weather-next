import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICity extends Document {
  id: number;
  name: string;
  state?: string;
  country: string;
  coord: {
    lon: number;
    lat: number;
  };
}

const CitySchema: Schema<ICity> = new Schema({
  id: { type: Number, required: true },
  name: { type: String, required: true },
  state: { type: String },
  country: { type: String, required: true },
  coord: {
    lon: { type: Number, required: true },
    lat: { type: Number, required: true },
  },
});

const City: Model<ICity> = mongoose.models.City || mongoose.model<ICity>('City', CitySchema);

export default City;
