import  express  from "express";
import Post from "../models/Posts.js";
import { authMiddleware } from "../middleware/Auth.js";
import cloudinary from "../utils/cloudinary.js";

const router = express.Router();



router.post("/",authMiddleware, async (req, res) =>{
  try{
    
    const {text, image} = req.body;
    let imageUrl = null;
    if(image){
      const result = await cloudinary.uploader.upload(image, {
        folder: "posts",
        
      });

      imageUrl = result.secure_url;
    }
    const post = new Post({
      user: req.user._id,
      text,
      image: imageUrl
    });
    await post.save();                        
    res.status(201).json(post)
  }catch(err){
    res.status(500).json(err)
  }
})


router.get("/", async (req, res) =>{
  try{
    const posts = await Post.find().populate("user", "name avatar").sort({createdAt:-1});
    res.status(200).json(posts)
  }catch(err){
    res.status(500).json(err)
  }
})










export default router