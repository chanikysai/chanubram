import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { setReminder } from '@/lib/reminderService';

// Handler for POST requests to /api/occasions
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, date, reminderDate } = body;

    if (!name || !date) {
      return NextResponse.json({ message: 'Occasion name and date are required.' }, { status: 400 });
    }

    const occasionDate = new Date(date);
    if (isNaN(occasionDate.getTime())) {
      return NextResponse.json({ message: 'Invalid date format.' }, { status: 400 });
    }

    let reminderDateObj = null;
    if (reminderDate) {
      reminderDateObj = new Date(reminderDate);
      if (isNaN(reminderDateObj.getTime())) {
        return NextResponse.json({ message: 'Invalid reminder date format.' }, { status: 400 });
      }
    }

    const newOccasion = await prisma.occasion.create({
      data: {
        name,
        date: occasionDate,
        reminderDate: reminderDateObj,
      },
    });

    if (reminderDateObj && newOccasion.id) {
      await setReminder(
        newOccasion.id,
        newOccasion.name,
        newOccasion.date.toISOString(),
        newOccasion.reminderDate?.toISOString() || ''
      );
    }

    return NextResponse.json(newOccasion, { status: 201 });

  } catch (error: any) {
    console.error('Error creating occasion:', error);
    return NextResponse.json({ message: error.message || 'An error occurred while creating the occasion.' }, { status: 500 });
  }
}

// Handler for GET requests to /api/occasions
export async function GET() {
  try {
    const occasions = await prisma.occasion.findMany({
      orderBy: {
        date: 'asc', // Order by date, ascending
      },
    });
    return NextResponse.json(occasions);
  } catch (error: any) {
    console.error('Error fetching occasions:', error);
    return NextResponse.json({ message: 'An error occurred while fetching occasions.' }, { status: 500 });
  }
}
