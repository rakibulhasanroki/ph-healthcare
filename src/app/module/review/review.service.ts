import status from "http-status";
import { PaymentStatus, Role } from "../../../generated/prisma/enums";
import { ICreateReviewPayload, IUpdateReviewPayload } from "./review.interface";
import AppError from "../../errorHelpers/AppError";
import { prisma } from "../../lib/prisma";

const createReview = async (
  user: Express.User,
  payload: ICreateReviewPayload,
) => {
  const patientData = await prisma.patient.findUniqueOrThrow({
    where: {
      email: user.email,
    },
  });

  const appointmentData = await prisma.appointment.findUniqueOrThrow({
    where: {
      id: payload.appointmentId,
    },
  });

  if (appointmentData.paymentStatus !== PaymentStatus.PAID) {
    throw new AppError(status.BAD_REQUEST, "Payment not done");
  }

  if (appointmentData.patientId !== patientData.id) {
    throw new AppError(
      status.BAD_REQUEST,
      "You can only review your own appointment",
    );
  }
  const isReviewExist = await prisma.review.findFirst({
    where: {
      appointmentId: payload.appointmentId,
    },
  });
  if (isReviewExist) {
    throw new AppError(
      status.BAD_REQUEST,
      "You have already reviewed this appointment.You can update your review",
    );
  }

  const result = await prisma.$transaction(async (tx) => {
    const review = await tx.review.create({
      data: {
        ...payload,
        patientId: patientData.id,
        doctorId: appointmentData.doctorId,
      },
    });

    const averageRating = await tx.review.aggregate({
      _avg: {
        rating: true,
      },
      where: {
        doctorId: appointmentData.doctorId,
      },
    });
    await tx.doctor.update({
      where: {
        id: appointmentData.doctorId,
      },
      data: {
        averageRating: averageRating._avg.rating as number,
      },
    });
    return review;
  });
  return result;
};

const getAllReviews = async () => {
  const result = await prisma.review.findMany({
    include: {
      patient: true,
      doctor: true,
      appointment: true,
    },
  });

  return result;
};

const getMyReviews = async (user: Express.User) => {
  const isUserExist = await prisma.user.findUniqueOrThrow({
    where: {
      email: user.email,
    },
  });
  if (isUserExist.role === Role.DOCTOR) {
    const doctorData = await prisma.doctor.findUniqueOrThrow({
      where: {
        email: user.email,
      },
    });
    return await prisma.review.findMany({
      where: {
        doctorId: doctorData.id,
      },
      include: {
        patient: true,
        appointment: true,
      },
    });
  }
  if (isUserExist.role === Role.PATIENT) {
    const patientData = await prisma.patient.findUniqueOrThrow({
      where: {
        email: user.email,
      },
    });
    return await prisma.review.findMany({
      where: {
        patientId: patientData.id,
      },
      include: {
        doctor: true,
        appointment: true,
      },
    });
  }
};

const updateReview = async (
  user: Express.User,
  reviewId: string,
  payload: IUpdateReviewPayload,
) => {
  const patientData = await prisma.patient.findUniqueOrThrow({
    where: {
      email: user.email,
    },
  });
  const reviewData = await prisma.review.findUniqueOrThrow({
    where: {
      id: reviewId,
    },
  });
  if (!(patientData.id === reviewData.patientId)) {
    throw new AppError(
      status.BAD_REQUEST,
      "You can only update your own review",
    );
  }
  const result = await prisma.$transaction(async (tx) => {
    const updatedReview = await tx.review.update({
      where: {
        id: reviewId,
      },
      data: {
        ...payload,
      },
    });
    const averageRating = await tx.review.aggregate({
      _avg: {
        rating: true,
      },
      where: {
        doctorId: reviewData.doctorId,
      },
    });
    await tx.doctor.update({
      where: {
        id: reviewData.doctorId,
      },
      data: {
        averageRating: averageRating._avg.rating as number,
      },
    });
    return updatedReview;
  });
  return result;
};

const deleteReview = async (reviewId: string, user: Express.User) => {
  const reviewData = await prisma.review.findUniqueOrThrow({
    where: {
      id: reviewId,
    },
  });
  const patientData = await prisma.patient.findUniqueOrThrow({
    where: {
      email: user.email,
    },
  });
  if (!(patientData.id === reviewData.patientId)) {
    throw new AppError(
      status.BAD_REQUEST,
      "You can only delete your own review",
    );
  }
  const result = await prisma.$transaction(async (tx) => {
    const deletedReview = await tx.review.delete({
      where: {
        id: reviewId,
      },
    });
    const averageRating = await tx.review.aggregate({
      _avg: {
        rating: true,
      },
      where: {
        doctorId: deletedReview.doctorId,
      },
    });
    await tx.doctor.update({
      where: {
        id: deletedReview.doctorId,
      },
      data: {
        averageRating: averageRating._avg.rating as number,
      },
    });
    return deletedReview;
  });
  return result;
};

export const ReviewService = {
  createReview,
  getAllReviews,
  getMyReviews,
  updateReview,
  deleteReview,
};
