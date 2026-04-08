import prisma from '../prismaClient';

export const userRepository = {
  findByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  },
  findById(id: string) {
    return prisma.user.findUnique({ where: { id } });
  },
  create(data: { name: string; email: string; password: string }) {
    return prisma.user.create({ data });
  },
  update(id: string, data: Partial<{ name: string; email: string }>) {
    return prisma.user.update({
      where: { id },
      data,
    });
  },
};
