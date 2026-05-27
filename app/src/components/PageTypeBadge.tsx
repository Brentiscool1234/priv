'use client';

import { PageType } from '@/types';

const PAGE_TYPE_STYLES: Record<PageType, string> = {
  homepage: 'bg-indigo-800 text-indigo-200',
  service: 'bg-blue-800 text-blue-200',
  location: 'bg-teal-800 text-teal-200',
  service_location: 'bg-cyan-800 text-cyan-200',
  about: 'bg-violet-800 text-violet-200',
  faq: 'bg-amber-800 text-amber-200',
  contact: 'bg-rose-800 text-rose-200',
};

const PAGE_TYPE_LABELS: Record<PageType, string> = {
  homepage: 'Homepage',
  service: 'Service',
  location: 'Location',
  service_location: 'Service/Location',
  about: 'About',
  faq: 'FAQ',
  contact: 'Contact',
};

interface PageTypeBadgeProps {
  type: PageType;
  className?: string;
}

export default function PageTypeBadge({ type, className = '' }: PageTypeBadgeProps) {
  const style = PAGE_TYPE_STYLES[type] ?? 'bg-slate-700 text-slate-200';
  const label = PAGE_TYPE_LABELS[type] ?? type;

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${style} ${className}`}
    >
      {label}
    </span>
  );
}
