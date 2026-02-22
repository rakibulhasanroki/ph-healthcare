import status from "http-status";
import { UserStatus } from "../../../generated/prisma/enums";
import AppError from "../../errorHelpers/AppError";
import { auth } from "../../lib/auth";
import { prisma } from "../../lib/prisma";
import { TokenUtils } from "../../utils/token";
import { LoginPayload, RegisterPayload } from "./auth.interfaces";
import { JWTUtils } from "../../utils/jwt";
import { env } from "../../config/env";
import { JwtPayload } from "jsonwebtoken";

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

const getMe = async (user: Express.User) => {
  console.log("user", user);
  const data = await prisma.user.findUnique({
    where: {
      id: user.id,
    },
    include: {
      patient: {
        include: {
          appointments: true,
          medicalReports: true,
          prescriptions: true,
          reviews: true,
          patientHealthData: true,
        },
      },
      doctor: {
        include: {
          doctorSpecialties: true,
          appointments: true,
          prescriptions: true,
          reviews: true,
        },
      },
      admin: true,
    },
  });
  if (!data) {
    throw new AppError(status.NOT_FOUND, "User not found");
  }
  return data;
};

const getNewToken = async (refreshToken: string, sessionToken: string) => {
  const isSessionExist = await prisma.session.findUnique({
    where: {
      token: sessionToken,
    },
    include: {
      user: true,
    },
  });

  if (!isSessionExist) {
    throw new AppError(status.UNAUTHORIZED, "Invalid session token");
  }
  const verifyRefreshToken = JWTUtils.verifyToken(
    refreshToken,
    env.REFRESH_TOKEN_SECRET,
  );

  if (!verifyRefreshToken.success && verifyRefreshToken.error) {
    throw new AppError(status.UNAUTHORIZED, "Invalid refresh token");
  }

  const data = verifyRefreshToken as JwtPayload;

  const newAccessToken = TokenUtils.getAccessToken({
    userId: data.userId,
    email: data.email,
    name: data.name,
    role: data.role,
    status: data.status,
    isDeleted: data.isDeleted,
    emailVerified: data.emailVerified,
  });

  const newRefreshToken = TokenUtils.getRefreshToken({
    userId: data.userId,
    email: data.email,
    name: data.name,
    role: data.role,
    status: data.status,
    isDeleted: data.isDeleted,
    emailVerified: data.emailVerified,
  });

  const { token } = await prisma.session.update({
    where: {
      token: sessionToken,
    },
    data: {
      token: sessionToken,
      expiresAt: new Date(Date.now() + 60 * 60 * 24 * 1000),
      updatedAt: new Date(),
    },
  });
  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
    sessionToken: token,
  };
};

export const AuthService = {
  registerPatient,
  loginUser,
  getMe,
  getNewToken,
};
