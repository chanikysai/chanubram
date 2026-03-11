import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { NextRequest } from 'next/server';
import { handler as POST, PUT, GET } from '@/app/api/pair/route'; // Import route handlers
import { randomBytes } from 'crypto';

// Mock next-auth
jest.mock('next-auth/next', () => ({
  getServerSession: jest.fn(),
}));

// Mock Prisma client
const mockPrisma = {
  user: {
    findUnique: jest.fn(),
    update: jest.fn(),
    create: jest.fn(), // Not used in pair route, but good to have for mocking
  },
  invite: {
    findUnique: jest.fn(),
    create: jest.fn(),
    delete: jest.fn(),
  },
  $transaction: jest.fn(async (callbacks) => {
    // Mock transaction to execute mock functions sequentially
    const results = [];
    for (const callback of callbacks) {
      results.push(await callback(mockPrisma));
    }
    return results;
  }),
};
jest.mock('@/lib/prisma', () => ({
  __esModule: true,
  default: mockPrisma,
}));

// Mock crypto for reproducible codes
jest.mock('crypto', () => ({
  randomBytes: jest.fn(() => Buffer.from('mockhexcode', 'hex')), // Returns a fixed 8 bytes, which is 16 hex chars
}));


const mockSession = {
  user: {
    id: 'user-id-1',
    name: 'Test User',
    email: 'test@example.com',
    image: 'http://example.com/image.jpg',
  },
};

const mockUserA = {
  id: 'user-id-a',
  name: 'User A',
  email: 'userA@example.com',
  image: 'http://example.com/imageA.jpg',
  partnerId: null,
  SentInvites: [],
};

const mockUserB = {
  id: 'user-id-b',
  name: 'User B',
  email: 'userB@example.com',
  image: 'http://example.com/imageB.jpg',
  partnerId: null,
  SentInvites: [],
};

const mockPartneredUserA = { ...mockUserA, partnerId: 'user-id-b' };
const mockPartneredUserB = { ...mockUserB, partnerId: 'user-id-a' };


const mockInvite = {
  id: 'invite-id-1',
  code: 'mockhexcode',
  expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Expires in 7 days
  inviterId: 'user-id-a',
  Inviter: { id: 'user-id-a', name: 'User A' },
};

const mockExpiredInvite = {
  ...mockInvite,
  expiresAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // Expired 1 day ago
};

