import Admin from '../models/adminModel.js'
import  bcrypt from 'bcryptjs';
import generateToken from '../utils/generateToken.js';



export const adminLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Extensive input validation
        if (!email || typeof email !== 'string') {
           
            return res.status(400).json({ 
                message: 'Valid email is required' 
            });
        }

        if (!password || typeof password !== 'string') {
            
            return res.status(400).json({ 
                message: 'Valid password is required' 
            });
        }

       

        // Find admin by email with case-insensitive search
        const admin = await Admin.findOne({ email: { $regex: new RegExp(`^${email}$`, 'i') } });
        
        if (!admin) {
          
            return res.status(404).json({ 
                message: 'Admin account not found' 
            });
        }

        // Verify password
        const isPasswordMatch = await bcrypt.compare(password, admin.password);
        if (!isPasswordMatch) {

            return res.status(401).json({ 
                message: 'Invalid credentials' 
            });
        }

        // Generate token
        const token = generateToken(admin._id);


        res.status(200).json({
            _id: admin._id,
            email: admin.email,
            token: token
        });

    } catch (error) {
        console.error('[ADMIN LOGIN CRITICAL ERROR]', error);
        console.error('[ERROR DETAILS]', {
            name: error.name,
            message: error.message,
            stack: error.stack
        });
        res.status(500).json({ 
            message: 'Critical server error during admin login', 
            error: error.message 
        });
    }
}


// export const createAdmin = async (req,res)=>{
//     const {email , password} = req.body;
//     const adminExists = await Admin.findOne({email});
//     if(adminExists) return res.status(400).json({message:'Admin already exists'});

//     const hashed = await bcrypt.hash(password,10);
//     const admin = await Admin.create({email , password:hashed})

//     res.status(201).json({
//     _id:admin._id,
//     email:admin.email,
//     token:generateToken(admin._id)
//     })
// }
