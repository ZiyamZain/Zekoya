import jwt from "jsonwebtoken";

export const generateAccessToken = (userId , tokenVersion) =>{
  return jwt.sign(
    {
      userId,
      tokenVersion , 
      type:'access'
    },
    process.env.JWT_SECRET,
    {
      expiresIn : "15m" , //short lived token (15 minutes)
    }
  )
}

export const generateRefreshToken = (userId,tokenVersion) =>{
  return jwt.sign(
    {
      userId,
      tokenVersion,
      type:'refresh'
    },
    process.env.REFRESH_TOKEN_SECRET|| process.env.JWT_SECRET,
    {
      expiresIn : "7d", //Longer-lived token(7 days)
    }
  );
};

export const verifyAccessToken = (token) =>{
  try{
    const decoded = jwt.verify(token , process.env.JWT_SECRET);
    if(decoded.type !== 'access') {
      return null;
    }
    return decoded;
  }catch(error){
    return null;
  }
}

export const verifyRefreshToken = (token) =>{
  try{
    const decoded = jwt.verify(
      token,process.env.REFRESH_TOKEN_SECRET||process.env.JWT_SECRET
    );
    if(decoded.type !== 'refresh'){
      return null;
    }
    return decoded;
  }catch(error){
    return null;
  }
};