describe('Pair API Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (getServerSession as jest.Mock).mockResolvedValue(mockSession); // Default to authenticated

    // Reset mock Prisma functions
    mockPrisma.user.findUnique.mockReset();
    mockPrisma.user.update.mockReset();
    mockPrisma.invite.findUnique.mockReset();
    mockPrisma.invite.create.mockReset();
    mockPrisma.invite.delete.mockReset();
    mockPrisma.$transaction.mockReset();
  });

  // --- POST /api/pair/invite ---
  describe('POST /api/pair/invite', () => {
    it('should generate and return an invite code for an authenticated user', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUserA); // User A is not partnered, has no pending invites
      mockPrisma.invite.create.mockResolvedValue({ ...mockInvite, inviterId: 'user-id-1' }); // Mock creation

      const req = new NextRequest('http://localhost:3000/api/pair', {
        method: 'POST',
      });

      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.inviteCode).toBe('mockhexcode');
      expect(data.expiresAt).toBeDefined();
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-id-1' },
        select: { partnerId: true, SentInvites: { where: { expiresAt: { gt: expect.any(Date) } } } },
      });
      expect(mockPrisma.invite.create).toHaveBeenCalledWith({
        data: {
          code: 'mockhexcode',
          expiresAt: expect.any(Date),
          inviter: { connect: { id: 'user-id-1' } },
        },
      });
    });

    it('should return an error if user is already partnered', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockPartneredUserA); // User A is partnered

      const req = new NextRequest('http://localhost:3000/api/pair', {
        method: 'POST',
      });

      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.message).toBe('You are already partnered.');
      expect(mockPrisma.invite.create).not.toHaveBeenCalled();
    });

    it('should return existing active invite if user has one', async () => {
      const pendingInviteData = { ...mockInvite, id: 'existing-invite-id', code: 'existingcode', expiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000) };
      mockPrisma.user.findUnique.mockResolvedValue({ ...mockUserA, SentInvites: [pendingInviteData] });

      const req = new NextRequest('http://localhost:3000/api/pair', {
        method: 'POST',
      });

      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(409);
      expect(data.message).toBe('You already have an active invite. Please wait for it to expire or it will be deleted when a new one is generated.');
      expect(data.inviteCode).toBe('existingcode');
      expect(mockPrisma.invite.create).not.toHaveBeenCalled();
    });

    it('should return authentication required error', async () => {
      (getServerSession as jest.Mock).mockResolvedValue(null); // Unauthenticated

      const req = new NextRequest('http://localhost:3000/api/pair', {
        method: 'POST',
      });

      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.message).toBe('Authentication required');
      expect(mockPrisma.user.findUnique).not.toHaveBeenCalled();
    });
  });

  // --- PUT /api/pair/accept ---
  describe('PUT /api/pair/accept', () => {
    it('should successfully pair two users with a valid invite code', async () => {
      mockPrisma.invite.findUnique.mockResolvedValue(mockInvite);
      mockPrisma.user.findUnique.mockResolvedValueOnce(mockUserB).mockResolvedValueOnce(mockUserA); // Mock userB and userA
      mockPrisma.invite.delete.mockResolvedValue({}); // Mock successful delete
      // Mock transaction to ensure updates and delete are called
      mockPrisma.$transaction.mockImplementation(async (callbacks) => {
        const mockUserBUpdate = mockPrisma.user.update.mock.calls[0];
        const mockUserAUpdate = mockPrisma.user.update.mock.calls[1];
        const mockInviteDelete = mockPrisma.invite.delete.mock.calls[0];
        expect(mockUserBUpdate[0]).toEqual({ where: { id: 'user-id-b' }, data: { partnerId: 'user-id-a' } });
        expect(mockUserAUpdate[0]).toEqual({ where: { id: 'user-id-a' }, data: { partnerId: 'user-id-b' } });
        expect(mockInviteDelete[0]).toEqual({ where: { id: 'invite-id-1' } });
        return []; // Return dummy transaction results
      });

      const req = new NextRequest('http://localhost:3000/api/pair', {
        method: 'PUT',
        body: JSON.stringify({ inviteCode: 'mockhexcode' }),
      });

      const response = await PUT(req);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.message).toBe('Partner successfully paired!');
      expect(mockPrisma.invite.findUnique).toHaveBeenCalledWith({ where: { code: 'mockhexcode' }, include: { Inviter: true } });
      expect(mockPrisma.user.findUnique).toHaveBeenCalledTimes(2);
      expect(mockPrisma.$transaction).toHaveBeenCalledTimes(1);
    });

    it('should return error if invite code is invalid', async () => {
      mockPrisma.invite.findUnique.mockResolvedValue(null); // Invite not found

      const req = new NextRequest('http://localhost:3000/api/pair', {
        method: 'PUT',
        body: JSON.stringify({ inviteCode: 'invalidcode' }),
      });

      const response = await PUT(req);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.message).toBe('Invalid or expired invite code');
      expect(mockPrisma.invite.findUnique).toHaveBeenCalledWith({ where: { code: 'invalidcode' }, include: { Inviter: true } });
      expect(mockPrisma.user.findUnique).not.toHaveBeenCalled();
    });

    it('should return error if invite code is expired', async () => {
      mockPrisma.invite.findUnique.mockResolvedValue(mockExpiredInvite);
      mockPrisma.invite.delete.mockResolvedValue({}); // Mock successful delete

      const req = new NextRequest('http://localhost:3000/api/pair', {
        method: 'PUT',
        body: JSON.stringify({ inviteCode: 'mockhexcode' }),
      });

      const response = await PUT(req);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.message).toBe('Invite code has expired');
      expect(mockPrisma.invite.delete).toHaveBeenCalledWith({ where: { id: 'invite-id-1' } });
      expect(mockPrisma.user.findUnique).not.toHaveBeenCalled();
    });

    it('should return error if inviting self', async () => {
      // Simulate User B trying to accept an invite sent by themselves
      mockPrisma.invite.findUnique.mockResolvedValue({ ...mockInvite, inviterId: 'user-id-b' }); // Invite sent by user-id-b
      mockPrisma.invite.delete.mockResolvedValue({}); // Mock successful delete

      const req = new NextRequest('http://localhost:3000/api/pair', {
        method: 'PUT',
        body: JSON.stringify({ inviteCode: 'mockhexcode' }),
      });
      // Ensure session user is 'user-id-b' for this test case
      (getServerSession as jest.Mock).mockResolvedValue({ user: { id: 'user-id-b' } });

      const response = await PUT(req);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.message).toBe('Cannot invite yourself.');
      expect(mockPrisma.invite.delete).toHaveBeenCalledWith({ where: { id: 'invite-id-1' } });
      expect(mockPrisma.user.findUnique).not.toHaveBeenCalled();
    });

    it('should return error if one or both users are already partnered', async () => {
      mockPrisma.invite.findUnique.mockResolvedValue(mockInvite);
      mockPrisma.user.findUnique.mockResolvedValueOnce(mockPartneredUserB).mockResolvedValueOnce(mockUserA); // User B is already partnered
      mockPrisma.invite.delete.mockResolvedValue({}); // Mock successful delete

      const req = new NextRequest('http://localhost:3000/api/pair', {
        method: 'PUT',
        body: JSON.stringify({ inviteCode: 'mockhexcode' }),
      });

      const response = await PUT(req);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.message).toBe('One or both users are already partnered.');
      expect(mockPrisma.invite.delete).toHaveBeenCalledWith({ where: { id: 'invite-id-1' } });
      expect(mockPrisma.user.findUnique).toHaveBeenCalledTimes(2);
      expect(mockPrisma.$transaction).not.toHaveBeenCalled();
    });

    it('should return authentication required error', async () => {
      (getServerSession as jest.Mock).mockResolvedValue(null); // Unauthenticated

      const req = new NextRequest('http://localhost:3000/api/pair', {
        method: 'PUT',
        body: JSON.stringify({ inviteCode: 'mockhexcode' }),
      });

      const response = await PUT(req);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.message).toBe('Authentication required');
      expect(mockPrisma.invite.findUnique).not.toHaveBeenCalled();
    });
  });

  // --- GET /api/pair ---
  describe('GET /api/pair', () => {
    it('should return partner status for a partnered user', async () => {
      const partnerInfo = {
        id: 'user-id-b',
        name: 'User B',
        image: 'http://example.com/imageB.jpg',
      };
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'user-id-a',
        name: 'User A',
        email: 'userA@example.com',
        image: 'http://example.com/imageA.jpg',
        partnerId: 'user-id-b',
        SentInvites: [],
        Partner: partnerInfo, // Mock partner details
      });

      const req = new NextRequest('http://localhost:3000/api/pair');

      const response = await GET(req);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.user.id).toBe('user-id-a');
      expect(data.partner).toEqual(partnerInfo);
      expect(data.pendingInvite).toBeNull();
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-id-1' },
        select: {
          id: true, name: true, email: true, image: true, partnerId: true, SentInvites: { where: { expiresAt: { gt: expect.any(Date) } }, select: { code: true, expiresAt: true } }
        },
        include: { Partner: { select: { id: true, name: true, image: true } } }
      });
    });

    it('should return status for a user without a partner or pending invite', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'user-id-a',
        name: 'User A',
        email: 'userA@example.com',
        image: 'http://example.com/imageA.jpg',
        partnerId: null,
        SentInvites: [],
        Partner: null,
      });

      const req = new NextRequest('http://localhost:3000/api/pair');

      const response = await GET(req);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.user.id).toBe('user-id-a');
      expect(data.partner).toBeNull();
      expect(data.pendingInvite).toBeNull();
    });

    it('should return status with pending invite details', async () => {
      const pendingInviteData = { code: 'pendingcode', expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) };
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'user-id-a',
        name: 'User A',
        email: 'userA@example.com',
        image: 'http://example.com/imageA.jpg',
        partnerId: null,
        SentInvites: [pendingInviteData],
        Partner: null,
      });

      const req = new NextRequest('http://localhost:3000/api/pair');

      const response = await GET(req);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.user.id).toBe('user-id-a');
      expect(data.partner).toBeNull();
      expect(data.pendingInvite).toEqual(pendingInviteData);
    });

    it('should return authentication required error', async () => {
      (getServerSession as jest.Mock).mockResolvedValue(null); // Unauthenticated

      const req = new NextRequest('http://localhost:3000/api/pair');

      const response = await GET(req);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.message).toBe('Authentication required');
      expect(mockPrisma.user.findUnique).not.toHaveBeenCalled();
    });

    it('should return 404 if user not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null); // User not found

      const req = new NextRequest('http://localhost:3000/api/pair');

      const response = await GET(req);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.message).toBe('User not found');
    });
  });
});
