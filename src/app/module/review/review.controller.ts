import status from "http-status";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { ReviewService } from "./review.service";

const createReview = catchAsync(async (req, res) => {
  const payload = req.body;
  const user = req.user!;
  const result = await ReviewService.createReview(user, payload);
  sendResponse(res, {
    httpStatus: status.CREATED,
    success: true,
    message: "Review created successfully",
    data: result,
  });
});

const getAllReviews = catchAsync(async (req, res) => {
  const result = await ReviewService.getAllReviews();
  sendResponse(res, {
    httpStatus: status.OK,
    success: true,
    message: "Reviews retrieved successfully",
    data: result,
  });
});

const getMyReviews = catchAsync(async (req, res) => {
  const user = req.user!;
  const result = await ReviewService.getMyReviews(user);
  sendResponse(res, {
    httpStatus: status.OK,
    success: true,
    message: "Reviews retrieved successfully",
    data: result,
  });
});

const updateReview = catchAsync(async (req, res) => {
  const { id } = req.params;
  const payload = req.body;

  const user = req.user!;
  const result = await ReviewService.updateReview(user, id as string, payload);
  sendResponse(res, {
    httpStatus: status.OK,
    success: true,
    message: "Review updated successfully",
    data: result,
  });
});

const deleteReview = catchAsync(async (req, res) => {
  const { id } = req.params;
  const user = req.user!;
  const result = await ReviewService.deleteReview(id as string, user);
  sendResponse(res, {
    httpStatus: status.OK,
    success: true,
    message: "Review deleted successfully",
    data: result,
  });
});

export const ReviewController = {
  createReview,
  getAllReviews,
  getMyReviews,
  updateReview,
  deleteReview,
};
