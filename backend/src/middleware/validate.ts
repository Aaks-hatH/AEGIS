import type { NextFunction, Request, Response } from "express";
import type { ZodSchema } from "zod";
import { ZodError } from "zod";
import { sanitizeObject } from "../utils/sanitize.js";

export const validate = (schema: ZodSchema) => (req: Request, _res: Response, next: NextFunction) => {
  try {
    req.body = sanitizeObject(req.body);
    const parsed = schema.parse({ body: req.body, params: req.params, query: req.query });
    if (parsed.body !== undefined) req.body = parsed.body;
    if (parsed.params) Object.assign(req.params, parsed.params);
    if (parsed.query) Object.assign(req.query as Record<string, unknown>, parsed.query);
    next();
  } catch (err) {
    if (err instanceof ZodError) return next(err);
    next(err);
  }
};
