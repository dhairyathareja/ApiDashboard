import mongoose, { model, Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt"

const oneYearLater = () => {
  const date = new Date();
  date.setFullYear(date.getFullYear() + 1);
  date.setHours(0, 0, 0, 0);
  return date;
};


const userSchema = new Schema({
    name:String,
    email:String,
    company:String,
    password:String,
    refreshToken:String,
    apiKeys:[
        {
            id: Number,
            name: String,
            key: String,
            permissions: [String],
            createdAt: String,
            lastUsed: String,
            createdBy:String,
        }
    ],
    planDetails:{
        activePlan: {
            name: {type: String, default:"Standard"},
            monthlyCost: {type:Number, default:49},
            apiCallsLimit: {type: Number, default:5000},
            startDate: {type:Date, default:Date.now()},
            renewalDate: {type: Date, default: oneYearLater},
            status: {type:String, default:"Active"}
        },
        usage: {
            apiCallsUsed: {type:Number, default:0},
            apiCallsLimit: {type:Number,default:5000},
            storageUsed: {type:Number,default:0},
            storageLimit: {type:Number,default:5},
            requestsPerMinute: {type:Number,default:0},
            rpmLimit: {type:Number,default:100}
        }
    }
})

userSchema.pre('save', async function (next) {
    try {
        // Hash password if modified
        if (this.isModified('password')) {
            const hashedPassword = await bcrypt.hash(this.password, 10);
            this.password = hashedPassword;
        }

        // Hash each subject's marks if modified
        if (this.isModified('apiKeys')) {
            for (let item of this.apiKeys) {
                if (item.isModified('key')) {
                    item.key = await bcrypt.hash(item.key, 10);
                }
            }
        }

        next();
    } catch (err) {
        next(err);
    }
});

userSchema.methods.isPasswordCorrect = async function (enteredPassword) {
    const user = this;    
    return await bcrypt.compare(enteredPassword,user.password);
} 

userSchema.methods.generateAccessToken= async function(){
    
    return jwt.sign(
        {
            userId: this._id,
            email: this.email,
            name: this.name
        },
        process.env.ACCESS_TOKEN_KEY,
        {
            expiresIn:process.env.TOKEN_EXPIRY    
        }
    );    
}

userSchema.methods.generateRefreshToken= async function(){
    return jwt.sign(
        {
            userId:this._id
        },
        process.env.REFRESH_TOKEN_KEY,
        {
            expiresIn:process.env.TOKEN_EXPIRY    
        }
    )    
}

const User = new model('User',userSchema);
export default User;