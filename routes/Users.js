import  express  from "express";
import User from "../models/User.js";
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken";

const router = express.Router();
router.post("/register", async (req, res) =>{
  try{
    const {name, email, password} = req.body;
    const hashedPassword = await bcrypt.hash(password, 10)
    const user = new User({name, email, password:hashedPassword});
    await user.save();

    const token = jwt.sign({userId:user._id}, process.env.JWT_SECRET,{expiresIn:"7d"})
    res.status(201).json({massage:"User created successfully", token, user:{id:user._id, name:user.name, email:user.email}})
  }catch(err){
    res.status(500).json(err)
  }
})

router.post("/login", async (req, res) =>{
  try{
    const {email, password} = req.body;
    const user = await User.findOne({email});
    if(!user){
      return res.status(404).json({error:"User not found"})
    }
    const isMatch = await bcrypt.compare(password, user.password)
    if(!isMatch){
      return res.status(400).json({error:"Invalid credentials"})
    }
    const token = jwt.sign({userId:user._id}, process.env.JWT_SECRET,{expiresIn:"7d"})
    res.status(201).json({token,user:{id:user._id, name:user.name, email:user.email}})
  }
  catch(err){
    res.status(500).json(err)
  }
})

router.get("/:id", async (req, res) =>{
  try{
  
    const user = await User.findById(req.params.id).select("-password");
    if(!user){
      return res.status(404).json({error:"User not found"})
    }
    res.status(200).json(user)
  }catch(err){
    res.status(500).json(err)
  }
})

router.get("/me/profile", async (req, res) =>{
   try{

      const user = await User.findById(req.params.id).select("-password");
      if(!user){
        return res.status(404).json({error:"User not found"})
      }
      res.status(200).json(user)
    }catch(err){
      res.status(500).json(err)
    }
})

export default router