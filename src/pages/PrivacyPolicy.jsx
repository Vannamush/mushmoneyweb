import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

export default function PrivacyPolicy() {
  return (
    <div className="px-5 pt-6 pb-16 max-w-2xl mx-auto">
      <div className="flex items-center gap-2 mb-6">
        <Link to="/" className="h-11 w-11 rounded-full bg-muted flex items-center justify-center">
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-xl font-semibold">Privacy Policy</h1>
      </div>

      <p className="text-sm text-muted-foreground mb-8">Last updated: September 7, 2026</p>

      <div className="prose prose-sm max-w-none space-y-6 text-foreground">
        <section>
          <h2 className="text-base font-semibold mb-2">Overview</h2>
          <p className="text-sm leading-relaxed">
            Mushmoney is a personal finance tracker that helps you record spending, income, budgets, bills, and savings goals.
            This policy explains what information we collect, how we use it, and the choices you have.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold mb-2">Information we collect</h2>
          <ul className="text-sm leading-relaxed list-disc pl-5 space-y-1">
            <li><strong>Account information:</strong> your email address and display name when you create an account.</li>
            <li><strong>Financial records you enter:</strong> expenses, income, categories, bills, goals, and notes you add to the app.</li>
            <li><strong>App settings:</strong> preferences such as currency, theme, budget, and week-start day.</li>
            <li><strong>Payment data:</strong> when you upgrade to Pro, payment is processed by Stripe; we do not store your full card details.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-base font-semibold mb-2">How we use your information</h2>
          <ul className="text-sm leading-relaxed list-disc pl-5 space-y-1">
            <li>To display your financial data and compute budgets, totals, and summaries.</li>
            <li>To provide Pro subscription features when you upgrade.</li>
            <li>To save your preferences and keep the app working across sessions.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-base font-semibold mb-2">Data storage &amp; third parties</h2>
          <p className="text-sm leading-relaxed">
            Your data is stored securely on the Base44 platform, which hosts the app's database and backend.
            We use <strong>Stripe</strong> to process payments — Stripe handles your card information and we only receive
            confirmation of the transaction. We do not sell your data to third parties.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold mb-2">Your data &amp; control</h2>
          <ul className="text-sm leading-relaxed list-disc pl-5 space-y-1">
            <li>You can export all your expenses and income as a CSV from Settings at any time.</li>
            <li>You can delete your account and all associated data from Settings → Delete account.</li>
            <li>You may edit or remove any individual record at any time.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-base font-semibold mb-2">Security</h2>
          <p className="text-sm leading-relaxed">
            Access to your records is restricted to your account. We rely on the platform's authentication and
            storage controls to protect your data, but no online service is perfectly secure.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold mb-2">Contact</h2>
          <p className="text-sm leading-relaxed">
            If you have questions about this policy or your data, please contact Base44 support.
          </p>
        </section>
      </div>
    </div>
  );
}