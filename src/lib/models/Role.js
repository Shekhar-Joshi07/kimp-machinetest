import mongoose  from "mongoose";

const RoleSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true
        },
        description:{
            type: String,
            trim: true
        }
    },
    {timestamps :  true }
)
export default mongoose.models.Role || mongoose.model("Role", RoleSchema)