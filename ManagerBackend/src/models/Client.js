import mongoose from "mongoose";

const clientSchema = new mongoose.Schema(
  {
    uniqueId: { type: Number, unique: true, required: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String },
    userId: {type: mongoose.Schema.Types.ObjectId,ref: "User"},
    education: { type: String },
    college: { type: String },
    company: { type: String },
    role: { type: String },
    countryWishlist: { type: String },
    collegeWishlist: { type: String },
    courseWishlist: { type: String },
    budget: { type: String },
    other: { type: String },
    address: { type: String },
    documents: [
      {
        filename: String,
        originalname: String,
        mimetype: String,
        size: Number,
        url: String,
      },
    ],
    createdBy: { type: String, default: "Unknown" }, // user who created
    updatedBy: { type: String, default: "" },        // last updater
    deleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
  
);

export default mongoose.model("Client", clientSchema);
