import { Hono } from "hono";
import type { Env } from './core-utils';
import { UserEntity, ModificationRequestEntity, ActivityLogEntity, NotificationEntity } from "./entities";
import { ok, bad, notFound } from './core-utils';
import { RequestStatus, User, UserStatus, ModificationRequest } from "@shared/types";
import { isAfter, isBefore, parseISO } from 'date-fns';
// Helper to create logs and notifications
const createLog = async (env: Env, userId: string, userName: string, action: string, targetId: string, details?: string) => {
  await ActivityLogEntity.create(env, {
    id: crypto.randomUUID(),
    userId,
    userName,
    action,
    targetId,
    details,
    timestamp: new Date().toISOString(),
  });
};
const createNotification = async (env: Env, userId: string, message: string, requestId: string | null) => {
  await NotificationEntity.create(env, {
    id: crypto.randomUUID(),
    userId,
    message,
    requestId,
    isRead: false,
    timestamp: new Date().toISOString(),
  });
};
export function userRoutes(app: Hono<{ Bindings: Env }>) {
  app.use('/api/*', async (c, next) => {
    await UserEntity.ensureSeed(c.env);
    await ModificationRequestEntity.ensureSeed(c.env);
    await next();
  });
  // USERS
  app.get('/api/users', async (c) => {
    const page = await UserEntity.list(c.env, null, 100);
    return ok(c, page);
  });
  app.post('/api/users', async (c) => {
    const { name, role } = await c.req.json<Partial<User>>();
    if (!name?.trim() || !role) return bad(c, 'Name and role are required');
    const user = await UserEntity.create(c.env, { id: crypto.randomUUID(), name: name.trim(), role, status: 'Active' });
    // TODO: Replace 'user-1' and 'Admin User' with authenticated user context when available
    await createLog(c.env, 'user-1', 'Admin User', 'Created User', user.id, `Name: ${user.name}, Role: ${user.role}`);
    return ok(c, user);
  });
  app.put('/api/users/:id', async (c) => {
    const { id } = c.req.param();
    const { name, role, status } = await c.req.json<Partial<User>>();
    const userEntity = new UserEntity(c.env, id);
    if (!await userEntity.exists()) return notFound(c, 'User not found');
    const updatedUser = await userEntity.mutate(current => ({
      ...current,
      name: name?.trim() || current.name,
      role: role || current.role,
      status: status || current.status,
    }));
    // TODO: Replace 'user-1' and 'Admin User' with authenticated user context when available
    await createLog(c.env, 'user-1', 'Admin User', 'Updated User', id, `Name: ${updatedUser.name}, Role: ${updatedUser.role}, Status: ${updatedUser.status}`);
    return ok(c, updatedUser);
  });
  app.delete('/api/users/:id', async (c) => {
    const { id } = c.req.param();
    const deleted = await UserEntity.delete(c.env, id);
    if (!deleted) return notFound(c, 'User not found');
    // TODO: Replace 'user-1' and 'Admin User' with authenticated user context when available
    await createLog(c.env, 'user-1', 'Admin User', 'Deleted User', id);
    return ok(c, { id, deleted });
  });
  // MODIFICATION REQUESTS
  app.get('/api/requests', async (c) => {
    const { q, status, type, from, to } = c.req.query();
    const page = await ModificationRequestEntity.list(c.env, null, 200);
    let items = page.items;
    if (q) {
      items = items.filter(r => r.fullName.toLowerCase().includes(q.toLowerCase()) || r.nin.includes(q));
    }
    if (status) items = items.filter(r => r.status === status);
    if (type) items = items.filter(r => r.requestType === type);
    if (from) items = items.filter(r => isAfter(parseISO(r.submittedAt), parseISO(from)));
    if (to) items = items.filter(r => isBefore(parseISO(r.submittedAt), parseISO(to)));
    return ok(c, { items, next: null });
  });
  app.post('/api/requests', async (c) => {
    const { nin, fullName, requestType, details, createdBy, submittedAt } = await c.req.json<Partial<ModificationRequest> & { createdBy: string }>();
    if (!nin || !fullName || !requestType || !details || !createdBy) {
      return bad(c, 'Missing required fields for creating a request.');
    }
    const newId = `REQ-${String(Date.now()).slice(-6)}`;
    const submissionTimestamp = submittedAt ? new Date(submittedAt).toISOString() : new Date().toISOString();
    const newRequest: ModificationRequest = {
      id: newId,
      nin,
      fullName,
      requestType,
      details: { ...details, documents: [] }, // Documents not handled in this phase
      status: 'Pending',
      assignedToId: null,
      submittedAt: submissionTimestamp,
      history: [
        {
          status: 'Pending',
          updatedAt: submissionTimestamp,
          updatedBy: createdBy,
          notes: 'Request submitted.',
        },
      ],
    };
    const created = await ModificationRequestEntity.create(c.env, newRequest);
    // TODO: Replace 'user-1' with authenticated user ID when available
    await createLog(c.env, 'user-1', createdBy, 'Created Request', newId, `Type: ${requestType}`);
    return ok(c, created);
  });
  app.get('/api/requests/:id', async (c) => {
    const { id } = c.req.param();
    const requestEntity = new ModificationRequestEntity(c.env, id);
    if (!await requestEntity.exists()) return notFound(c, 'Request not found');
    return ok(c, await requestEntity.getState());
  });
  app.put('/api/requests/:id', async (c) => {
    const { id } = c.req.param();
    const { status, notes, updatedBy, assignedToId } = await c.req.json<{ status?: RequestStatus, notes?: string, updatedBy?: string, assignedToId?: string }>();
    const requestEntity = new ModificationRequestEntity(c.env, id);
    if (!await requestEntity.exists()) return notFound(c, 'Request not found');
    const updatedRequest = await requestEntity.mutate(current => {
      const newState = { ...current };
      if (status && updatedBy) {
        newState.status = status;
        newState.history = [...current.history, { status, updatedAt: new Date().toISOString(), updatedBy, notes: notes || undefined }];
      } else if (notes && updatedBy) {
        // Handle note-only updates by adding to history without changing status
        newState.history = [...current.history, { status: current.status, updatedAt: new Date().toISOString(), updatedBy, notes }];
      }
      if (assignedToId !== undefined) {
        newState.assignedToId = assignedToId;
      }
      return newState;
    });
    // Log and notify
    if (status && updatedBy) {
      // The `updatedBy` from the client is the user's name. The user ID for logging is not available in this context.
      // TODO: Replace 'user-1' with authenticated user ID when available.
      await createLog(c.env, 'user-1', updatedBy, `Updated Status to ${status}`, id, notes);
      if (updatedRequest.assignedToId) {
        await createNotification(c.env, updatedRequest.assignedToId, `Status of request ${id} updated to ${status}`, id);
      }
    }
    if (assignedToId) {
      const staffUser = await new UserEntity(c.env, assignedToId).getState();
      // TODO: Replace 'user-1' and 'Admin User' with authenticated user context when available
      await createLog(c.env, 'user-1', 'Admin User', `Assigned Request`, id, `Assigned to: ${staffUser.name}`);
      await createNotification(c.env, assignedToId, `You have been assigned a new request: ${id}`, id);
    }
    return ok(c, updatedRequest);
  });
  // NOTIFICATIONS
  app.get('/api/notifications', async (c) => {
    const page = await NotificationEntity.list(c.env, null, 50);
    page.items.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    return ok(c, page);
  });
  app.put('/api/notifications/:id', async (c) => {
    const { id } = c.req.param();
    const { isRead } = await c.req.json<{ isRead: boolean }>();
    const notifEntity = new NotificationEntity(c.env, id);
    if (!await notifEntity.exists()) return notFound(c, 'Notification not found');
    const updated = await notifEntity.mutate(current => ({ ...current, isRead }));
    return ok(c, updated);
  });
  // AUDIT LOGS
  app.get('/api/logs', async (c) => {
    const page = await ActivityLogEntity.list(c.env, null, 200);
    page.items.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    return ok(c, page);
  });
}