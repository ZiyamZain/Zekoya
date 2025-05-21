import jwt from 'jsonwebtoken';
import Admin from '../models/adminModel.js';

const protectAdmin = async (req, res, next) => {
    // Check for token in Authorization header
    let token = req.headers.authorization?.split(' ')[1];
    
    // If no token in header, check query parameters (for Excel exports)
    if (!token && req.query.token) {
        token = req.query.token;
    }
    
    if(!token) {
        return res.status(401).json({message:'Not Authorized'});
    }

    try {
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
 
        const admin = await Admin.findById(decoded.id).select('-password');
        if (!admin) {

            return res.status(401).json({message:'Admin account not found'});
        }
        

        req.admin = decoded.id;
        next();
    }catch(error){
        console.error('Token verification failed:', error);
        res.status(401).json({message:'Token failed'});
    }
};

export default protectAdmin;