// src/app/api/daily-question/route.ts

import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route'; // Assuming this path
import { getDailyQuestion } from '@/lib/questions';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    // Optional: Check authentication if only logged-in users should access this
    const session = await getServerSession(authOptions);
    // If authentication is required, uncomment the following:
    // if (!session?.user?.id) {
    //   return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    // }

    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize to start of the day

    // 1. Find if a question for today already exists in the database
    let dailyQuestion = await prisma.question.findFirst({
      where: {
        createdAt: {
          gte: today,
          lt: new Date(today.getTime() + 24 * 60 * 60 * 1000), // up to, but not including, tomorrow
        },
      },
      include: {
        answers: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    // 2. If no question for today, find or create it
    if (!dailyQuestion) {
      const questionText = getDailyQuestion(today);

      // Try to find an existing question with this text
      let existingQuestion = await prisma.question.findUnique({
        where: { text: questionText },
      });

      if (existingQuestion) {
        // If the question text already exists, update its createdAt to today
        // This makes it the "daily question" for today.
        dailyQuestion = await prisma.question.update({
          where: { id: existingQuestion.id },
          data: {
            createdAt: today, // Set as today's active question
          },
          include: {
            answers: {
              orderBy: { createdAt: 'asc' },
            },
          },
        });
      } else {
        // If the question text is new, create a new question entry
        dailyQuestion = await prisma.question.create({
          data: {
            text: questionText,
            createdAt: today, // Set as today's question
          },
          include: {
            answers: {
              orderBy: { createdAt: 'asc' },
            },
          },
        });
      }
    }

    // Return the found or newly created/updated question with its answers
    return NextResponse.json(dailyQuestion);

  } catch (error) {
    console.error('Error fetching daily question:', error);
    return NextResponse.json({ message: 'Error fetching daily question' }, { status: 500 });
  }
}
