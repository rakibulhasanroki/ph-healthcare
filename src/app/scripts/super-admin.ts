import { env } from "node:process";
import { Role } from "../../generated/prisma/enums";
import { auth } from "../lib/auth";
import { prisma } from "../lib/prisma";

async function seedSuperAdmin() {
  console.log("**** Super admin creation started");
  const superAdminData = {
    name: process.env.SUPER_ADMIN_NAME as string,
    email: process.env.SUPER_ADMIN_EMAIL as string,
    role: Role.SUPER_ADMIN,
    password: process.env.SUPER_ADMIN_PASS as string,
  };
  console.log("***existing checking");

  const existingUser = await prisma.user.findUnique({
    where: {
      email: superAdminData.email,
    },
  });

  if (existingUser) {
    throw new Error("Already  exists this admin!!");
  }
  console.log("Existing pass creating super admin");
  const superAdminUser = await auth.api.signUpEmail({
    body: superAdminData,
  });
  try {
    await prisma.$transaction(async (tx) => {
      await tx.admin.create({
        data: {
          userId: superAdminUser.user.id,
          name: superAdminData.name,
          email: superAdminData.email,
        },
      });
    });

    if (superAdminUser) {
      await prisma.user.update({
        where: {
          email: superAdminData.email,
        },
        data: {
          emailVerified: true,
          needsPasswordChange: true,
        },
      });
    }
    console.log("Super admin created");
  } catch (err) {
    if (env.NODE_ENV === "development") {
      console.log(err);
    }
    await prisma.user.delete({
      where: { id: superAdminUser.user.id },
    });
    throw new Error("Failed to create super admin");
  }
}

seedSuperAdmin();
