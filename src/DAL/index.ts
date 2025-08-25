import { prismaClient } from "@/services/prisma";

// Data Access Layer (DAL) class to encapsulate database operations
class DataAccessLayer {
  // User-related operations
  async findUserByEmail(email: string) {
    return prismaClient.user.findUnique({
      where: { email },
    });
  }

  async createUser(name: string, email: string, password: string) {
    return prismaClient.user.create({
      data: {
        name,
        email,
        password,
      },
    });
  }
}

const dalInstance = new DataAccessLayer();

export default dalInstance;
