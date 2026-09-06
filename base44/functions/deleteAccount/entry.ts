import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const uid = user.id;
    const svc = base44.asServiceRole;

    // Remove all of the user's data across the app's entities.
    await svc.entities.Expense.deleteMany({ created_by_id: uid });
    await svc.entities.Income.deleteMany({ created_by_id: uid });
    await svc.entities.Bill.deleteMany({ created_by_id: uid });
    await svc.entities.Category.deleteMany({ created_by_id: uid });
    await svc.entities.Goal.deleteMany({ created_by_id: uid });
    await svc.entities.Settings.deleteMany({ created_by_id: uid });
    await svc.entities.KeywordRule.deleteMany({ created_by_id: uid });
    await svc.entities.Visit.deleteMany({ created_by_id: uid });
    await svc.entities.Client.deleteMany({ created_by_id: uid });

    // Remove the user account itself.
    try {
      await svc.entities.User.delete(uid);
    } catch (e) {
      console.error('deleteAccount: user record delete failed', e.message);
    }

    return Response.json({ ok: true });
  } catch (error) {
    console.error('deleteAccount error', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
}