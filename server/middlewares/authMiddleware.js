import jwt from 'jsonwebtoken';

const protectAdmin = (req,res,next) =>{

    const token = req.headers.authorization?.split(' ')[1];
    if(!token) return res.status(401).json({message:'Not Authorized'})

    try{
        const decoded = jwt.verify(token ,process.env.JWT_SECRET);
        req.admin = decoded.id
        next();
    }catch(error){
        res.status(401).json({message:'Token failed'})
    }
};

export default protectAdmin;