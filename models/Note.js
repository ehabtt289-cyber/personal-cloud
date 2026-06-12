import mongoose from "mongoose";

const noteSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, default: "Untitled" },
    content: { type: String, default: "" },
    tags: [{ type: String }],
    pinned: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("Note", noteSchema);
