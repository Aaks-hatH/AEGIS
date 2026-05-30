import type { NextFunction, Request, Response } from "express";
import type { ZodSchema } from "zod";
import { sanitizeObject } from "../utils/sanitize.js";
export const validate = (schema: ZodSchema) => (req: Request, _res: Response, next: NextFunction) => {
  req.body = sanitizeObject(req.body);
  const parsed = schema.parse({ body: req.body, params: req.params, query: req.query });
  req.body = parsed.body ?? req.body; req.params = parsed.params ?? req.params; req.query = parsed.query ?? req.query;
  next();
};
