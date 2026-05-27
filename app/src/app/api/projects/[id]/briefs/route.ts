import { NextRequest, NextResponse } from 'next/server';
import { MOCK_BRIEFS } from '@/lib/mockData';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_req: NextRequest, { params }: RouteContext) {
  const { id } = await params;
  const briefs = MOCK_BRIEFS.filter((b) => b.project_id === id);
  return NextResponse.json({ data: briefs, total: briefs.length });
}

export async function POST(_req: NextRequest, { params }: RouteContext) {
  const { id } = await params;
  return NextResponse.json({
    success: true,
    message: `Brief generation started for project ${id}`,
    job_id: `job_${Date.now()}`,
  });
}
