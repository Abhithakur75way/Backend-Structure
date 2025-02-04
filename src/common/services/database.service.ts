import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
const connectDB = async ()=>{
    try{
        await mongoose.connect(process.env.MONGO_URI as string);
        console.log("Database Connected");
        
    }
    catch (error){
        console.log("Failed to connect Database", error);
        process.exit(1); 
    }
}
export default connectDB;