import mongoose  from "mongoose";

const PermissionSchema = new mongoose.Schema(
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
export default mongoose.models.Permission || mongoose.model("Permission", PermissionSchema)