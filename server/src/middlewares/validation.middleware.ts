import { ZodSchema } from "zod";
import { Request, Response, NextFunction } from "express";

export const validateBody = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      res.status(400).json({
        success: false,
        error: "Validation failed",
        details: error,
      });
    }
  };
};

export const validateQuery = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.query);
      next();
    } catch (error) {
      res.status(400).json({
        success: false,
        error: "Query validation failed",
        details: error,
      });
    }
  };
};
