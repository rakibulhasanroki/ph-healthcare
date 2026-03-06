/* eslint-disable @typescript-eslint/no-explicit-any */
import Stripe from "stripe";
import { prisma } from "../../lib/prisma";
import { PaymentStatus } from "../../../generated/prisma/enums";
import { generateInvoicePdf } from "./payment.utils";

import { uploadFileToCloudinary } from "../../config/cloudinary.config";
import { sendEmail } from "../../utils/email";

const handelStripeWebhookEvent = async (event: Stripe.Event) => {
  const existingPayment = await prisma.payment.findFirst({
    where: {
      stripeEventId: event.id,
    },
  });
  if (existingPayment) {
    console.log(`Event ${event.id} already processed. Skipping...`);
    return { message: `Event ${event.id} already processed. Skipping...` };
  }
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const appointmentId = session.metadata?.appointmentId;
      const paymentId = session.metadata?.paymentId;

      if (!appointmentId || !paymentId) {
        console.log("Missing appointmentId or paymentId");
        return { message: "Missing appointmentId or paymentId" };
      }
      const appointment = await prisma.appointment.findUnique({
        where: {
          id: appointmentId,
        },
        include: {
          payment: true,
          patient: true,
          doctor: true,
          schedule: true,
        },
      });

      if (!appointment) {
        console.log(`Appointment with id ${appointmentId} not found`);
        return { message: `Appointment with id ${appointmentId} not found` };
      }
      let pdfBuffer: Buffer | null = null;
      const result = await prisma.$transaction(async (tx) => {
        const updatedAppointment = await tx.appointment.update({
          where: {
            id: appointmentId,
          },
          data: {
            paymentStatus:
              session.payment_status === "paid"
                ? PaymentStatus.PAID
                : PaymentStatus.UNPAID,
          },
        });

        let invoiceUrl = null;

        if (session.payment_status === "paid") {
          try {
            pdfBuffer = await generateInvoicePdf({
              invoiceId: appointment.payment?.id || paymentId,
              patientName: appointment.patient.name,
              patientEmail: appointment.patient.email,
              doctorName: appointment.doctor.name,
              appointmentDate: appointment.schedule.startDateTime.toString(),
              amount: appointment.payment?.amount || 0,
              transactionId: appointment.payment?.transactionId || "",
              paymentDate: new Date().toISOString(),
            });
            const cloudinaryResponse = await uploadFileToCloudinary(
              pdfBuffer,
              `ph-healthcare/invoices/invoice-${paymentId}.pdf`,
            );
            invoiceUrl = cloudinaryResponse?.secure_url;
            console.log(
              `Invoice PDF generated and uploaded to Cloudinary: ${paymentId}`,
            );
          } catch (error) {
            console.error("Error generating invoice PDF:", error);
          }
        }
        const updatedPayment = await tx.payment.update({
          where: {
            id: paymentId,
          },
          data: {
            stripeEventId: event.id,
            status:
              session.payment_status === "paid"
                ? PaymentStatus.PAID
                : PaymentStatus.UNPAID,
            paymentGatewayData: session as any,
            invoiceUrl: invoiceUrl,
          },
        });
        return {
          updatedAppointment,
          updatedPayment,
          invoiceUrl,
        };
      });
      if (session.payment_status === "paid" && result.invoiceUrl) {
        try {
          await sendEmail({
            to: appointment.patient.email,
            subject: `Payment Confirmation & Invoice - Appointment with Dr. ${appointment.doctor.name}`,
            templateName: "invoice",
            templateData: {
              invoiceUrl: result.invoiceUrl,
              invoiceId: appointment.payment?.id || paymentId,
              patientName: appointment.patient.name,
              patientEmail: appointment.patient.email,
              doctorName: appointment.doctor.name,
              appointmentDate: new Date(
                appointment.schedule.startDateTime,
              ).toLocaleDateString(),
              amount: appointment.payment?.amount || 0,
              transactionId: appointment.payment?.transactionId || "",
              paymentDate: new Date().toISOString(),
            },
            attachments: [
              {
                filename: `invoice-${paymentId}.pdf`,
                content: pdfBuffer || Buffer.from(""),
                contentType: "application/pdf",
              },
            ],
          });
          console.log(`Invoice email send to ${appointment.patient.email}`);
        } catch (error) {
          console.error("Error sending invoice email:", error);
        }
      }

      console.log(
        `Processed checkout.session.completed for appointmentId: ${appointmentId} and paymentId: ${paymentId}`,
      );
      break;
    }
    case "checkout.session.expired": {
      const session = event.data.object as Stripe.Checkout.Session;
      console.log(
        `Checkout session ${session.id} expired.Marking associated payment as failed`,
      );

      break;
    }
    case "payment_intent.payment_failed": {
      const session = event.data.object as Stripe.PaymentIntent;
      console.log(
        `Payment intent ${session.id} failed.Marking associated payment as failed`,
      );
      break;
    }
    default:
      console.log(`Unhandled event type: ${event.type}`);
  }
  return { message: `Webhook Event ${event.id} successfully processed` };
};

export const PaymentService = {
  handelStripeWebhookEvent,
};
