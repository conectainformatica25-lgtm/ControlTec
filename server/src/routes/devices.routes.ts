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

const getOrCreateCustomerId = async (customerNameOrId: string, companyId: string) => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (uuidRegex.test(customerNameOrId)) return customerNameOrId;
  
  if (!customerNameOrId) return null;

  let customer = await prisma.customer.findFirst({
    where: { name: customerNameOrId, companyId }
  });
  
  if (!customer) {
    customer = await prisma.customer.create({
      data: {
        name: customerNameOrId,
        companyId,
        phone: ''
      }
    });
  }
  return customer.id;
};

router.post('/', async (req: Request, res: Response) => {
  try {
    const companyId = (req as any).companyId;
    const { customerId, ...rest } = req.body;
    
    const actualCustomerId = await getOrCreateCustomerId(customerId, companyId);
    
    const data = { ...rest, customerId: actualCustomerId, companyId };
    const item = await prisma.device.create({ data });
    res.status(201).json(item);
  } catch (error: any) {
    res.status(400).json({ error: 'Erro ao criar aparelho: ' + error.message });
  }
});

router.put('/:id', async (req: Request, res: Response) => {
  try {
    const companyId = (req as any).companyId;
    const { customerId, customer, ...rest } = req.body;
    
    const actualCustomerId = await getOrCreateCustomerId(customerId, companyId);
    
    const item = await prisma.device.update({ 
      where: { id: req.params.id as string }, 
      data: { ...rest, customerId: actualCustomerId } 
    });
    res.json(item);
  } catch (error: any) {
    res.status(400).json({ error: 'Erro ao atualizar aparelho: ' + error.message });
  }
});

router.delete('/:id', async (req: Request, res: Response) => {
  await prisma.device.delete({ where: { id: (req.params.id as string) } });
  res.json({ ok: true });
});

export { router as deviceRoutes };

