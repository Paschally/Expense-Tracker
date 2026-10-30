import jwt from 'jsonwebtoken';

const authMiddleware = async(req, res, next)=>{
    // const authHeader = req.header('authorization');
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(" ")[1]
    if(!token){
        return res.status(401).json({
            success: false,
            message: "Access denied, No token provided...."
        })
    }
    console.log(authHeader);
    try{
        const decodeToken = jwt.verify(token, process.env.JWT_SECRET_KEY)
        console.log(decodeToken);
        req.userInfo = decodeToken
        next()
    } catch(error){
        res.status(500).json({
            success: false,
            message: "Access denied, No token provided...."})
    }
};

export default authMiddleware;