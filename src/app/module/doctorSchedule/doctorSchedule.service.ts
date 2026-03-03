import {
  ICreateMyDoctorSchedulePayload,
  IUpdateMyDoctorSchedulePayload,
} from "./doctorSchedule.interface";
import { prisma } from "../../lib/prisma";
import { IQueryParams } from "../../interfaces/query.interface";
import { DoctorSchedules, Prisma } from "../../../generated/prisma/client";
import { QueryBuilder } from "../../utils/QueryBuilder";
import {
  doctorScheduleFilterableFields,
  doctorScheduleIncludeConfig,
  doctorScheduleSearchableFields,
} from "./doctorSchedule.constant";

const createMyDoctorSchedule = async (
  user: Express.User,
  payload: ICreateMyDoctorSchedulePayload,
) => {
  const doctorData = await prisma.doctor.findUniqueOrThrow({
    where: {
      email: user.email,
    },
  });
  const doctorScheduleData = payload.scheduleIds.map((scheduleId) => ({
    doctorId: doctorData.id,
    scheduleId,
  }));
  const result = await prisma.doctorSchedules.createMany({
    data: doctorScheduleData,
  });
  return result;
};

const getAllDoctorSchedule = async (query: IQueryParams) => {
  const queryBuilder = new QueryBuilder<
    DoctorSchedules,
    Prisma.DoctorSchedulesWhereInput,
    Prisma.DoctorSchedulesInclude
  >(prisma.doctorSchedules, query, {
    filterableFields: doctorScheduleFilterableFields,
    searchableFields: doctorScheduleSearchableFields,
  });

  const result = await queryBuilder
    .search()
    .filter()
    .paginate()
    .dynamicInclude(doctorScheduleIncludeConfig)
    .sort()
    .execute();
  return result;
};

const getMyDoctorSchedule = async (user: Express.User, query: IQueryParams) => {
  const doctorData = await prisma.doctor.findUniqueOrThrow({
    where: {
      email: user.email,
    },
  });

  const queryBuilder = new QueryBuilder<
    DoctorSchedules,
    Prisma.DoctorSchedulesWhereInput,
    Prisma.DoctorSchedulesInclude
  >(
    prisma.doctorSchedules,
    {
      doctorId: doctorData.id,
      ...query,
    },
    {
      filterableFields: doctorScheduleFilterableFields,
      searchableFields: doctorScheduleSearchableFields,
    },
  );

  const result = await queryBuilder
    .search()
    .filter()
    .paginate()
    .includes({
      doctor: {
        include: {
          user: true,
        },
      },
      schedule: true,
    })
    .sort()
    .fields()
    .dynamicInclude(doctorScheduleIncludeConfig)
    .execute();
  return result;
};
const getDoctorScheduleById = async (doctorId: string, scheduleId: string) => {
  const doctorSchedule = await prisma.doctorSchedules.findUnique({
    where: {
      doctorId_scheduleId: {
        doctorId,
        scheduleId,
      },
    },
    include: {
      schedule: true,
      doctor: true,
    },
  });
  return doctorSchedule;
};
const updateMyDoctorSchedule = async (
  user: Express.User,
  payload: IUpdateMyDoctorSchedulePayload,
) => {
  const doctorData = await prisma.doctor.findUniqueOrThrow({
    where: {
      email: user.email,
    },
  });
  const deleteIds = payload.scheduleIds
    .filter((schedule) => schedule.shouldDelete)
    .map((schedule) => schedule.id);

  const createIds = payload.scheduleIds
    .filter((schedule) => !schedule.shouldDelete)
    .map((schedule) => schedule.id);

  const result = await prisma.$transaction(async (tx) => {
    await tx.doctorSchedules.deleteMany({
      where: {
        isBooked: false,
        doctorId: doctorData.id,
        scheduleId: {
          in: deleteIds,
        },
      },
    });
    const doctorScheduleData = createIds.map((scheduleId) => ({
      doctorId: doctorData.id,
      scheduleId,
    }));
    const result = await tx.doctorSchedules.createMany({
      data: doctorScheduleData,
    });
    return result;
  });

  return result;
};
const deleteMyDoctorSchedule = async (id: string, user: Express.User) => {
  const doctorData = await prisma.doctor.findUniqueOrThrow({
    where: {
      email: user.email,
    },
  });
  const result = await prisma.doctorSchedules.deleteMany({
    where: {
      isBooked: false,
      doctorId: doctorData.id,
      scheduleId: id,
    },
  });
  return result;
};

export const DoctorScheduleService = {
  createMyDoctorSchedule,
  getAllDoctorSchedule,
  getMyDoctorSchedule,
  getDoctorScheduleById,
  updateMyDoctorSchedule,
  deleteMyDoctorSchedule,
};
