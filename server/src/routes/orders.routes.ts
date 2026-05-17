import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from '../middleware/auth';

const prisma = new PrismaClient();
const router = Router();
router.use(authMiddleware);

router.get('/', async (req: Request, res: Response) => {
  const items = await prisma.serviceOrder.findMany({ 
    where: { companyId: (req as any).companyId }, 
    include: { customer: { select: { name: true } }, device: { select: { brand: true, type: true, model: true } } },
    orderBy: { createdAt: 'desc' } 
  });
  res.json(items);
});

const getOrCreateDeviceId = async (deviceId: string, customerId: string, companyId: string, deviceModel?: string) => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (uuidRegex.test(deviceId)) {
    if (deviceModel !== undefined) {
      await prisma.device.update({ where: { id: deviceId }, data: { model: deviceModel } });
    }
    return deviceId;
  }
  
  if (!deviceId) return null;

  let device = await prisma.device.findFirst({
    where: { customerId, type: deviceId, model: deviceModel || '', companyId }
  });
  
  if (!device) {
    device = await prisma.device.create({
      data: {
        customerId,
        companyId,
        type: deviceId,
        brand: 'Diversos',
        model: deviceModel || '',
        status: 'Em diagnóstico'
      }
    });
  }
  return device.id;
};

router.post('/', async (req: Request, res: Response) => {
  try {
    const companyId = (req as any).companyId;
    const { deviceId, customerId, deviceModel, ...rest } = req.body;
    
    const actualDeviceId = await getOrCreateDeviceId(deviceId, customerId, companyId, deviceModel);
    
    const count = await prisma.serviceOrder.count({ where: { companyId } });
    const code = `OS-${String(count + 1).padStart(4, '0')}`;
    const data = { ...rest, customerId, deviceId: actualDeviceId, code, companyId };
    
    const item = await prisma.serviceOrder.create({ data });
    res.status(201).json(item);
  } catch (error) {
    res.status(400).json({ error: 'Erro ao criar OS' });
  }
});

router.put('/:id', async (req: Request, res: Response) => {
  try {
    const companyId = (req as any).companyId;
    const { deviceId, customerId, device, customer, deviceModel, ...rest } = req.body;
    
    const actualDeviceId = await getOrCreateDeviceId(deviceId, customerId, companyId, deviceModel);
    
    const item = await prisma.serviceOrder.update({ 
      where: { id: (req.params.id as string) }, 
      data: { ...rest, customerId, deviceId: actualDeviceId }
    });
    res.json(item);
  } catch (error) {
    res.status(400).json({ error: 'Erro ao atualizar OS' });
  }
});

router.delete('/:id', async (req: Request, res: Response) => {
  await prisma.serviceOrder.delete({ where: { id: (req.params.id as string) } });
  res.json({ ok: true });
});

export { router as orderRoutes };
