import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
import { Role, UserStatus } from "../../generated/prisma/enums";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: Role.PATIENT,
        required: true,
      },
      status: {
        type: "string",
        defaultValue: UserStatus.ACTIVE,
        required: true,
      },
      needsPasswordChange: {
        type: "boolean",
        defaultValue: false,
        required: true,
      },
      isDeleted: {
        type: "boolean",
        defaultValue: false,
        required: true,
      },
      deletedAt: {
        type: "date",
        defaultValue: null,
        required: false,
      },
    },
  },
  session: {
    expiresIn: 60 * 60 * 60 * 24,
    updateAge: 60 * 60 * 60 * 24,
    cookieCache: {
      enabled: true,
      maxAge: 60 * 60 * 60 * 24,
    },
  },
});
