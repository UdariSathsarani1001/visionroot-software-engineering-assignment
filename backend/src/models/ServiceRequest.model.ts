import mongoose, { type Document, type Model, Schema } from "mongoose";
import {
  RequestCategory,
  RequestPriority,
  RequestStatus,
} from "../constants/request.constants.js";

export interface IServiceRequest extends Document {
  _id: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  title: string;
  description: string;
  category: RequestCategory;
  priority: RequestPriority;
  status: RequestStatus;
  createdAt: Date;
  updatedAt: Date;
}

const serviceRequestSchema = new Schema<IServiceRequest>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
      maxlength: [2000, "Description cannot exceed 2000 characters"],
    },
    category: {
      type: String,
      enum: Object.values(RequestCategory),
      required: true,
      index: true,
    },
    priority: {
      type: String,
      enum: Object.values(RequestPriority),
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: Object.values(RequestStatus),
      default: RequestStatus.PENDING,
      index: true,
    },
  },
  { timestamps: true }
);

// Text index for search
serviceRequestSchema.index({ title: "text", description: "text" });
serviceRequestSchema.index({ createdAt: -1 });
serviceRequestSchema.index({ updatedAt: -1 });

const ServiceRequest: Model<IServiceRequest> = mongoose.model<IServiceRequest>(
  "ServiceRequest",
  serviceRequestSchema
);

export default ServiceRequest;
