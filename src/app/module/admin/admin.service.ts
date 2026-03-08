import status from "http-status";
import AppError from "../../errorHelpers/AppError";
import { prisma } from "../../lib/prisma";
import {
  IChangeUserRole,
  IChangeUserStatus,
  IUpdateAdmin,
} from "./admin.interface";
import { Role, UserStatus } from "../../../generated/prisma/enums";

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

const changeUserStatus = async (
  user: Express.User,
  payload: IChangeUserStatus,
) => {
  const isAdminExist = await prisma.admin.findUniqueOrThrow({
    where: {
      email: user.email,
    },
    include: {
      user: true,
    },
  });
  const { userId, userStatus } = payload;

  const userToChangeStatus = await prisma.user.findFirstOrThrow({
    where: {
      id: userId,
    },
  });
  if (isAdminExist.userId === userId) {
    throw new AppError(status.BAD_REQUEST, "You cannot change your own status");
  }
  if (
    isAdminExist.user.role === Role.ADMIN &&
    userToChangeStatus.role === Role.SUPER_ADMIN
  ) {
    throw new AppError(
      status.BAD_REQUEST,
      "You cannot change super admin status.Only super admin can change super admin status",
    );
  }

  if (
    isAdminExist.user.role === Role.ADMIN &&
    userToChangeStatus.role === Role.ADMIN
  ) {
    throw new AppError(
      status.BAD_REQUEST,
      "You cannot change admin status.Only super admin can change admin status",
    );
  }
  if (userStatus === UserStatus.DELETED) {
    throw new AppError(
      status.BAD_REQUEST,
      "You cannot change user status to deleted. To delete user, you have to use role specific soft delete api",
    );
  }
  const updatedUser = await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      status: userStatus,
    },
  });

  return updatedUser;
};

const changeUserRole = async (user: Express.User, payload: IChangeUserRole) => {
  const isSuperAdminExist = await prisma.admin.findUniqueOrThrow({
    where: {
      email: user.email,
      user: {
        role: Role.SUPER_ADMIN,
      },
    },
    include: {
      user: true,
    },
  });
  const { userId, role } = payload;

  const userChangeToRole = await prisma.user.findFirstOrThrow({
    where: {
      id: userId,
    },
  });

  if (isSuperAdminExist.userId === userId) {
    throw new AppError(status.BAD_REQUEST, "You cannot change your own role");
  }

  if (
    userChangeToRole.role === Role.DOCTOR ||
    userChangeToRole.role === Role.PATIENT
  ) {
    throw new AppError(
      status.BAD_REQUEST,
      "You cannot change user role to doctor or patient",
    );
  }
  const updatedUser = await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      role,
    },
  });
  return updatedUser;
};

export const AdminService = {
  getAllAdmins,
  getAdminById,
  updateAdmin,
  softDeleteAdmin,
  changeUserStatus,
  changeUserRole,
};
