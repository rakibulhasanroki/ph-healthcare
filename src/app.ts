import express, { Application, Request, Response } from "express";
import { IndexRouter } from "./app/router";
import globalErrorHandler from "./app/middleware/globalError.Handler";
import notFoundHandler from "./app/middleware/notFoundHandler";

const app: Application = express();

app.use(express.urlencoded({ extended: true }));

app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.send("Ph-Healthcare backend is running");
});

app.use("/api/v1", IndexRouter);

app.use(globalErrorHandler);
app.use(notFoundHandler);

export default app;
