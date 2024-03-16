import mongoose from "mongoose";
const ChatSchema = mongoose.Schema(
  {
    username: {
      type: String,
      unique: false,
    },
    message: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);
const messageModel = mongoose.model("ChatMessage", ChatSchema);
export default messageModel;
