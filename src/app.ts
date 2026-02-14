import express, { Application, Request, Response } from "express";
import { IndexRouter } from "./app/router";

const app: Application = express();

app.use(express.urlencoded({ extended: true }));

app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.send("Ph-Healthcare backend is running");
});

app.use("/api/v1", IndexRouter);

export default app;
