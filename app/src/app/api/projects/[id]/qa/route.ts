import { NextRequest, NextResponse } from 'next/server';
import { MOCK_QA_REPORT } from '@/lib/mockData';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_req: NextRequest, { params }: RouteContext) {
  const { id } = await params;
  const report = { ...MOCK_QA_REPORT, project_id: id };
  return NextResponse.json({ data: report });
}

export async function POST(_req: NextRequest, { params }: RouteContext) {
  const { id } = await params;
  return NextResponse.json({
    success: true,
    message: `QA run started for project ${id}`,
    job_id: `job_${Date.now()}`,
  });
}
