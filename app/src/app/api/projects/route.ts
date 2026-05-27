import { NextRequest, NextResponse } from 'next/server';
import { MOCK_PROJECTS } from '@/lib/mockData';
import { Project } from '@/types';

export async function GET() {
  return NextResponse.json({
    data: MOCK_PROJECTS,
    total: MOCK_PROJECTS.length,
  });
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  const newProject: Project = {
    id: Date.now().toString(),
    business_name: body.business_name ?? 'New Project',
    industry: body.industry ?? 'party_rentals',
    primary_locale: body.primary_locale ?? 'en-US',
    secondary_locales: body.secondary_locales ?? [],
    country: body.country ?? 'US',
    status: 'draft',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    page_count: 0,
  };

  return NextResponse.json({ data: newProject }, { status: 201 });
}
