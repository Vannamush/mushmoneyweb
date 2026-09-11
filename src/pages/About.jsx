import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import PublicFooter from '@/components/PublicFooter';

export default function About() {
  return (
    <div className="px-5 pt-6 pb-16 max-w-2xl mx-auto">
      <div className="flex items-center gap-2 mb-6">
        <Link to="/" className="h-11 w-11 rounded-full bg-muted flex items-center justify-center">
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-xl font-semibold">About Mushmoney</h1>
      </div>

      <div className="space-y-4 text-sm leading-relaxed text-foreground">
        <p>
          Mushmoney is a streamlined, minimal personal finance tracker built to help you monitor daily spending,
          manage monthly budgets, and visualize your financial health at a glance. It brings your expenses, income,
          categories, bills, and savings goals together in one calm, clutter-free interface so you always know where
          your money is going.
        </p>
        <p>
          Set a monthly budget and Mushmoney shows your safe-to-spend amount for the day, warns you when a category
          goes over, and lets you group your history by day or week. Import bank exports as CSV and auto-categorize
          transactions, track recurring bills, and build savings goals with progress toward each target. Multi-currency
          support, flexible one-time or recurring card payments, and a standalone pay page keep everything in one place.
        </p>
        <p>
          It is designed for people who want honest, effortless insight into their money without spreadsheets or
          bloated finance apps — whether you're budgeting solo, managing a household, or running a small service
          business. The interface is mobile-first with large touch targets, so you can log a purchase in seconds
          right from your pocket.
        </p>
        <p>
          Mushmoney is built and maintained by an independent team using the Base44 platform, with payments handled
          securely through Stripe. We do not sell your data, and you can export or delete everything at any time.
        </p>
      </div>

      <PublicFooter />
    </div>
  );
}