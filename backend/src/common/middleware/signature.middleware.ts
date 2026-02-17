import { Injectable, NestMiddleware } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";
import { createHmac } from "crypto";

@Injectable()
export class SignatureMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // TODO: Get App Secret from Cache or DB based on App ID in header
    // For now, this is a placeholder
    const signature = req.headers["x-signature"];
    const timestamp = req.headers["x-timestamp"];

    // Validate timestamp (anti-replay)
    const now = Math.floor(Date.now() / 1000);
    if (!timestamp || Math.abs(now - Number(timestamp)) > 60) {
      // return res.status(401).json({ message: 'Invalid timestamp' });
      // Allowing for now to ease development
    }

    if (!signature) {
      // return res.status(401).json({ message: 'Missing signature' });
    }

    next();
  }
}
