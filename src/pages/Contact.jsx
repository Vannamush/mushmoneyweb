import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, Mail, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import PublicFooter from '@/components/PublicFooter';

const CONTACT_EMAIL = 'support@mushmoney.app';

export default function Contact() {
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');

  const send = (e) => {
    e.preventDefault();
    const subject = encodeURIComponent(`Mushmoney contact from ${name || 'a visitor'}`);
    const body = encodeURIComponent(`${message}\n\n— ${name || ''}`);
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
  };

  return (
    <div className="px-5 pt-6 pb-16 max-w-2xl mx-auto">
      <div className="flex items-center gap-2 mb-6">
        <Link to="/" className="h-11 w-11 rounded-full bg-muted flex items-center justify-center">
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-xl font-semibold">Contact</h1>
      </div>

      <p className="text-sm text-muted-foreground mb-6">
        Questions, feedback, or help with your account? We'd love to hear from you.
      </p>

      <a
        href={`mailto:${CONTACT_EMAIL}`}
        className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 mb-6"
      >
        <Mail className="h-5 w-5 text-muted-foreground shrink-0" />
        <span className="text-sm font-medium">{CONTACT_EMAIL}</span>
      </a>

      <form onSubmit={send} className="space-y-3">
        <div>
          <label className="text-sm font-medium block mb-2">Your name</label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Optional" className="h-12 text-base" />
        </div>
        <div>
          <label className="text-sm font-medium block mb-2">Message</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="How can we help?"
            rows={5}
            className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
        </div>
        <Button type="submit" className="w-full h-12 text-base">
          <Send className="h-4 w-4" /> Send message
        </Button>
      </form>

      <PublicFooter />
    </div>
  );
}