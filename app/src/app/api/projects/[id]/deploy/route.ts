import { NextRequest, NextResponse } from 'next/server';
import { MOCK_DEPLOY_LOGS } from '@/lib/mockData';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(req: NextRequest, { params }: RouteContext) {
  const { id } = await params;
  const body = await req.json();
  const action = body.action ?? 'unknown';

  const log = {
    id: Date.now().toString(),
    project_id: id,
    action,
    status: 'success' as const,
    message: `${action} completed successfully for project ${id}`,
    timestamp: new Date().toISOString(),
  };

  return NextResponse.json({ success: true, log });
}

export async function GET(_req: NextRequest, { params }: RouteContext) {
  const { id } = await params;
  const logs = MOCK_DEPLOY_LOGS.filter((l) => l.project_id === id);
  return NextResponse.json({ data: logs });
}
