import User from "../model/user.model.js"
import ErrorHandler from "../utils/ErrorHandler.js";
import ErrorWrapper from "../utils/ErrorWrapper.js";

export const getKeys = ErrorWrapper( async (req,res,next) => {
    
    const{email}=req.body;
    if(!email){
        throw new ErrorHandler(401,`Please provide your Email`);
    }
    try {
        const user=await User.findOne({email:email});
        res.status(200).json({
            message:"Keys Fetched Successfully",
            data:user.apiKeys
        })    
    } catch (error) {
        throw new ErrorHandler(401,`Cannot get keys contact Admin`);
    }   
    
});

export const generateKey= ErrorWrapper( async (req,res,next) => {
    
    const{email}=req.body;
    const{name,permissions}=req.body;
    
    if(!email){
        throw new ErrorHandler(401,`Please provide your Email`);
    }

    if(!name || !permissions){
        throw new ErrorHandler(401,`Please enter key details`);
    }
    
    try {
        const user=await User.findOne({email:email});
        if(user.apiKeys.length>=5){
            
            res.status(405).json({message: "!! Limit Reached !! Max 5 Keys allowed"});
            return
        }
        
        const newKey={
            id: Date.now(),
            name,
            key: `local_key_${Math.random().toString(36).substring(2, 15)}`,
            permissions:permissions,
            createdAt: new Date().toISOString(),
            lastUsed:null,
            createdBy:email
        }
        
        user.apiKeys.unshift(newKey);
        await user.save()
        res.status(200).json({
            message:"Keys Fetched Successfully",
            data:user.apiKeys
        })    
    } catch (error) {
        
        throw new ErrorHandler(401,`Cannot get keys contact Admin`);
    }

})