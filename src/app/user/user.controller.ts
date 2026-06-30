import type { FastifyRequest, FastifyReply } from "fastify";
import { getUserInsightByUserId } from "./user.service";
import { ok, err } from "../../contract/envelope";

export async function getUserInsightsController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const userId = request.user?.id; // set by httpAuth preHandler

    if (!userId) {
      return reply.code(401).send(err("Unauthorized", "UNAUTHORIZED"));
    }

    const insight = await getUserInsightByUserId(userId);

    if (!insight) {
      return reply.code(404).send(err("No insights found", "NOT_FOUND"));
    }

    return reply.code(200).send(ok(insight));
  } catch (error) {
    console.error("Get user insights error:", error);
    return reply.code(500).send(err("Internal server error", "INTERNAL"));
  }
}
