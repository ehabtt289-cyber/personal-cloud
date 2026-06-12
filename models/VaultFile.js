import mongoose from "mongoose";

const vaultFileSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    url: { type: String, required: true },
    publicId: { type: String, required: true },
    format: { type: String },
    size: { type: Number },
    tags: [{ type: String }],
    mimeType: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model("VaultFile", vaultFileSchema);
