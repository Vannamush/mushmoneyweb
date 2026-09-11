import React from 'react';
import { Link } from 'react-router-dom';

// Lightweight footer for public pages — links visitors to the other trust pages.
export default function PublicFooter() {
  return (
    <footer className="mt-10 pt-6 border-t border-border">
      <nav className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
        <Link to="/about" className="hover:text-foreground">About</Link>
        <Link to="/contact" className="hover:text-foreground">Contact</Link>
        <Link to="/privacy" className="hover:text-foreground">Privacy Policy</Link>
      </nav>
      <p className="text-xs text-muted-foreground mt-3">© {new Date().getFullYear()} Mushmoney</p>
    </footer>
  );
}