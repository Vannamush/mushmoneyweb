import React from 'react';
import { Image } from '@/components/ui/image';
import { initials } from '@/lib/book';

export default function ClientAvatar({ name, photoUrl, size = 'md' }) {
  const cls = size === 'lg' ? 'h-20 w-20 text-xl' : size === 'sm' ? 'h-10 w-10 text-xs' : 'h-16 w-16 text-base';
  return (
    <div className={`${cls} rounded-full overflow-hidden bg-primary text-primary-foreground flex items-center justify-center font-semibold shrink-0 ring-2 ring-border`}>
      {photoUrl ? <Image src={photoUrl} alt={name} className="h-full w-full object-cover" /> : initials(name)}
    </div>
  );
}