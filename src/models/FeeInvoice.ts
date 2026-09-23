import mongoose, { Schema, Document, Model } from 'mongoose';
import { FeeStatus } from '@/types';

export interface IFeeInvoiceDocument extends Document {
  id: string;
  studentId: string;
  invoiceNo: string;
  totalAnnualFee: number;
  paidAmount: number;
  dueAmount: number;
  dueDate: string;
  status: FeeStatus;
  term: string;
  receipts: {
    id: string;
    receiptNo: string;
    date: string;
    amount: number;
    paymentMethod: 'UPI' | 'CARD' | 'NETBANKING' | 'CASH';
    transactionId: string;
    description: string;
  }[];
}

const FeeReceiptSchema = new Schema(
  {
    id: { type: String, required: true },
    receiptNo: { type: String, required: true },
    date: { type: String, required: true },
    amount: { type: Number, required: true },
    paymentMethod: { type: String, enum: ['UPI', 'CARD', 'NETBANKING', 'CASH'], required: true },
    transactionId: { type: String, default: '' },
    description: { type: String, default: '' },
  },
  { _id: false }
);

const FeeInvoiceSchema = new Schema<IFeeInvoiceDocument>(
  {
    id: { type: String, required: true, unique: true, index: true },
    studentId: { type: String, required: true, index: true },
    invoiceNo: { type: String, required: true },
    totalAnnualFee: { type: Number, required: true },
    paidAmount: { type: Number, default: 0 },
    dueAmount: { type: Number, default: 0 },
    dueDate: { type: String, required: true },
    status: { type: String, enum: ['PAID', 'PENDING', 'OVERDUE'], default: 'PENDING' },
    term: { type: String, default: 'Term 1' },
    receipts: [FeeReceiptSchema],
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret: any) {
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

export const FeeInvoiceModel: Model<IFeeInvoiceDocument> =
  mongoose.models.FeeInvoice || mongoose.model<IFeeInvoiceDocument>('FeeInvoice', FeeInvoiceSchema);

export default FeeInvoiceModel;
