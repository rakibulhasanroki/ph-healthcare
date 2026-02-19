import status from "http-status";
import AppError from "../../errorHelpers/AppError";
import { prisma } from "../../lib/prisma";
import { IUpdateAdmin } from "./admin.interface";
import { UserStatus } from "../../../generated/prisma/enums";

const getAllAdmins = async () => {
  const result = await prisma.admin.findMany({
    include: {
      user: true,
    },
  });

  return result;
};

const getAdminById = async (id: string) => {
  const admin = await prisma.admin.findUnique({
    where: {
      id,
    },
    include: {
      user: true,
    },
  });

  if (!admin) {
    throw new AppError(status.NOT_FOUND, "Admin or Super admin  not found");
  }

  return admin;
};

const updateAdmin = async (id: string, payload: IUpdateAdmin) => {
  const existingAdmin = await prisma.admin.findUnique({
    where: { id },
  });

  if (!existingAdmin) {
    throw new AppError(status.NOT_FOUND, "Admin or superAdmin not found");
  }
  const { admin } = payload;
  const updatedAdmin = await prisma.admin.update({
    where: { id },
    data: {
      ...admin,
    },
  });

  return updatedAdmin;
};

const softDeleteAdmin = async (id: string, user: Express.User) => {
  const admin = await prisma.admin.findUnique({
    where: {
      id,
    },
  });

  if (!admin) {
    throw new AppError(status.NOT_FOUND, "Admin or superAdmin not found");
  }

  if (admin.userId === user.id) {
    throw new AppError(status.BAD_REQUEST, "You cannot delete yourself");
  }

  const result = await prisma.$transaction(async (tx) => {
    await tx.admin.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });

    await tx.user.update({
      where: { id: admin.userId },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
        status: UserStatus.DELETED,
      },
    });

    await tx.session.deleteMany({
      where: { userId: admin.userId },
    });

    await tx.account.deleteMany({
      where: { userId: admin.userId },
    });

    const foundAdmin = await getAdminById(id);

    return foundAdmin;
  });

  return result;
};

export const AdminService = {
  getAllAdmins,
  getAdminById,
  updateAdmin,
  softDeleteAdmin,
};
