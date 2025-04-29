import Admin from '../models/adminModel.js'
import  bcrypt from 'bcryptjs';
import generateToken from '../utils/generateToken.js';



export const adminLogin = async(req,res)=>{
    const {email , password} = req.body;
    console.log(`[ADMIN LOGIN ATTEMPT] Email: ${email}`);
    const admin = await Admin.findOne({email});
    if (!admin) {
        console.log(`[ADMIN LOGIN FAIL] Admin not found for email: ${email}`);
    }

    if(admin && (await bcrypt.compare(password , admin.password))){
        res.json({
            _id: admin._id ,
            email:admin.email,
            token:generateToken(admin._id)
        })
        console.log(`[ADMIN LOGIN SUCCESS] Admin: ${email}`);
    }else{
        if (admin) {
            console.log(`[ADMIN LOGIN FAIL] Bad password for admin: ${email}`);
        }
        res.status(401).json({message:'Invalid Credentials'})
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
