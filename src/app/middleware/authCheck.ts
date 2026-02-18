/* eslint-disable @typescript-eslint/no-explicit-any */
import status from "http-status";
import AppError from "../errorHelpers/AppError";
import { CookieUtils } from "../utils/cookie";
import { NextFunction, Request, Response } from "express";
import { JWTUtils } from "../utils/jwt";
import { env } from "../config/env";
import { Role, UserStatus } from "../../generated/prisma/enums";
import { prisma } from "../lib/prisma";

const authCheck =
  (...authRoles: Role[]) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // session token
      const sessionToken = CookieUtils.getCookie(
        req,
        "better-auth.session_token",
      );
      if (!sessionToken) {
        throw new Error("Unauthorized access!No session token provided");
      }
      if (sessionToken) {
        const existSession = await prisma.session.findFirst({
          where: {
            token: sessionToken,
            expiresAt: {
              gt: new Date(),
            },
          },
          include: {
            user: true,
          },
        });
        if (existSession && existSession.user) {
          const user = existSession.user;
          const now = new Date();
          const expireAt = new Date(existSession.expiresAt);
          const createdAt = new Date(existSession.createdAt);
          const sessionLifeTime = expireAt.getDate() - createdAt.getTime();
          const timeRemaining = expireAt.getTime() - now.getTime();
          const percentRemaining = (timeRemaining / sessionLifeTime) * 100;
          if (percentRemaining < 20) {
            res.setHeader("X-Session-Refresh", "true");
            res.setHeader("X-Session-Expires-At", expireAt.toISOString());
            res.setHeader("X-Time-Remaining", timeRemaining.toString());
            console.log("Session Expiring Soon!");
          }
          if (
            user.status === UserStatus.BLOCKED ||
            user.status === UserStatus.DELETED
          ) {
            throw new AppError(
              status.UNAUTHORIZED,
              "Unauthorized access! User is not active",
            );
          }
          if (user.isDeleted) {
            throw new AppError(
              status.UNAUTHORIZED,
              "Unauthorized access! User is deleted",
            );
          }
          if (authRoles.length > 0 && !authRoles.includes(user.role)) {
            throw new AppError(
              status.FORBIDDEN,
              "Forbidden access! You do not have permission to access this resources",
            );
          }
          req.user = user;
        }
      }

      // access token
      const accessToken = CookieUtils.getCookie(req, "accessToken");

      if (!accessToken) {
        throw new AppError(
          status.UNAUTHORIZED,
          "Unauthorized: No access token provided",
        );
      }
      const verifiedToken = JWTUtils.verifyToken(
        accessToken,
        env.ACCESS_TOKEN_SECRET,
      );

      if (!verifiedToken) {
        throw new AppError(status.UNAUTHORIZED, "Unauthorized: Invalid token");
      }
      if (
        authRoles.length > 0 &&
        !authRoles.includes(verifiedToken.role as Role)
      ) {
        throw new AppError(status.FORBIDDEN, "Forbidden: Admins only");
      }

      next();
    } catch (error: any) {
      next(error);
    }
  };

export default authCheck;
