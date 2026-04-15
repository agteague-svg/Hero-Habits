import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);
const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  const since = new Date();
  since.setDate(since.getDate() - 7);

  // Get all completed tasks from the past 7 days
  const { data: tasks, error } = await supabase
    .from('tasks')
    .select('title, category, points, priority, completed_at, user_id')
    .eq('completed', true)
    .gte('completed_at', since.toISOString());

  if (error) return res.status(500).json({ error: error.message });

  // Get all child profiles
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, child_name, email');

  // Get parent email from parent_settings
  const { data: parentSettings } = await supabase
    .from('parent_settings')
    .select('*')
    .limit(1)
    .single();

  const parentEmail = parentSettings?.email || parentSettings?.parent_email;

  // Group tasks by child
  const byChild = {};
  for (const task of tasks) {
    const profile = profiles?.find(p => p.id === task.user_id);
    const name = profile?.child_name || profile?.email || 'Your child';
    if (!byChild[name]) byChild[name] = [];
    byChild[name].push(task);
  }

  // Build email HTML
  const childSections = Object.entries(byChild).map(([name, childTasks]) => {
    const totalPoints = childTasks.reduce((sum, t) => sum + (t.points || 0), 0);
    const taskRows = childTasks.map(t => `
      <tr>
        <td style="padding:6px 10px;border-bottom:1px solid #f0f0f0">${t.title}</td>
        <td style="padding:6px 10px;border-bottom:1px solid #f0f0f0;color:#888">${t.category || '-'}</td>
        <td style="padding:6px 10px;border-bottom:1px solid #f0f0f0;text-align:center">⭐ ${t.points || 0}</td>
      </tr>`).join('');

    return `
      <h3 style="color:#7c3aed;margin-top:24px">🦸 ${name}</h3>
      <p style="color:#555">Completed <strong>${childTasks.length} tasks</strong> and earned <strong>${totalPoints} points</strong> this week!</p>
      <table style="width:100%;border-collapse:collapse;font-size:14px">
        <thead>
          <tr style="background:#f5f3ff">
            <th style="padding:8px 10px;text-align:left">Task</th>
            <th style="padding:8px 10px;text-align:left">Category</th>
            <th style="padding:8px 10px;text-align:center">Points</th>
          </tr>
        </thead>
        <tbody>${taskRows}</tbody>
      </table>`;
  }).join('');

  const totalAll = tasks.reduce((sum, t) => sum + (t.points || 0), 0);

  const html = `
    <div style="font-family:sans-serif;max-width:600px;margin:auto;padding:24px">
      <h2 style="color:#7c3aed">🌟 Weekly Hero Habits Report</h2>
      <p style="color:#555">Here's how the week went — ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
      <hr style="border:none;border-top:2px solid #f5f3ff;margin:16px 0"/>
      ${childSections.length > 0 ? childSections : '<p style="color:#888">No tasks completed this week.</p>'}
      <hr style="border:none;border-top:2px solid #f5f3ff;margin:24px 0"/>
      <p style="color:#555">Total points earned across all heroes: <strong>${totalAll} ⭐</strong></p>
      <p style="color:#bbb;font-size:12px">Sent automatically every Sunday by Hero Habits 🦸</p>
    </div>`;

  await resend.emails.send({
    from: 'Hero Habits <onboarding@resend.dev>',
    to: parentEmail,
    subject: `🦸 Weekly Hero Habits Report — ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}`,
    html,
  });

  res.status(200).json({ sent: true, tasks: tasks.length, points: totalAll });
}