import { prisma } from '../config/prisma.config';

export class AuthRepository {
  public async findByEmail(email: string) {
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        roles: {
          include: {
            role: true,
          },
        },
      },
    });

    if (!user) return null;

    const roles = user.roles.map((ur) => ur.role.name);
    return {
      ...user,
      roles,
    };
  }

  public async findById(id: number) {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        first_name: true,
        last_name: true,
        email: true,
        phone: true,
        status: true,
        created_at: true,
        roles: {
          include: {
            role: true,
          },
        },
      },
    });

    if (!user) return null;

    const roles = user.roles.map((ur) => ur.role.name);
    return {
      id: user.id,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      phone: user.phone,
      status: user.status,
      created_at: user.created_at,
      roles,
    };
  }

  public async createUser(data: {
    first_name: string;
    last_name: string;
    email: string;
    password_hash: string;
    phone?: string;
    roleName: string;
  }) {
    const role = await prisma.role.findUnique({
      where: { name: data.roleName },
    });

    const user = await prisma.user.create({
      data: {
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        password_hash: data.password_hash,
        phone: data.phone || null,
        status: 'ACTIVE',
        roles: role
          ? {
              create: {
                role_id: role.id,
              },
            }
          : undefined,
      },
    });

    return await this.findById(user.id);
  }
}
