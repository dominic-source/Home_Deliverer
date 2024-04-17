import mongoose from  "mongoose";
import { locationSchema } from "./location";

const { Schema } = mongoose;

const userSchema = new Schema({
  username: String,
  passwordHash: String,
  email: String,
  phoneNumber: String,
  createdAt: { type: Date, default: new Date().toString() },
  updatedAt: { type: Date, default: new Date().toString() },
  lgaId: { type: mongoose.Schema.Types.ObjectId, ref: 'Location' },
  vehicleNumber: String,
  userType: { enum: ['seller', 'buyer', 'dispatcher'], type: String },
  status: { type: String, enum: ['available', 'busy']},
  photo: String,
	address_seller: locationSchema,
	address_buyer: locationSchema,
	address_dispatcher: locationSchema
});

const User = mongoose.model('User', userSchema);
module.exports = User;
