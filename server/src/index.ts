import "dotenv/config";
import cors from "cors";
import express, { NextFunction, Request, Response } from "express";

import { asyncHandler } from "./middlewares/asyncHandler.middleware";
import { errorHandler } from "./middlewares/errorHandler.middleware";

import { config } from "./common/config/app.config";
import { HTTPSTATUS } from "./common/config/http.config";
import { connectDatabase } from "./common/config/database";

import fileRoutes from "./routes/files.route";
import uploadRoutes from "./routes/upload.route";
import invoiceRoutes from "./routes/invoice.route";
import extractRoutes from "./routes/extract.route";

const app = express();
const BASE_PATH = config.BASE_PATH;

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use(
  cors({
    origin: config.FRONTEND_ORIGIN,
    credentials: true,
  })
);

app.get(
  `/`,
  asyncHandler(async (_req: Request, res: Response, _next: NextFunction) => {
    return res.status(HTTPSTATUS.OK).json({
      message: "Server is running",
    });
  })
);

app.use(`${BASE_PATH}/upload`, uploadRoutes);
app.use(`${BASE_PATH}/extract`, extractRoutes);
app.use(`${BASE_PATH}/invoices`, invoiceRoutes);
app.use(`${BASE_PATH}/files`, fileRoutes);

app.use(errorHandler);

app.listen(config.PORT, async () => {
  console.log(`Server listening on port ${config.PORT} in ${config.NODE_ENV}`);
  await connectDatabase();
});
