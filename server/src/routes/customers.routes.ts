import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from '../middleware/auth';

const prisma = new PrismaClient();
const router = Router();
router.use(authMiddleware);

router.get('/', async (req: Request, res: Response) => {
  const items = await prisma.customer.findMany({ where: { companyId: (req as any).companyId }, orderBy: { createdAt: 'desc' } });
  res.json(items);
});

router.post('/', async (req: Request, res: Response) => {
  const data = { ...req.body, companyId: (req as any).companyId };
  const item = await prisma.customer.create({ data });
  res.status(201).json(item);
});

router.put('/:id', async (req: Request, res: Response) => {
  const item = await prisma.customer.update({ where: { id: (req.params.id as string) }, data: req.body });
  res.json(item);
});

router.delete('/:id', async (req: Request, res: Response) => {
  await prisma.customer.delete({ where: { id: (req.params.id as string) } });
  res.json({ ok: true });
});

export { router as customerRoutes };
