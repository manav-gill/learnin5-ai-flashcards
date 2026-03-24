import mongoose from "mongoose";

const savedFlashcardSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    topic: {
      type: String,
      required: true,
      trim: true,
    },
    flashcards: {
      type: [mongoose.Schema.Types.Mixed],
      required: true,
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

const SavedFlashcard = mongoose.model("SavedFlashcard", savedFlashcardSchema);

export default SavedFlashcard;
