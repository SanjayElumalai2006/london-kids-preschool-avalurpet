'use client';

import React, { useState } from 'react';
import { X, CheckCircle2, CreditCard, DollarSign, Download, Sparkles } from '@/components/Icons';
import { FeeInvoice, FeeReceipt } from '@/types';
import { getStore, saveStore } from '@/lib/store';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: FeeInvoice;
  studentName: string;
  onSuccess?: () => void;
}

export default function PaymentModal({ isOpen, onClose, invoice, studentName, onSuccess }: PaymentModalProps) {
  const [payAmount, setPayAmount] = useState<number>(invoice.dueAmount || 1200);
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'CARD' | 'NETBANKING'>('UPI');
  const [isProcessing, setIsProcessing] = useState(false);
  const [completedReceipt, setCompletedReceipt] = useState<FeeReceipt | null>(null);

  if (!isOpen) return null;

  const handlePay = (e: React.FormEvent) => {
    e.preventDefault();
    if (payAmount <= 0) return;

    setIsProcessing(true);

    setTimeout(() => {
      const store = getStore();
      const receiptNo = `REC-2026-${Math.floor(1000 + Math.random() * 9000)}`;
      const txnId = `${paymentMethod}-${Date.now().toString().slice(-8)}`;

      const newReceipt: FeeReceipt = {
        id: `rec-${Date.now()}`,
        receiptNo,
        date: new Date().toISOString().split('T')[0],
        amount: payAmount,
        paymentMethod,
        transactionId: txnId,
        description: `Term Tuition & Learning Materials Payment for ${studentName}`
      };

      const updatedInvoices = store.invoices.map(inv => {
        if (inv.id === invoice.id) {
          const newPaid = inv.paidAmount + payAmount;
          const newDue = Math.max(0, inv.totalAnnualFee - newPaid);
          return {
            ...inv,
            paidAmount: newPaid,
            dueAmount: newDue,
            status: (newDue === 0 ? 'PAID' : 'PENDING') as 'PAID' | 'PENDING',
            receipts: [newReceipt, ...inv.receipts]
          };
        }
        return inv;
      });

      saveStore({ invoices: updatedInvoices });

      setIsProcessing(false);
      setCompletedReceipt(newReceipt);
      if (onSuccess) onSuccess();
    }, 1200);
  };

  const handleClose = () => {
    setCompletedReceipt(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border-4 border-emerald-100 relative animate-scaleUp">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-5 right-5 w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
        >
          <X size={20} />
        </button>

        {completedReceipt ? (
          <div className="text-center py-4 space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
              <CheckCircle2 size={36} />
            </div>
            <div>
              <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider bg-emerald-50 px-2.5 py-1 rounded-full">
                Payment Successful
              </span>
              <h3 className="text-2xl font-black text-slate-800 mt-2">
                Fee Paid: ${completedReceipt.amount.toLocaleString()}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Receipt Number: <strong>{completedReceipt.receiptNo}</strong>
              </p>
            </div>

            {/* Printable Mini Receipt Card */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 text-left text-xs space-y-2 font-mono">
              <div className="flex justify-between border-b border-slate-200 pb-1.5 font-bold font-sans text-slate-800 text-sm">
                <span>London Kids Preschool Avalurpet</span>
                <span className="text-emerald-600">PAID</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Student:</span>
                <strong className="text-slate-800">{studentName}</strong>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Invoice Ref:</span>
                <span>{invoice.invoiceNo}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Date & Method:</span>
                <span>{completedReceipt.date} via {completedReceipt.paymentMethod}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Transaction ID:</span>
                <span className="text-[11px]">{completedReceipt.transactionId}</span>
              </div>
              <div className="flex justify-between text-slate-800 font-bold border-t border-slate-200 pt-1.5 text-sm font-sans">
                <span>Amount Paid:</span>
                <span className="text-emerald-700 font-extrabold">${completedReceipt.amount.toLocaleString()}</span>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => window.print()}
                className="flex-1 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-2 transition-colors"
              >
                <Download size={16} />
                <span>Print / Save Receipt</span>
              </button>
              <button
                onClick={handleClose}
                className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-200 transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-1.5 text-emerald-600 font-bold text-xs uppercase tracking-wider mb-1">
              <DollarSign size={16} /> Secure School Payment Gateway
            </div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">
              Pay Preschool Tuition Fee
            </h2>
            <p className="text-xs text-slate-500 mb-6">
              Instant credit to student account with downloadable tax receipt.
            </p>

            {/* Fee summary banner */}
            <div className="bg-emerald-50/80 rounded-2xl p-4 border border-emerald-100 mb-5 flex justify-between items-center">
              <div>
                <p className="text-xs text-emerald-800 font-semibold">{studentName}</p>
                <p className="text-xs text-emerald-600">{invoice.term}</p>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-emerald-700">Due Balance</span>
                <p className="text-xl font-black text-emerald-800">${invoice.dueAmount.toLocaleString()}</p>
              </div>
            </div>

            <form onSubmit={handlePay} className="space-y-4">
              {/* Amount Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Payment Amount ($)
                </label>
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <button
                    type="button"
                    onClick={() => setPayAmount(invoice.dueAmount)}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all ${
                      payAmount === invoice.dueAmount
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    Full Balance (${invoice.dueAmount})
                  </button>
                  <button
                    type="button"
                    onClick={() => setPayAmount(Math.min(invoice.dueAmount, 600))}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all ${
                      payAmount === 600
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    Partial Installment ($600)
                  </button>
                </div>
                <input
                  type="number"
                  min="50"
                  max={invoice.dueAmount}
                  value={payAmount}
                  onChange={(e) => setPayAmount(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-bold text-slate-800"
                />
              </div>

              {/* Payment Method Tabs */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Select Payment Method
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('UPI')}
                    className={`py-2 rounded-xl text-xs font-bold border flex flex-col items-center gap-1 transition-all ${
                      paymentMethod === 'UPI'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-500 ring-2 ring-emerald-500/20'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <Sparkles size={16} className="text-emerald-500" />
                    <span>UPI / QR</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('CARD')}
                    className={`py-2 rounded-xl text-xs font-bold border flex flex-col items-center gap-1 transition-all ${
                      paymentMethod === 'CARD'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-500 ring-2 ring-emerald-500/20'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <CreditCard size={16} className="text-emerald-500" />
                    <span>Card</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('NETBANKING')}
                    className={`py-2 rounded-xl text-xs font-bold border flex flex-col items-center gap-1 transition-all ${
                      paymentMethod === 'NETBANKING'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-500 ring-2 ring-emerald-500/20'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <DollarSign size={16} className="text-emerald-500" />
                    <span>Net Banking</span>
                  </button>
                </div>
              </div>

              {/* Dynamic Sub-form based on method */}
              {paymentMethod === 'UPI' && (
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-center space-y-2">
                  <p className="text-xs text-slate-600 font-medium">Scan & Pay via Google Pay, PhonePe, or BHIM</p>
                  <div className="w-28 h-28 bg-white p-2 rounded-xl border border-slate-300 mx-auto flex items-center justify-center shadow-xs">
                    {/* Simplified simulated QR */}
                    <div className="w-full h-full bg-slate-900 rounded-sm flex items-center justify-center text-white font-mono text-[9px] p-1 text-center">
                      LONDON-KIDS QR CODE
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-500 font-mono">UPI ID: londonkids.avalurpet@icici</p>
                </div>
              )}

              {paymentMethod === 'CARD' && (
                <div className="space-y-2.5 p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                  <input
                    type="text"
                    placeholder="Card Number (4111 2222 3333 4444)"
                    defaultValue="4242 •••• •••• 4242"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="MM/YY"
                      defaultValue="09/28"
                      className="px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white"
                    />
                    <input
                      type="password"
                      placeholder="CVV"
                      defaultValue="789"
                      className="px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white"
                    />
                  </div>
                </div>
              )}

              {paymentMethod === 'NETBANKING' && (
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                  <select className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white">
                    <option>Chase Bank</option>
                    <option>Bank of America</option>
                    <option>Wells Fargo</option>
                    <option>Citibank</option>
                    <option>HDFC Bank / ICICI Bank</option>
                  </select>
                </div>
              )}

              <div className="pt-3">
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full py-3.5 rounded-xl bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-sm shadow-md shadow-emerald-200 transition-all flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin"></span>
                      Authorizing Payment of ${payAmount}...
                    </span>
                  ) : (
                    <span>Confirm & Pay ${payAmount.toLocaleString()}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
