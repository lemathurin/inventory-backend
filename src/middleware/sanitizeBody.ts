import { Request, Response, NextFunction } from "express";
import sanitizeHtml from "sanitize-html";

function sanitizeObject(obj: any) {
  if (typeof obj !== "object" || obj === null) return obj;
  for (const key in obj) {
    if (typeof obj[key] === "string") {
      obj[key] = sanitizeHtml(obj[key]);
    } else if (typeof obj[key] === "object") {
      obj[key] = sanitizeObject(obj[key]);
    }
  }
  return obj;
}

export function sanitizeBody(req: Request, res: Response, next: NextFunction) {
  if (req.body) {
    req.body = sanitizeObject(req.body);
  }
  next();
}
