import { prisma } from "../../lib/prisma";

const getAllDoctors = async () => {
  const result = await prisma.doctor.findMany({
    include: {
      user: true,
      specialties: {
        include: {
          specialty: true,
        },
      },
    },
  });
  return result;
};

export const DoctorService = {
  getAllDoctors,
};
