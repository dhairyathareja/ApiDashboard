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

        let search=user.apiKeys.find(item=>item.name==name);
        if(search){
            throw new ErrorHandler(402,`Key already Exist`);
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

export const apiRequest = ErrorWrapper(async (req,res,next) => {
    
    const{email,endpoint,method,apiKey}=req.body;

    if(!email || !endpoint || !method || !apiKey){
        throw new ErrorHandler(401,`Please enter all the details`);
    }

    try {
        
        const user=await User.findOne({email:email});

        if(user.planDetails.activePlan.status==="InActive"){
            throw new ErrorHandler(402,`Status Inactive, Please Choose a plan`);
        }

        const search=user.apiKeys.find(item=>item.key===apiKey);
        if(!search){
            throw new ErrorHandler(405,`Key does not Exist`);
        }

        const newHit={
            endpoint,
            method,
            apiKey
        }
        user.hitHistory.unshift(newHit);

        user.planDetails.usage.apiCallsUsed+=1;

        await user.save();

        res.status(200).json({
            message:"Hit Api Request",
            data:"No Damage"
        })
        
    } catch (error) {
        throw new ErrorHandler(403,error.message)
    }

    

})

export const deleteApiKey=ErrorWrapper(async (req,res,next) => {
    
    const{keyName,email}=req.body;
    
    try {
        
        const user=await User.findOne({email:email});
        let updatedKeys=user.apiKeys.filter(key=>key.name !=keyName);
        user.apiKeys=updatedKeys;
        await user.save();
        res.status(200).json({
            message:"Deleted Successfully",
            data:updatedKeys
        });
    } catch (error) {
        res.status(400).json(error.message);
    }
})

const oneYearLater = () => {
  const date = new Date();
  date.setFullYear(date.getFullYear() + 1);
  date.setHours(0, 0, 0, 0);
  return date;
};

export const changePlan=ErrorWrapper(async (req,res,next) => {
    
    const{email,newPlan}=req.body;
    
    if(!newPlan || !email){
        throw new ErrorHandler(401,`Details are not present`);
    }

    try {
        
        const user=await User.findOne({email:email});
        let updatedPlan={
            name:newPlan.name,
            monthlyCost:newPlan. monthlyCost,
            apiCallsLimit:newPlan.apiCalls,
            startDate:Date.now(),
            renewalDate:oneYearLater(),
            status:"Active"
        }
        user.planDetails.activePlan=updatedPlan;
        await user.save();

        res.status(200).json({
            message:`Plan Changed to ${updatedPlan.name}`,
            user:user
        })

    } catch (error) {
        throw new ErrorHandler(402,`Can't change plan right now`);
    }

})