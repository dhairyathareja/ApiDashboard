import User from "../model/user.model.js";
import ErrorHandler from "../utils/ErrorHandler.js";
import ErrorWrapper from "../utils/ErrorWrapper.js";

export const signUpController = ErrorWrapper(async (req,res,next) => {

    const {name,email,company,password} = req.body;  

    if(!name || !email || !company || !password){
        throw new ErrorHandler(401,`Please Enter the details....`);
    }
    
    let regex = /^[a-z0-9]+@[a-z]+\.[a-z]{2,3}$/;
    let validEmail = regex.test(email);
    
    if(!validEmail){
        throw new ErrorHandler(401,`Please Enter a Valid Email `);
    }

    let existingUser = await User.findOne({email:email});
    if(existingUser){
        throw new ErrorHandler(400,`User Already Exists`);
    }

    try {
            let newUser= await User.create({
                name,
                email,
                company,
                password
            });

            let user= await User.findOne({_id:newUser._id}).select('-password');

            const{accessToken,refreshToken}=await generateAccessAndRefreshToken(user._id);
            user.refreshToken=refreshToken;
            await user.save();

            res.status(201)
                .cookie("RefreshToken",refreshToken).cookie("AccessToken",accessToken)
                .json({
                message: "SignUp Successful",
                user:user
            })    

        } catch (error) {
            throw new ErrorHandler(501,`Internal Server Error Found`);
        }    
    

    
})

const generateAccessAndRefreshToken=async(userId)=>{
    try {
        
        let user= await User.findOne({
            _id:userId
        })
        //
        const accessToken=await user.generateAccessToken();
        const refreshToken= await user.generateRefreshToken();
        return {refreshToken,accessToken}

    } catch (error) {
        throw new ErrorHandler(501,`Error is While Generating Refresh And Access Token`);
    }
}

export const loginController = ErrorWrapper(async (req,res,next) => {

    const{email,password}=req.body;

    if(!email || !password){
        return new ErrorHandler(401,`Please Enter the Details`);
    }
    
    let user=await User.findOne({email:email});
    if(!user){
        throw new ErrorHandler(401,`User Does Not Exists`);
    }

    const checkPassword=await user.isPasswordCorrect(password)

    if(!checkPassword){
        throw new ErrorHandler(400,`Entered Password is not correct`);
    }

    const{accessToken,refreshToken}=await generateAccessAndRefreshToken(user._id);
    user.refreshToken=refreshToken;
    await user.save();

    user= await User.findOne({_id:user._id}).select('-password');
    res.status(200)
       .cookie("RefreshToken",refreshToken).cookie("AccessToken",accessToken)
       .json({
        message:"Login Successful",
        user:user
    })



})

export const logoutController = ErrorWrapper(async (req,res,next) => {

    try {
        
        const {email}=req.body;
        const user=await User.findOne({email:email});
        user.refreshToken="";
        await user.save();
        res.status(200).cookie("RefreshToken","").json({
            message:"Logout Successful",
            logout:true
        });    
    } catch (error) {
        throw new ErrorHandler(501,`Server Error Contact Admin`)
    }
    

})

export const updateUser =ErrorWrapper(async (req,res,next) => {
    
    const {email,name,company}=req.body;
    if(!email){
        throw new ErrorHandler(401,`Please enter Email`);
    }

    try{
        const user= await User.findOne({email:email});
        if(name){
            user.name=name;
        }
        if(company){
            user.company=company;
        }
        await user.save();
        res.status(200).json({
            message:"User Updated Successful",
            user:user
        })
    }
    catch(error){
        res.status(500).json({message:"Error Occured Contact Admin"});
    }
})

export const updatePassword = ErrorWrapper(async (req,res,next) => {
  
    const{currentPassword,newPassword,email}=req.body;
    
    if(!currentPassword,!newPassword){
        throw new ErrorHandler(401,`Please enter details`);
    }

    try {
        
        const user=await User.findOne({email:email});
        const checkPassword=await user.isPasswordCorrect(password)
        if(!checkPassword){
            res.status(401).json({message:"Current Password is incorrect",})
        }
        else{
            user.password=newPassword;
            user.refreshToken="";
            await user.save();
            
            res.status(200).cookie("RefreshToken","").json({
                message:"Password Changed Success"
            })
        }
        
    } catch (error) {
        throw new ErrorHandle(401,error.message);
    }
})