import status from "http-status";
import { Specialty } from "../../../generated/prisma/client";
import AppError from "../../errorHelpers/AppError";
import { prisma } from "../../lib/prisma";

const createSpecialty = async (payload: Specialty): Promise<Specialty> => {
  const { title } = payload;
  const specialtyExists = await prisma.specialty.findUnique({
    where: { title: title },
  });

  if (specialtyExists) {
    throw new AppError(
      status.CONFLICT,
      "Specialty with this name already exists",
    );
  }
  const specialty = await prisma.specialty.create({
    data: payload,
  });

  return specialty;
};

const getSpecialties = async (): Promise<{
  specialties: Specialty[];
  total: number;
}> => {
  const specialties = await prisma.specialty.findMany();
  const total = await prisma.specialty.count();
  return {
    specialties,
    total,
  };
};

const updateSpecialty = async (
  id: string,
  payload: Partial<Specialty>,
): Promise<Specialty> => {
  const specialty = await prisma.specialty.update({
    where: { id },
    data: payload,
  });
  return specialty;
};

const deleteSpecialty = async (id: string): Promise<Specialty | null> => {
  const specialty = await prisma.specialty.delete({
    where: { id },
  });
  return specialty;
};

export const SpecialtyService = {
  createSpecialty,
  getSpecialties,
  deleteSpecialty,
  updateSpecialty,
};
