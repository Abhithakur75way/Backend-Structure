import mongoose from "mongoose";
import { type IUser } from "./user.dto";
import bcrypt from "bcrypt";

const Schema = mongoose.Schema;

const hashPassword = async (password: string) => {
    const hash = await bcrypt.hash(password, 12);
    return hash;
};

const UserSchema = new Schema<IUser>({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    active: { type: Boolean, default: true },
    role: { type: String, enum: ["USER", "ADMIN"], default: "USER" },
    password: { type: String, required: true },
    refreshToken: { type: String },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },

   

    
     
}, { timestamps: true });

// Hash the user's password before saving
UserSchema.pre("save", async function (next) {
    if (!this.isModified("password")) {
        return next();
    }
    this.password = await hashPassword(this.password);
    next();
});

export default mongoose.model<IUser>("User", UserSchema);