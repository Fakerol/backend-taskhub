import mongoose from "mongoose";

const activitySchema = new mongoose.Schema(
  {
    project: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    action: String,
    target: String,
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const Activity = mongoose.model("Activity", activitySchema);
