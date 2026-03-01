/* eslint-disable @typescript-eslint/no-explicit-any */
import status from "http-status";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";

import { Request, Response } from "express";
import { env } from "../../config/env";
import { stripe } from "../../config/stripe.config";
import { PaymentService } from "./payment.service";

const handelStripeWebhookEvent = catchAsync(
  async (req: Request, res: Response) => {
    const signature = req.headers["stripe-signature"] as string;
    const webhookSecret = env.STRIPE_WEBHOOK_SECRET;

    if (!signature || !webhookSecret) {
      console.error("Missing Stripe signature or webhook secret");
      return res.status(status.BAD_REQUEST).json({
        message: "Missing Stripe signature or webhook secret",
      });
    }
    let event;
    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        signature,
        webhookSecret,
      );
    } catch (error: any) {
      console.log("Error creating event", error.message);
      return res.status(status.BAD_REQUEST).json({
        message: error.message,
      });
    }

    try {
      const result = await PaymentService.handelStripeWebhookEvent(event);
      sendResponse(res, {
        httpStatus: status.OK,
        success: true,
        message: "Event handled successfully",
        data: result,
      });
    } catch (error: any) {
      console.log("Error creating event", error.message);
      sendResponse(res, {
        httpStatus: status.INTERNAL_SERVER_ERROR,
        success: false,
        message: "Error handling Stripe webhook event",
      });
    }
  },
);

export const PaymentController = {
  handelStripeWebhookEvent,
};
