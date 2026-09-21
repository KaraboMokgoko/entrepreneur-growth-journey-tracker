import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

const SIGNUP_ROLES = ["practitioner", "mentor", "entrepreneur", "funder"];

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    let body = {};
    try { body = await req.json(); } catch (e) { body = {}; }
    const role = String(body.role || '');
    if (!SIGNUP_ROLES.includes(role)) {
      return Response.json({ error: 'Invalid role' }, { status: 400 });
    }

    const svc = base44.asServiceRole;
    await svc.entities.User.update(user.id, { role });

    // Entrepreneurs are auto-linked to an enterprise registered with their email.
    let linkedEnterpriseId = null;
    if (role === 'entrepreneur') {
      const matches = await svc.entities.Enterprise.filter({ founder_email: user.email });
      const enterprise = matches[0];
      if (enterprise) {
        const existingLinks = await svc.entities.UserEnterprise.filter({ user_id: user.id, enterprise_id: enterprise.id });
        if (existingLinks.length === 0) {
          await svc.entities.UserEnterprise.create({ user_id: user.id, enterprise_id: enterprise.id, access_level: 'owner' });
        }
        const assigned = Array.isArray(enterprise.assigned_user_ids) ? enterprise.assigned_user_ids : [];
        if (!assigned.includes(user.id)) {
          await svc.entities.Enterprise.update(enterprise.id, { assigned_user_ids: assigned.concat([user.id]) });
        }
        await svc.entities.User.update(user.id, { enterprise_id: enterprise.id });
        linkedEnterpriseId = enterprise.id;
      }
    }

    return Response.json({ ok: true, role, linkedEnterpriseId });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}