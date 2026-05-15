import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from '../middleware/auth';

const prisma = new PrismaClient();
const router = Router();
router.use(authMiddleware);

router.get('/', async (req: Request, res: Response) => {
  const items = await prisma.estimate.findMany({
    where: { companyId: (req as any).companyId },
    include: {
      customer: { select: { name: true, document: true, phone: true, email: true, address: true } },
      device: { select: { brand: true, type: true } },
      company: { select: { name: true, cnpj: true, phone: true, email: true, address: true } },
    },
    orderBy: { createdAt: 'desc' }
  });
  res.json(items);
});

router.post('/', async (req: Request, res: Response) => {
  const companyId = (req as any).companyId;
  const count = await prisma.estimate.count({ where: { companyId } });
  const code = `ORC-${String(count + 1).padStart(4, '0')}`;
  const data = { ...req.body, code, companyId };
  const item = await prisma.estimate.create({ data });
  res.status(201).json(item);
});

router.put('/:id', async (req: Request, res: Response) => {
  const item = await prisma.estimate.update({ where: { id: (req.params.id as string) }, data: req.body });
  res.json(item);
});

router.delete('/:id', async (req: Request, res: Response) => {
  await prisma.estimate.delete({ where: { id: (req.params.id as string) } });
  res.json({ ok: true });
});

export { router as estimateRoutes };
