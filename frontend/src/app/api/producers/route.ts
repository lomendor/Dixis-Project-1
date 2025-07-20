import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Ensure we get all producers by default
    if (!searchParams.has('per_page')) {
      searchParams.set('per_page', '100');
    }

    const queryString = searchParams.toString();
    const backendUrl = `http://localhost:8080/api/v1/producers?${queryString}`;

    const response = await fetch(backendUrl, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Backend responded with ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Producers API proxy error:', error instanceof Error ? error : new Error(String(error)));
    return NextResponse.json(
      { error: 'Failed to fetch producers' },
      { status: 500 }
    );
  }
}