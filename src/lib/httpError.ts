/**
 * Error carrying an HTTP status + optional machine code. Thrown from Fastify
 * preHandler hooks (httpAuth, validate) so the lifecycle halts reliably — in
 * Fastify v5, returning a sent reply from an async hook does NOT stop the
 * handler from running, but a thrown error does. The setErrorHandler maps these
 * to the normalized { error, code } envelope.
 */
export class HttpError extends Error {
  statusCode: number;
  code?: string;

  constructor(statusCode: number, message: string, code?: string) {
    super(message);
    this.name = "HttpError";
    this.statusCode = statusCode;
    this.code = code;
  }
}
