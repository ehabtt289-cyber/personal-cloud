import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name:{
    type: String,
    required: true,
  },
  email:{
    type: String,
    required: true,
    unique: true,
  },
  password:{
    type: String,
    required: true,
  },
  avatar:{
    type: String,
    default: "https://www.w3schools.com/howto/img_avatar.png",
  }
  
  
});

export default mongoose.model("User", userSchema);
