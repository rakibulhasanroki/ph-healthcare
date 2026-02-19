import { Role } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";
import { IUpdateSuperAdmin } from "./superAdmin.interface";

const getAllSuperAdmins = async () => {
  const result = await prisma.superAdmin.findMany({
    where: {
      isDeleted: false,
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      user: true,
    },
  });

  return result;
};

const getSuperAdminById = async (id: string) => {
  const superAdmin = await prisma.superAdmin.findUnique({
    where: {
      id,
      isDeleted: false,
    },
    include: {
      user: true,
    },
  });

  if (!superAdmin) {
    throw new Error("Super Admin not found");
  }

  return superAdmin;
};

const updateSuperAdmin = async (id: string, payload: IUpdateSuperAdmin) => {
  const existingSuperAdmin = await prisma.superAdmin.findUnique({
    where: { id, isDeleted: false },
  });

  if (!existingSuperAdmin) {
    throw new Error("Super Admin not found");
  }

  const updatedSuperAdmin = await prisma.superAdmin.update({
    where: { id },
    data: payload,
    include: {
      user: true,
    },
  });

  return updatedSuperAdmin;
};

const softDeleteSuperAdmin = async (id: string, currentUser: Express.User) => {
  const superAdmin = await prisma.superAdmin.findUnique({
    where: { id },
  });

  if (!superAdmin) {
    throw new Error("Super Admin not found");
  }

  if (superAdmin.isDeleted) {
    throw new Error("Super Admin is already deleted");
  }

  if (
    currentUser.role === Role.SUPER_ADMIN &&
    superAdmin.userId == currentUser.id
  ) {
    throw new Error("You can not delete your own profile");
  }

  const result = await prisma.superAdmin.update({
    where: { id },
    data: {
      isDeleted: true,
      deletedAt: new Date(),
    },
  });

  return result;
};

export const SuperAdminService = {
  getAllSuperAdmins,
  getSuperAdminById,
  updateSuperAdmin,
  softDeleteSuperAdmin,
};
