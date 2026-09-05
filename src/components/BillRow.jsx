import React from 'react';
import { Trash2, Pencil, CreditCard } from 'lucide-react';
import { formatCurrency } from '@/lib/money';

export default function BillRow({ bill, index, paying, onPay, onEdit, onDelete }) {
  return (
    <div className={`px-4 py-3 flex items-center gap-3 ${index > 0 ? 'border-t border-[#1b2336]' : ''}`}>
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate text-white">{bill.name}</p>
        <p className="text-sm text-[#9ca3af]">
          {formatCurrency(bill.amount)} / {bill.interval === 'year' ? 'year' : 'month'}
          {bill.last_paid ? ` · last charged ${bill.last_paid}` : ''}
        </p>
      </div>
      <button onClick={() => onPay(bill)} disabled={paying === bill.id} className="h-9 px-3 rounded-full bg-white text-[#0c111d] text-xs font-medium flex items-center gap-1.5 shrink-0 disabled:opacity-60">
        <CreditCard className="h-3.5 w-3.5" />
        {paying === bill.id ? '…' : 'Pay'}
      </button>
      <button onClick={() => onEdit(bill)} className="h-9 w-9 rounded-full bg-[#1b2336] flex items-center justify-center shrink-0">
        <Pencil className="h-4 w-4 text-[#9ca3af]" />
      </button>
      <button onClick={() => onDelete(bill)} className="h-9 w-9 rounded-full bg-[#1b2336] flex items-center justify-center shrink-0">
        <Trash2 className="h-4 w-4 text-[#ef4444]" />
      </button>
    </div>
  );
}