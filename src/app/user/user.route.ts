import type { FastifyInstance } from "fastify";
import { httpAuth } from "../../middleware/httpAuth";
import { getUserInsightsController } from "./user.controller";

/**
 * User routes (Fastify plugin). Registered with prefix /api/users.
 */
export default async function userRoutes(app: FastifyInstance) {
  app.get(
    "/me/insights",
    { preHandler: httpAuth },
    getUserInsightsController,
  );
}
