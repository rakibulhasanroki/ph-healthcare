import { Request, Response } from "express";
import status from "http-status";

const notFoundHandler = (req: Request, res: Response) => {
  res.status(status.NOT_FOUND).json({
    success: false,
    message: `Not Found ${req.originalUrl}  Route`,
  });
};

export default notFoundHandler;
