import status from "http-status";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { AuthService } from "./auth.service";
import { TokenUtils } from "../../utils/token";
import AppError from "../../errorHelpers/AppError";

const registerPatient = catchAsync(async (req, res) => {
  const payload = req.body;
  const result = await AuthService.registerPatient(payload);
  const { accessToken, refreshToken, token, ...rest } = result;

  TokenUtils.setAccessTokenCookie(res, accessToken);
  TokenUtils.setRefreshTokenCookie(res, refreshToken);
  TokenUtils.setBetterAuthSessionCookie(res, token as string);

  sendResponse(res, {
    httpStatus: status.CREATED,
    success: true,
    message: "User registered successfully",
    data: {
      ...rest,
      accessToken,
      refreshToken,
      token,
    },
  });
});

const loginUser = catchAsync(async (req, res) => {
  const payload = req.body;
  const result = await AuthService.loginUser(payload);
  const { accessToken, refreshToken, token, ...rest } = result;

  TokenUtils.setAccessTokenCookie(res, accessToken);
  TokenUtils.setRefreshTokenCookie(res, refreshToken);
  TokenUtils.setBetterAuthSessionCookie(res, token);

  sendResponse(res, {
    httpStatus: status.OK,
    success: true,
    message: "User logged in successfully",
    data: {
      ...rest,
      accessToken,
      refreshToken,
      token,
    },
  });
});

const getMe = catchAsync(async (req, res) => {
  console.log("user", req.user);
  const result = await AuthService.getMe(req.user!);
  sendResponse(res, {
    httpStatus: status.OK,
    success: true,
    message: "User fetched successfully",
    data: result,
  });
});

const getNewToken = catchAsync(async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) {
    throw new AppError(status.UNAUTHORIZED, "Refresh token not found");
  }
  const betterAuthSessionToken = req.cookies["better-auth.session_token"];
  if (!betterAuthSessionToken) {
    throw new AppError(status.UNAUTHORIZED, "Session token not found");
  }
  const result = await AuthService.getNewToken(
    refreshToken,
    betterAuthSessionToken,
  );
  const { accessToken, refreshToken: newRefreshToken, sessionToken } = result;

  TokenUtils.setAccessTokenCookie(res, accessToken);
  TokenUtils.setRefreshTokenCookie(res, newRefreshToken);
  TokenUtils.setBetterAuthSessionCookie(res, sessionToken);
  sendResponse(res, {
    httpStatus: status.OK,
    success: true,
    message: "Token refreshed successfully",
    data: {
      accessToken,
      refreshToken: newRefreshToken,
      sessionToken,
    },
  });
});

export const AuthController = {
  registerPatient,
  loginUser,
  getMe,
  getNewToken,
};
