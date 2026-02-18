import { Role } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";
import { IUpdateAdmin } from "./admin.interface";

const getAllAdmins = async () => {
  const result = await prisma.admin.findMany({
    where: {
      isDeleted: false,
    },
    include: {
      user: true,
    },
  });

  return result;
};

const getAdminById = async (id: string, currentUser: Express.User) => {
  const admin = await prisma.admin.findUnique({
    where: {
      id,
      isDeleted: false,
    },
    include: {
      user: true,
    },
  });

  if (!admin) {
    throw new Error("Admin not found");
  }
  if (currentUser.role === Role.ADMIN && admin.userId !== currentUser.id) {
    throw new Error("Forbidden: You can only access your own profile");
  }

  return admin;
};

const updateAdmin = async (
  id: string,
  payload: IUpdateAdmin,
  currentUser: Express.User,
) => {
  const existingAdmin = await prisma.admin.findUnique({
    where: { id, isDeleted: false },
  });

  if (!existingAdmin) {
    throw new Error("Admin not found");
  }

  if (
    currentUser.role === Role.ADMIN &&
    existingAdmin.userId !== currentUser.id
  ) {
    throw new Error("Forbidden: You can only update your own profile");
  }

  const updatedAdmin = await prisma.admin.update({
    where: { id },
    data: payload,
    include: {
      user: true,
    },
  });

  return updatedAdmin;
};

const softDeleteAdmin = async (id: string) => {
  const admin = await prisma.admin.findUnique({
    where: { id },
  });

  if (!admin) {
    throw new Error("Admin not found");
  }

  if (admin.isDeleted) {
    throw new Error("Admin is already deleted");
  }

  const result = await prisma.admin.update({
    where: { id },
    data: {
      isDeleted: true,
      deletedAt: new Date(),
    },
  });

  return result;
};

export const AdminService = {
  getAllAdmins,
  getAdminById,
  updateAdmin,
  softDeleteAdmin,
};
