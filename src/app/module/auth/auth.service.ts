import status from "http-status";
import { UserStatus } from "../../../generated/prisma/enums";
import AppError from "../../errorHelpers/AppError";
import { auth } from "../../lib/auth";
import { prisma } from "../../lib/prisma";
import { TokenUtils } from "../../utils/token";
import { LoginPayload, RegisterPayload } from "./auth.interfaces";

const registerPatient = async (payload: RegisterPayload) => {
  const { email, password, name } = payload;

  const data = await auth.api.signUpEmail({
    body: {
      email,
      password,
      name,
    },
  });
  if (!data.user) {
    throw new AppError(status.BAD_REQUEST, "Failed to register patient");
  }
  try {
    const patientData = await prisma.$transaction(async (tx) => {
      const patient = await tx.patient.create({
        data: {
          userId: data.user!.id,
          name: payload.name,
          email: payload.email,
        },
      });
      return patient;
    });

    const accessToken = TokenUtils.getAccessToken({
      userId: data.user.id,
      email: data.user.email,
      name: data.user.name,
      role: data.user.role,
      status: data.user.status,
      isDeleted: data.user.isDeleted,
      emailVerified: data.user.emailVerified,
    });

    const refreshToken = TokenUtils.getRefreshToken({
      userId: data.user.id,
      email: data.user.email,
      name: data.user.name,
      role: data.user.role,
      status: data.user.status,
      isDeleted: data.user.isDeleted,
      emailVerified: data.user.emailVerified,
    });

    return {
      ...data,
      accessToken,
      refreshToken,
      patientData,
    };
  } catch (error) {
    console.error("Transaction error:", error);
    await prisma.user.delete({
      where: { id: data.user.id },
    });
    throw new Error("Failed to create patient record");
  }
};

const loginUser = async (payload: LoginPayload) => {
  const { email, password } = payload;

  const data = await auth.api.signInEmail({
    body: {
      email,
      password,
    },
  });
  if (!data.user) {
    throw new AppError(status.BAD_REQUEST, "Failed to login user");
  }

  if (data.user.status === UserStatus.BLOCKED) {
    throw new AppError(
      status.FORBIDDEN,
      "Your account is blocked. Please contact support.",
    );
  }

  if (data.user.isDeleted || data.user.status === UserStatus.DELETED) {
    throw new AppError(status.NOT_FOUND, "Your account is deleted");
  }

  const accessToken = TokenUtils.getAccessToken({
    userId: data.user.id,
    email: data.user.email,
    name: data.user.name,
    role: data.user.role,
    status: data.user.status,
    isDeleted: data.user.isDeleted,
    emailVerified: data.user.emailVerified,
  });

  const refreshToken = TokenUtils.getRefreshToken({
    userId: data.user.id,
    email: data.user.email,
    name: data.user.name,
    role: data.user.role,
    status: data.user.status,
    isDeleted: data.user.isDeleted,
    emailVerified: data.user.emailVerified,
  });

  return {
    ...data,
    accessToken,
    refreshToken,
  };
};

export const AuthService = {
  registerPatient,
  loginUser,
};
