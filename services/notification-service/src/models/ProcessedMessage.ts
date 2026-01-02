import mongoose, { Schema, Document } from "mongoose";

export interface IProcessedMessage extends Document {
  messageId: string;
  topic: string;
  processedAt: Date;
}

const ProcessedMessageSchema = new Schema<IProcessedMessage>({
  messageId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  topic: {
    type: String,
    required: true,
  },
  processedAt: {
    type: Date,
    default: Date.now,
    expires: 604800,
  },
});

export const ProcessedMessage = mongoose.model<IProcessedMessage>(
  "ProcessedMessage",
  ProcessedMessageSchema
);
