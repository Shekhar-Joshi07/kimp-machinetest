
import mongoose  from "mongoose";

const AssignmentSchema = new mongoose.Schema(
    {
        roleId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Role",
            required: true
        },
        permissionId:{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Permission",
            required:  true
        },
        granted:{
            type: Boolean,
            required: true,
            default: false
        }
    },
    {timestamps :  true }
)

AssignmentSchema.index({ roleId: 1, permissionId: 1 }, { unique: true });

export default mongoose.models.Assignment || mongoose.model("Assignment",AssignmentSchema)