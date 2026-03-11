import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route'; // Adjust path if necessary
import prisma from '@/lib/prisma';
import { randomBytes } from 'crypto'; // For generating secure random codes

// Helper to generate a random invite code
const generateInviteCode = (): string => {
  return randomBytes(8).toString('hex'); // 16 characters long hex string
};

// POST /api/pair/invite
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
  }

  const userId = session.user.id;

  try {
    // Check if user is already paired
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { partnerId: true, SentInvites: { where: { expiresAt: { gt: new Date() } } } }, // Select active invites
    });

    if (existingUser && existingUser.partnerId) {
      return NextResponse.json({ message: 'You are already partnered.' }, { status: 400 });
    }

    // If user has an active invite, return it
    if (existingUser && existingUser.SentInvites && existingUser.SentInvites.length > 0) {
       const pendingInvite = existingUser.SentInvites[0]; // Assuming only one active invite at a time
       return NextResponse.json({ message: 'You already have an active invite.', inviteCode: pendingInvite.code, expiresAt: pendingInvite.expiresAt }, { status: 409 });
    }

    const inviteCode = generateInviteCode();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // Invite valid for 7 days

    const newInvite = await prisma.invite.create({
      data: {
        code: inviteCode,
        expiresAt: expiresAt,
        inviter: {
          connect: { id: userId },
        },
      },
    });

    return NextResponse.json({ inviteCode: newInvite.code, expiresAt: newInvite.expiresAt }, { status: 201 });

  } catch (error) {
    console.error('Error generating invite code:', error);
    return NextResponse.json({ message: 'Failed to generate invite code' }, { status: 500 });
  }
}

// PUT /api/pair/accept
export async function PUT(req: NextRequest) { // Using PUT for idempotent acceptance
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
  }

  const userIdB = session.user.id; // The user accepting the invite

  try {
    const body = await req.json();
    const { inviteCode } = body;

    if (!inviteCode) {
      return NextResponse.json({ message: 'Invite code is required' }, { status: 400 });
    }

    // Find the invite
    const invite = await prisma.invite.findUnique({
      where: {
        code: inviteCode,
      },
      include: {
        Inviter: true, // To get the inviter's ID
      },
    });

    if (!invite) {
      return NextResponse.json({ message: 'Invalid or expired invite code' }, { status: 404 });
    }

    // Check if invite has expired
    if (new Date(invite.expiresAt) < new Date()) {
      // Clean up expired invite
      await prisma.invite.delete({ where: { id: invite.id } });
      return NextResponse.json({ message: 'Invite code has expired' }, { status: 400 });
    }

    const userIdA = invite.inviterId; // The user who sent the invite

    // Prevent self-invitation or inviting already partnered users
    if (userIdA === userIdB) {
      // Clean up the invite before returning error
      await prisma.invite.delete({ where: { id: invite.id } });
      return NextResponse.json({ message: 'Cannot invite yourself.' }, { status: 400 });
    }

    // Check if either user is already partnered
    const userA = await prisma.user.findUnique({ where: { id: userIdA }, select: { partnerId: true } });
    const userB = await prisma.user.findUnique({ where: { id: userIdB }, select: { partnerId: true } });

    if (userA?.partnerId || userB?.partnerId) {
      // Clean up the invite before returning error
      await prisma.invite.delete({ where: { id: invite.id } });
      return NextResponse.json({ message: 'One or both users are already partnered.' }, { status: 400 });
    }

    // Establish the partnership using a transaction
    await prisma.$transaction([
      prisma.user.update({
        where: { id: userIdB },
        data: { partnerId: userIdA },
      }),
      prisma.user.update({
        where: { id: userIdA },
        data: { partnerId: userIdB },
      }),
      // Delete the used invite
      prisma.invite.delete({
        where: { id: invite.id },
      }),
    ]);

    return NextResponse.json({ message: 'Partner successfully paired!' }, { status: 200 });

  } catch (error) {
    console.error('Error accepting invite code:', error);
    // In case of any error during transaction, Prisma handles rollback.
    // We could try to delete the invite if it wasn't deleted, but $transaction should manage this.
    return NextResponse.json({ message: 'Failed to pair partner' }, { status: 500 });
  }
}

// GET /api/pair
export async function GET(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
    }

    const userId = session.user.id;

    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                name: true,
                email: true,
                image: true,
                partnerId: true,
                SentInvites: {
                    where: { expiresAt: { gt: new Date() } }, // Filter for active invites
                    select: { code: true, expiresAt: true }
                }
            },
            include: {
                Partner: { // Include partner details if partnerId is set
                    select: {
                        id: true,
                        name: true,
                        image: true,
                    }
                }
            }
        });

        if (!user) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        // Format the response to be user-friendly
        const response = {
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                image: user.image,
            },
            partner: user.Partner ? {
                id: user.Partner.id,
                name: user.Partner.name,
                image: user.Partner.image,
            } : null,
            pendingInvite: user.SentInvites.length > 0 ? user.SentInvites[0] : null, // Assuming only one active invite at a time
        };

        return NextResponse.json(response, { status: 200 });

    } catch (error) {
        console.error('Error fetching partner status:', error);
        return NextResponse.json({ message: 'Failed to fetch partner status' }, { status: 500 });
    }
}
