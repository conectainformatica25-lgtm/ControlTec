import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from '../middleware/auth';

const prisma = new PrismaClient();
const router = Router();
router.use(authMiddleware);

router.get('/', async (req: Request, res: Response) => {
  try {
    const items = await prisma.schedule.findMany({ 
      where: { companyId: (req as any).companyId }, 
      include: { customer: { select: { name: true } } },
      orderBy: { date: 'asc' } 
    });
    res.json(items.map(item => ({ ...item, clientName: item.customer?.name || 'Sem Nome' })));
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar agendamentos' });
  }
});

router.get('/date/:date', async (req: Request, res: Response) => {
  try {
    const dateStart = new Date((req.params.date as string));
    const dateEnd = new Date((req.params.date as string));
    dateEnd.setDate(dateEnd.getDate() + 1);
    const items = await prisma.schedule.findMany({ 
      where: { 
        companyId: (req as any).companyId,
        date: { gte: dateStart, lt: dateEnd }
      }, 
      include: { customer: { select: { name: true } } },
      orderBy: { time: 'asc' } 
    });
    res.json(items.map(item => ({ ...item, clientName: item.customer?.name || 'Sem Nome' })));
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar agendamentos' });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    console.log('POST /schedules payload:', req.body);
    const { clientName, clientPhone, date, time, duration, service, address, status, priority, technician, notes } = req.body;
    const companyId = (req as any).companyId;

    let customer = await prisma.customer.findFirst({
      where: { name: clientName, companyId }
    });

    if (!customer) {
      customer = await prisma.customer.create({
        data: { name: clientName, phone: clientPhone || '', companyId }
      });
    }

    const item = await prisma.schedule.create({
      data: {
        companyId,
        customerId: customer.id,
        date: new Date(date),
        time: time || '',
        duration: duration || '',
        service: service || '',
        address: address || '',
        status: status || 'Confirmado',
        priority: priority || 'Normal',
        technician: technician || '',
        notes: notes || ''
      }
    });

    res.status(201).json({ ...item, clientName: customer.name });
  } catch (error: any) {
    console.error('Error creating schedule:', error.message);
    res.status(400).json({ error: 'Erro ao criar agendamento: ' + error.message });
  }
});

router.put('/:id', async (req: Request, res: Response) => {
  try {
    console.log('PUT /schedules payload:', req.body);
    const { clientName, clientPhone, date, customer: _c, clientName: _cn, id: _id, ...rest } = req.body;
    const companyId = (req as any).companyId;

    let customerId = rest.customerId;

    if (clientName) {
      let customer = await prisma.customer.findFirst({
        where: { name: clientName, companyId }
      });
      if (!customer) {
        customer = await prisma.customer.create({
          data: { name: clientName, phone: clientPhone || '', companyId }
        });
      }
      customerId = customer.id;
    }

    const dataToUpdate: any = { ...rest };
    if (customerId) dataToUpdate.customerId = customerId;
    if (date) dataToUpdate.date = new Date(date);

    const item = await prisma.schedule.update({
      where: { id: req.params.id as string },
      data: dataToUpdate,
      include: { customer: { select: { name: true } } }
    });

    res.json({ ...item, clientName: item.customer?.name || 'Sem Nome' });
  } catch (error: any) {
    console.error('Error updating schedule:', error.message);
    res.status(400).json({ error: 'Erro ao atualizar agendamento: ' + error.message });
  }
});

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    await prisma.schedule.delete({ where: { id: (req.params.id as string) } });
    res.json({ ok: true });
  } catch (error) {
    res.status(400).json({ error: 'Erro ao excluir agendamento' });
  }
});

export { router as scheduleRoutes };
