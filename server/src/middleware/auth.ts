import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'controltec-secret-2026';

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ error: 'Token não fornecido' });

  const token = header.replace('Bearer ', '');
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; companyId: string };
    (req as any).userId = decoded.userId;
    (req as any).companyId = decoded.companyId;
    next();
  } catch {
    return res.status(401).json({ error: 'Token inválido' });
  }
}
