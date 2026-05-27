import { NextRequest, NextResponse } from 'next/server';
import { MOCK_CONTENT } from '@/lib/mockData';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_req: NextRequest, { params }: RouteContext) {
  const { id } = await params;
  const pages = MOCK_CONTENT.filter((p) => p.project_id === id);
  return NextResponse.json({ data: pages, total: pages.length });
}

export async function POST(_req: NextRequest, { params }: RouteContext) {
  const { id } = await params;
  return NextResponse.json({
    success: true,
    message: `Content generation started for project ${id}`,
    job_id: `job_${Date.now()}`,
  });
}
