import status from "http-status";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { StatsService } from "./stats.service";

const getStats = catchAsync(async (req, res) => {
  const user = req.user!;
  const result = await StatsService.getStats(user);
  sendResponse(res, {
    httpStatus: status.OK,
    success: true,
    message: "Stats retrieved successfully",
    data: result,
  });
});

export const StatsController = {
  getStats,
};
