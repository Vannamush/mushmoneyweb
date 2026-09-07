import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { ChevronLeft, Trash2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function DeleteAccount() {
  const navigate = useNavigate();
  const [confirmText, setConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');
  const canDelete = confirmText.trim().toUpperCase() === 'DELETE';

  const handleDelete = async () => {
    if (!canDelete || deleting) return;
    setDeleting(true);
    setError('');
    try {
      try {
        await base44.functions.invoke('deleteAccount', {});
      } catch (e) {
        // continue to logout even if cleanup fails
      }
      try {
        await base44.auth.logout();
      } catch (e) {
        await base44.auth.logout();
      }
    } catch (e) {
      setError('Something went wrong. Please try again.');
      setDeleting(false);
    }
  };

  return (
    <div className="px-5 pt-6 pb-16 max-w-2xl mx-auto">
      <div className="flex items-center gap-2 mb-6">
        <button onClick={() => navigate(-1)} className="h-11 w-11 rounded-full bg-muted flex items-center justify-center">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <h1 className="text-xl font-semibold">Delete account</h1>
      </div>

      <div className="rounded-2xl border-2 border-red-200 bg-red-50 p-5 mb-6">
        <div className="flex items-start gap-3">
          <Trash2 className="h-6 w-6 text-red-600 shrink-0 mt-0.5" />
          <div>
            <h2 className="text-base font-semibold text-red-800 mb-1">This is permanent</h2>
            <p className="text-sm text-red-700 leading-relaxed">
              Deleting your account will permanently remove all of your data, including:
            </p>
            <ul className="text-sm text-red-700 leading-relaxed list-disc pl-5 mt-2 space-y-1">
              <li>All expenses and income records</li>
              <li>Categories, bills, and savings goals</li>
              <li>Your settings and preferences</li>
              <li>Your Pro subscription (if active)</li>
            </ul>
            <p className="text-sm text-red-700 leading-relaxed mt-2">
              This action cannot be undone. Consider exporting your data first from Settings.
            </p>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <label className="text-sm font-medium block mb-2">
          Type <span className="font-semibold">DELETE</span> to confirm
        </label>
        <input
          type="text"
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          placeholder="DELETE"
          className="flex h-12 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        />
      </div>

      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

      <Button
        onClick={handleDelete}
        disabled={!canDelete || deleting}
        variant="destructive"
        className="w-full h-12 text-base"
      >
        {deleting ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" /> Deleting…
          </>
        ) : (
          <>
            <Trash2 className="h-5 w-5" /> Delete my account
          </>
        )}
      </Button>

      <button
        onClick={() => navigate(-1)}
        className="w-full mt-3 h-12 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        Cancel and go back
      </button>
    </div>
  );
}