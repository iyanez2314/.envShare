import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function seedUsersForOrg25() {
  try {
    // Create test users
    const users = [
      {
        email: 'john.member@example.com',
        name: 'John Member',
        password: await bcrypt.hash('password123', 10),
      },
      {
        email: 'jane.admin@example.com', 
        name: 'Jane Admin',
        password: await bcrypt.hash('password123', 10),
      },
      {
        email: 'mike.viewer@example.com',
        name: 'Mike Viewer', 
        password: await bcrypt.hash('password123', 10),
      }
    ];

    // Create users (skip if they already exist)
    const createdUsers = [];
    for (const userData of users) {
      const existingUser = await prisma.user.findUnique({
        where: { email: userData.email }
      });

      if (!existingUser) {
        const user = await prisma.user.create({
          data: userData
        });
        createdUsers.push(user);
        console.log(`Created user: ${user.email}`);
      } else {
        createdUsers.push(existingUser);
        console.log(`User already exists: ${existingUser.email}`);
      }
    }

    // Add users to organization 25
    for (const user of createdUsers) {
      // Check if user is already a member
      const existingMembership = await prisma.userOrganizationRole.findUnique({
        where: {
          userId_organizationId: {
            userId: user.id,
            organizationId: 25
          }
        }
      });

      if (!existingMembership) {
        // Add to organization users (many-to-many relationship)
        await prisma.organization.update({
          where: { id: 25 },
          data: {
            users: {
              connect: { id: user.id }
            }
          }
        });

        // Create user role
        await prisma.userOrganizationRole.create({
          data: {
            userId: user.id,
            organizationId: 25,
            role: user.email.includes('admin') ? 'OWNER' : 'MEMBER'
          }
        });

        console.log(`Added ${user.email} to organization 25 as ${user.email.includes('admin') ? 'OWNER' : 'MEMBER'}`);
      } else {
        console.log(`${user.email} is already a member of organization 25`);
      }
    }

    console.log('✅ Successfully seeded users for organization 25');
  } catch (error) {
    console.error('Error seeding users for org 25:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedUsersForOrg25();