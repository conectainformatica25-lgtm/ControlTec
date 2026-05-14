import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from '../middleware/auth';

const prisma = new PrismaClient();
const router = Router();
router.use(authMiddleware);

router.get('/', async (req: Request, res: Response) => {
  const items = await prisma.device.findMany({ 
    where: { companyId: (req as any).companyId }, 
    include: { customer: { select: { name: true } } },
    orderBy: { createdAt: 'desc' } 
  });
  res.json(items);
});

router.post('/', async (req: Request, res: Response) => {
  const data = { ...req.body, companyId: (req as any).companyId };
  const item = await prisma.device.create({ data });
  res.status(201).json(item);
});

router.put('/:id', async (req: Request, res: Response) => {
  const item = await prisma.device.update({ where: { id: (req.params.id as string) }, data: req.body });
  res.json(item);
});

router.delete('/:id', async (req: Request, res: Response) => {
  await prisma.device.delete({ where: { id: (req.params.id as string) } });
  res.json({ ok: true });
});

export { router as deviceRoutes };
