// src/app/api/daily-question/submit/route.ts

import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route'; // Assuming this path

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { questionId, text } = body;

    if (!questionId || !text || text.trim() === '') {
      return NextResponse.json({ message: 'Question ID and answer text are required.' }, { status: 400 });
    }

    // Ensure the question exists before creating an answer
    const question = await prisma.question.findUnique({
      where: { id: questionId },
    });

    if (!question) {
      return NextResponse.json({ message: 'Question not found.' }, { status: 404 });
    }

    const newAnswer = await prisma.answer.create({
      data: {
        questionId: questionId,
        userId: userId,
        text: text.trim(),
      },
    });

    // Optionally, fetch the question again to include the new answer in the response
    // or just return the created answer. Returning the answer is simpler.
    return NextResponse.json(newAnswer, { status: 201 });

  } catch (error: any) {
    console.error('Error submitting daily question answer:', error);
    // Handle specific Prisma errors if needed, e.g., foreign key constraint
    if (error.code === 'P2003') { // Foreign key constraint error
      return NextResponse.json({ message: 'Invalid question ID provided.' }, { status: 400 });
    }
    return NextResponse.json({ message: 'Error submitting answer' }, { status: 500 });
  }
}
