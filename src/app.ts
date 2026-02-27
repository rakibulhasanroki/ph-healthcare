import express, { Application, Request, Response } from "express";
import { IndexRouter } from "./app/router";
import globalErrorHandler from "./app/middleware/globalError.Handler";
import notFoundHandler from "./app/middleware/notFoundHandler";
import cookieParser from "cookie-parser";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./app/lib/auth";
import path from "path";
import cors from "cors";
import { env } from "./app/config/env";
import qs from "qs";

const app: Application = express();
app.set("query parser", (str: string) => qs.parse(str));
app.set("view engine", "ejs");
app.set("views", path.resolve(process.cwd(), `src/app/templates`));

app.use(
  cors({
    origin: [
      env.FRONTEND_URL,
      env.BETTER_AUTH_URL,
      "http://localhost:3000",
      "http://localhost:5000",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use("/api/auth", toNodeHandler(auth));

app.use(express.urlencoded({ extended: true }));

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req: Request, res: Response) => {
  res.send("Ph-Healthcare backend is running");
});

// Mount API routes
app.use("/api/v1", IndexRouter);

// Global error handling middleware
app.use(globalErrorHandler);
app.use(notFoundHandler);

export default app;
