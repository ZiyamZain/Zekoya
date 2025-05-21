import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

const protect = async (req, res, next) => {

  const token = req.headers.authorization?.split(" ")[1]; 
  if (!token) {

    return res.status(401).json({ message: "Not authorized, token missing" });
  }

  
  try {

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select("-password");
    
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }
    
    // Check if user is blocked
    if (user.isBlocked) {
      return res.status(403).json({ message: "Your account has been blocked. Please contact customer support." });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error("Token verification error:", err.message);
    res.status(401).json({ message: "Invalid or expired token" });
  }
};

export default protect;
