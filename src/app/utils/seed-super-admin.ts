import { Role } from "../../generated/prisma/enums";
import { env } from "../config/env";
import { auth } from "../lib/auth";
import { prisma } from "../lib/prisma";

export const seedSuperAdmin = async () => {
  try {
    console.log("**** Super admin creation started");
    const superAdminData = {
      name: env.SUPER_ADMIN_NAME as string,
      email: env.SUPER_ADMIN_EMAIL as string,
      role: Role.SUPER_ADMIN,
      password: env.SUPER_ADMIN_PASS as string,
    };
    console.log("***existing checking");

    const existingUser = await prisma.user.findUnique({
      where: {
        email: superAdminData.email,
      },
    });

    if (existingUser) {
      console.log("Super admin already exists skipping creation");
      return;
    }
    console.log("Existing pass creating super admin");
    const superAdminUser = await auth.api.signUpEmail({
      body: {
        ...superAdminData,
        needsPasswordChange: false,
      },
    });
    await prisma.$transaction(async (tx) => {
      if (superAdminUser) {
        await prisma.user.update({
          where: {
            email: superAdminUser.user.email,
          },
          data: {
            emailVerified: true,
          },
        });
      }

      await tx.admin.create({
        data: {
          userId: superAdminUser.user.id,
          name: superAdminData.name,
          email: superAdminData.email,
        },
      });
    });

    const superAdmin = await prisma.admin.findFirst({
      where: {
        email: superAdminData.email,
      },
      include: {
        user: true,
      },
    });

    console.log("Super admin created", superAdmin);
  } catch (err) {
    if (env.NODE_ENV === "development") {
      console.log(err);
    }
    console.log("Failed to create super admin");
    await prisma.user.delete({
      where: {
        email: env.SUPER_ADMIN_EMAIL as string,
      },
    });
  }
};
