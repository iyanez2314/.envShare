import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedInvitations() {
  try {
    // Clear existing invitations for org 25
    await prisma.organizationInvitation.deleteMany({
      where: { organizationId: 25 }
    });

    // Create sample invitations
    const invitations = await prisma.organizationInvitation.createMany({
      data: [
        {
          email: 'john.doe@example.com',
          organizationId: 25,
          invitedBy: 6,
          role: 'MEMBER',
          status: 'PENDING',
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
        },
        {
          email: 'jane.smith@example.com',
          organizationId: 25,
          invitedBy: 6,
          role: 'MEMBER',
          status: 'PENDING',
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        },
        {
          email: 'expired.user@example.com',
          organizationId: 25,
          invitedBy: 6,
          role: 'MEMBER',
          status: 'EXPIRED',
          expiresAt: new Date(Date.now() - 24 * 60 * 60 * 1000) // 1 day ago
        },
        {
          email: 'declined.user@example.com',
          organizationId: 25,
          invitedBy: 6,
          role: 'MEMBER',
          status: 'DECLINED',
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        }
      ]
    });

    console.log(`Created ${invitations.count} invitations for organization 25`);
  } catch (error) {
    console.error('Error seeding invitations:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedInvitations();