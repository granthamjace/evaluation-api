import express from "express";
import { json } from "express";
import cors from "cors";
import { env } from "./config/env";
import { logger } from "./config/logger";
import { errorHandler } from "./middlewares/errorHandler";
import { userRouter } from "./modules/users/user.router";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./docs/swagger";
import { authRouter } from "./modules/auth/auth.router";
import { projectRouter } from "./modules/projects/project.router";

export const createApp = () => {
  const app = express();

  app.use(cors());
  app.use(json());

  // basic request logging
  app.use((req, _res, next) => {
    logger.info(`${req.method} ${req.url}`);
    next();
  });

  app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  app.use("/auth", authRouter);

  app.use("/users", userRouter);

  app.use("/projects", projectRouter);

  // error handler should be last
  app.use(errorHandler);

  return app;
};
