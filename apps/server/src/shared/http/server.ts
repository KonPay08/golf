import express from "express";
import cors from "cors";
import morgan from "morgan";
import { errorHandler, notFoundHandler } from "~/shared/http/middleware";

export type RouteConfig = {
  path: string;
  router: express.Router;
};

export function createServer(corsOrigin?: string) {
  const app = express();
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cors({ origin: corsOrigin || "*" }));
  app.use(morgan("dev"));
  return app;
}

export function applyRoutes(app: express.Express, routes: RouteConfig[]) {
  routes.forEach(({ path, router }) => {
    app.use(path, router);
  });
}

export function applyErrorHandlers(app: express.Express) {
  app.use(notFoundHandler);
  app.use(errorHandler);
}

export function startServer(app: express.Express, port: number) {
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
}