import { UserStatus } from "../../../generated/prisma/enums";
import { auth } from "../../lib/auth";
import { prisma } from "../../lib/prisma";

interface RegisterPayload {
  email: string;
  password: string;
  name: string;
}

interface LoginPayload {
  email: string;
  password: string;
}

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
    throw new Error("Failed to register user");
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

    return {
      ...data,
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
    throw new Error("Failed to login user");
  }

  if (data.user.status === UserStatus.BLOCKED) {
    throw new Error("Your account is blocked. Please contact support.");
  }

  if (data.user.isDeleted || data.user.status === UserStatus.DELETED) {
    throw new Error("Your account is deleted");
  }
  return data;
};

export const AuthService = {
  registerPatient,
  loginUser,
};
