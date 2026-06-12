import mongoose from "mongoose";

const mediaSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    url: { type: String, required: true },
    publicId: { type: String, required: true },
    type: { type: String, enum: ["image", "video"], required: true },
    format: { type: String },
    size: { type: Number },
    tags: [{ type: String }],
    thumbnail: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model("Media", mediaSchema);
