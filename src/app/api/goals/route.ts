import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const goals = await prisma.goal.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
    return NextResponse.json(goals);
  } catch (error) {
    console.error("Error fetching goals:", error);
    return NextResponse.json({ error: 'Failed to fetch goals' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, description, targetDate, progress, status } = body;

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    const newGoal = await prisma.goal.create({
      data: {
        title,
        description,
        targetDate: targetDate ? new Date(targetDate) : undefined,
        progress,
        status: status || 'active', // Default to 'active'
      },
    });
    return NextResponse.json(newGoal, { status: 201 });
  } catch (error) {
    console.error("Error creating goal:", error);
    return NextResponse.json({ error: 'Failed to create goal' }, { status: 500 });
  }
}
