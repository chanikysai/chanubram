import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { uploadImage } from '@/lib/imageUploader'; // Assuming uploadImage handles URL generation

// Interface for the incoming memory data, matching what MemoryForm sends
interface MemoryRequestBody {
  title: string;
  description: string;
  date: string; // ISO string
  photoUrls: string[]; // Array of URLs from the image uploader
}

export async function POST(request: Request) {
  try {
    const body: MemoryRequestBody = await request.json();
    const { title, description, date, photoUrls } = body;

    // Basic validation
    if (!title || !description || !date) {
      return NextResponse.json({ message: 'Missing required fields: title, description, or date' }, { status: 400 });
    }

    // In a real scenario, you'd get the userId from the authenticated user session.
    // For this example, we'll use a placeholder userId.
    // Ensure this user ID exists in your database or is dynamically fetched.
    const userId = 'a1b2c3d4-e5f6-7890-1234-567890abcdef'; // Placeholder User ID

    // Create the memory record
    const newMemory = await prisma.memory.create({
      data: {
        title,
        description,
        date: new Date(date), // Prisma expects Date object
        userId,
        Photos: {
          // Create associated Photo records
          create: photoUrls.map(url => ({ url })),
        },
      },
      include: {
        Photos: true, // Include photos in the response
      },
    });

    return NextResponse.json(newMemory, { status: 201 });

  } catch (error: any) {
    console.error('Error creating memory:', error);

    // Handle specific Prisma errors or general errors
    let errorMessage = 'Failed to create memory';
    if (error.code === 'P2002') { // Unique constraint violation
      errorMessage = 'A memory with this title and date might already exist.';
    } else if (error.message) {
      errorMessage = error.message;
    }

    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
}

// Add GET handler to fetch memories if needed for /memories page, but not strictly required for creation endpoint.
// export async function GET() { ... }
