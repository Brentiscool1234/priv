'use client';

import { ProjectStatus, PageStatus, QAStatus } from '@/types';

type StatusValue = ProjectStatus | PageStatus | QAStatus;

const STATUS_STYLES: Record<string, string> = {
  // Project statuses
  draft: 'bg-slate-700 text-slate-200',
  generating: 'bg-blue-800 text-blue-200',
  deployed: 'bg-green-800 text-green-200',
  qa_complete: 'bg-purple-800 text-purple-200',
  // Page statuses
  pending: 'bg-slate-700 text-slate-300',
  generated: 'bg-blue-800 text-blue-200',
  approved: 'bg-green-800 text-green-200',
  // QA statuses
  pass: 'bg-green-800 text-green-200',
  warning: 'bg-yellow-800 text-yellow-200',
  fail: 'bg-red-800 text-red-200',
};

const STATUS_LABELS: Record<string, string> = {
  draft: 'Draft',
  generating: 'Generating',
  deployed: 'Deployed',
  qa_complete: 'QA Complete',
  pending: 'Pending',
  generated: 'Generated',
  approved: 'Approved',
  pass: 'Pass',
  warning: 'Warning',
  fail: 'Fail',
};

interface StatusBadgeProps {
  status: StatusValue;
  className?: string;
}

export default function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const style = STATUS_STYLES[status] ?? 'bg-slate-700 text-slate-200';
  const label = STATUS_LABELS[status] ?? status;

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${style} ${className}`}
    >
      {label}
    </span>
  );
}
