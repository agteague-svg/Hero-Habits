import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);
const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  // Get the past 7 days
  const since = new Date();
  since.setDate(since.getDate() - 7);

  // Fetch completed tasks from Supabase
  const { data: tasks, error } = await supabase
    .from('tasks') // 👈 change this to your actual table name
    .select('*')
    .gte('completed_at', since.toISOString())
    .eq('completed', true);

  if (error) return res.status(500).json({ error: error.message });

  // Build the email
  const taskList = tasks.length > 0
    ? tasks.map(t => `<li>${t.title} ✅</li>`).join('')
    : '<li>No tasks completed this week</li>';

  await resend.emails.send({
    from: 'Hero Habits <onboarding@resend.dev>', // free Resend address
    to: 'DAD_EMAIL_HERE@gmail.com', // 👈 replace with dad's email
    subject: '🌸 Weekly Hero Habits Report',
    html: `
      <h2>Weekly Report 🌟</h2>
      <p>Here's what was completed this week:</p>
      <ul>${taskList}</ul>
      <p>Total completed: <strong>${tasks.length} tasks</strong></p>
      <br/>
      <p style="color:gray;font-size:12px">Sent automatically every Sunday by Hero Habits</p>
    `,
  });

  res.status(200).json({ sent: true, tasks: tasks.length });
}