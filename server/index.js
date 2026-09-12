import express from 'express';
import session from 'express-session';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import { db, normalizedProfile, publicUser } from './db.js';
import { ensureDemoSession, requireAuth } from './middleware/auth.js';

const app = express();
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(session({ secret: process.env.SESSION_SECRET || 'swell-demo-session-secret', resave: false, saveUninitialized: true, cookie: { sameSite: 'lax' } }));
app.use(ensureDemoSession);

const getUser = (id) => db.prepare('SELECT * FROM users WHERE id=?').get(Number(id));
const getProfileRow = (id) => db.prepare('SELECT * FROM profiles WHERE user_id=?').get(Number(id));
const belongsTo = (conversationId, userId) => Boolean(db.prepare('SELECT 1 FROM conversation_members WHERE conversation_id=? AND user_id=?').get(Number(conversationId), userId));
const conversationMembers = (conversationId) => db.prepare('SELECT u.* FROM users u JOIN conversation_members cm ON cm.user_id=u.id WHERE cm.conversation_id=? ORDER BY u.display_name').all(conversationId).map(publicUser);
const messageResponse = (message) => ({ id: message.id, conversationId: message.conversation_id, body: message.body, messageType: message.message_type, createdAt: message.created_at, updatedAt: message.updated_at, deletedAt: message.deleted_at, sender: publicUser({ id: message.sender_id, email: message.email, first_name: message.first_name, last_name: message.last_name, display_name: message.display_name, initials: message.initials, job_title: message.job_title, department: message.department, status: message.status, avatar_url: message.avatar_url, is_current_user: message.is_current_user }) });
const findMessage = (id) => db.prepare(`SELECT m.*,u.email,u.first_name,u.last_name,u.display_name,u.initials,u.job_title,u.department,u.status,u.avatar_url,u.is_current_user FROM messages m JOIN users u ON u.id=m.sender_id WHERE m.id=?`).get(Number(id));
const json = (value, fallback) => JSON.stringify(value ?? fallback);
const workScore = (swellProfile, name) => swellProfile?.traits?.find((trait) => trait.name === name)?.score ?? null;
const dimensionScore = (swellProfile, name) => swellProfile?.workplaceDimensions?.find((dimension) => dimension.name === name)?.score ?? null;
const resetAssessmentFor = (userId) => db.prepare(`UPDATE profiles SET
  profile_complete=0,
  swell_archetype=NULL, mbti=NULL, swell_confidence=NULL,
  analytical=NULL, independence=NULL, goal_orientation=NULL, adaptability=NULL, communication=NULL, collaboration=NULL,
  identity_drive=NULL, mind_reasoning=NULL, leadership_influence=NULL, conflict_repair=NULL, execution_work_style=NULL, social_presence=NULL,
  strengths_json='[]', growth_areas_json='[]', collaboration_json='{}', goals_json='[]', growth_history_json='[]', swell_data_json='{}',
  assessment_responses_json='{}', assessment_state_json='{"status":"welcome","currentIndex":0}'
  WHERE user_id=?`).run(userId);

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body ?? {};
  const user = db.prepare('SELECT * FROM users WHERE email=?').get(String(email || '').toLowerCase());
  if (!user || !bcrypt.compareSync(String(password || ''), user.password_hash)) return res.status(401).json({ error: 'Invalid email or password' });
  req.session.userId = user.id;
  return res.json({ user: publicUser(user) });
});
app.post('/api/auth/logout', (req, res) => req.session.destroy(() => res.json({ ok: true })));
app.get('/api/auth/me', requireAuth, (req, res) => res.json({ user: publicUser(req.user) }));

app.get('/api/users', requireAuth, (_req, res) => res.json({ users: db.prepare('SELECT * FROM users ORDER BY is_current_user DESC, display_name').all().map(publicUser) }));
app.get('/api/users/:id', requireAuth, (req, res) => { const user = getUser(req.params.id); return user ? res.json({ user: publicUser(user) }) : res.status(404).json({ error: 'User not found' }); });
app.get('/api/users/:id/profile', requireAuth, (req, res) => { const user = getUser(req.params.id); const profile = getProfileRow(req.params.id); const response = normalizedProfile(user, profile); return response ? res.json(response) : res.status(404).json({ error: 'Profile not found' }); });
app.get('/api/me/profile', requireAuth, (req, res) => res.json(normalizedProfile(req.user, getProfileRow(req.user.id))));
app.patch('/api/me/profile', requireAuth, (req, res) => {
  const allowed = ['bio', 'location', 'organization', 'manager_name', 'phone']; const entries = Object.entries(req.body ?? {}).filter(([key]) => allowed.includes(key));
  if (!entries.length) return res.status(400).json({ error: 'No editable fields supplied' });
  db.prepare(`UPDATE profiles SET ${entries.map(([key]) => `${key}=?`).join(',')} WHERE user_id=?`).run(...entries.map(([, value]) => value), req.user.id);
  return res.json(normalizedProfile(req.user, getProfileRow(req.user.id)));
});

// The browser owns the prototype scoring algorithm for now; this route makes the
// response record and its generated, user-scoped result durable in SQLite.
app.put('/api/me/assessment', requireAuth, (req, res) => {
  const { responses = {}, status = 'welcome', currentIndex = 0, complete = false, swellProfile = null } = req.body ?? {};
  if (!responses || typeof responses !== 'object' || Array.isArray(responses)) return res.status(400).json({ error: 'Assessment responses must be an object' });
  if (!['welcome', 'inProgress', 'complete', 'dashboard'].includes(status)) return res.status(400).json({ error: 'Invalid assessment status' });
  const index = Math.max(0, Math.min(8, Number.isInteger(currentIndex) ? currentIndex : 0));
  if (!complete) {
    db.prepare(`UPDATE profiles SET profile_complete=0, assessment_responses_json=?, assessment_state_json=? WHERE user_id=?`).run(json(responses, {}), json({ status, currentIndex: index }, {}), req.user.id);
    return res.json(normalizedProfile(req.user, getProfileRow(req.user.id)));
  }
  if (!swellProfile?.profile || !Array.isArray(swellProfile.workplaceDimensions)) return res.status(400).json({ error: 'Generated Swell profile is required to complete the assessment' });
  const profile = swellProfile.profile;
  db.prepare(`UPDATE profiles SET
    profile_complete=1, assessment_responses_json=?, assessment_state_json=?,
    swell_archetype=?, mbti=?, swell_confidence=?,
    analytical=?, independence=?, goal_orientation=?, adaptability=?, communication=?, collaboration=?,
    identity_drive=?, mind_reasoning=?, leadership_influence=?, conflict_repair=?, execution_work_style=?, social_presence=?,
    strengths_json=?, growth_areas_json=?, collaboration_json=?, goals_json=?, growth_history_json=?, swell_data_json=?
    WHERE user_id=?`).run(
    json(responses, {}), json({ status: 'dashboard', currentIndex: 8 }, {}),
    profile.archetype ?? null, profile.personality ?? null, profile.confidence ?? null,
    workScore(swellProfile, 'Analytical'), workScore(swellProfile, 'Independence'), workScore(swellProfile, 'Goal Orientation'), workScore(swellProfile, 'Adaptability'), workScore(swellProfile, 'Communication'), workScore(swellProfile, 'Collaboration'),
    dimensionScore(swellProfile, 'Identity & Drive'), dimensionScore(swellProfile, 'Mind & Reasoning'), dimensionScore(swellProfile, 'Leadership & Influence'), dimensionScore(swellProfile, 'Conflict & Repair'), dimensionScore(swellProfile, 'Execution & Work Style'), dimensionScore(swellProfile, 'Social Presence'),
    json(swellProfile.strengths, []), json(swellProfile.growthAreas, []), json(swellProfile.collaborationSnapshot, {}), json(swellProfile.goals, []), json(swellProfile.communicationTrend, []), json(swellProfile, {}), req.user.id,
  );
  return res.json(normalizedProfile(req.user, getProfileRow(req.user.id)));
});

if (process.env.NODE_ENV !== 'production') {
  app.post('/api/dev/reset-assessment', requireAuth, (req, res) => {
    resetAssessmentFor(req.user.id);
    return res.json(normalizedProfile(req.user, getProfileRow(req.user.id)));
  });
}

app.get('/api/conversations', requireAuth, (req, res) => {
  const rows = db.prepare(`SELECT c.* FROM conversations c JOIN conversation_members cm ON cm.conversation_id=c.id WHERE cm.user_id=? ORDER BY datetime(c.updated_at) DESC`).all(req.user.id);
  const conversations = rows.map((conversation) => {
    const members = conversationMembers(conversation.id); const other = conversation.type === 'dm' ? members.find((member) => member.id !== req.user.id) : null;
    const latest = db.prepare(`SELECT m.*,u.email,u.first_name,u.last_name,u.display_name,u.initials,u.job_title,u.department,u.status,u.avatar_url,u.is_current_user FROM messages m JOIN users u ON u.id=m.sender_id WHERE m.conversation_id=? AND m.deleted_at IS NULL ORDER BY datetime(m.created_at) DESC LIMIT 1`).get(conversation.id);
    const display = conversation.type === 'self' ? publicUser(req.user) : other || publicUser(req.user);
    return { id: conversation.id, type: conversation.type, name: conversation.name || display.displayName, avatarUrl: conversation.avatar_url || display.avatarUrl, members, otherUser: display, lastMessage: latest ? messageResponse(latest) : null, updatedAt: conversation.updated_at };
  });
  res.json({ conversations });
});
app.get('/api/conversations/:id', requireAuth, (req, res) => { if (!belongsTo(req.params.id, req.user.id)) return res.status(404).json({ error: 'Conversation not found' }); const conversation = db.prepare('SELECT * FROM conversations WHERE id=?').get(Number(req.params.id)); return res.json({ ...conversation, members: conversationMembers(conversation.id) }); });
app.post('/api/conversations', requireAuth, (req, res) => {
  const { type, name, memberIds = [] } = req.body ?? []; const ids = [...new Set(memberIds.map(Number).filter(Number.isInteger).concat(req.user.id))];
  if (!['dm', 'group'].includes(type) || (type === 'dm' && ids.length !== 2) || (type === 'group' && ids.length < 2)) return res.status(400).json({ error: 'Invalid conversation members or type' });
  if (type === 'dm') { const existing = db.prepare(`SELECT c.id FROM conversations c JOIN conversation_members a ON a.conversation_id=c.id AND a.user_id=? JOIN conversation_members b ON b.conversation_id=c.id AND b.user_id=? WHERE c.type='dm'`).get(ids[0], ids[1]); if (existing) return res.json({ id: existing.id, existing: true }); }
  const created = db.prepare('INSERT INTO conversations (type,name,created_by) VALUES (?,?,?)').run(type, type === 'group' ? String(name || '').trim() : null, req.user.id);
  const join = db.prepare('INSERT INTO conversation_members (conversation_id,user_id) VALUES (?,?)'); ids.forEach((id) => join.run(created.lastInsertRowid, id)); return res.status(201).json({ id: created.lastInsertRowid });
});

app.get('/api/conversations/:conversationId/messages', requireAuth, (req, res) => { if (!belongsTo(req.params.conversationId, req.user.id)) return res.status(404).json({ error: 'Conversation not found' }); const messages = db.prepare(`SELECT m.*,u.email,u.first_name,u.last_name,u.display_name,u.initials,u.job_title,u.department,u.status,u.avatar_url,u.is_current_user FROM messages m JOIN users u ON u.id=m.sender_id WHERE m.conversation_id=? AND m.deleted_at IS NULL ORDER BY datetime(m.created_at)`).all(Number(req.params.conversationId)).map(messageResponse); return res.json({ messages }); });
app.post('/api/conversations/:conversationId/messages', requireAuth, (req, res) => { const body = String(req.body?.body || '').trim(); if (!body) return res.status(400).json({ error: 'Message body cannot be empty' }); if (!belongsTo(req.params.conversationId, req.user.id)) return res.status(404).json({ error: 'Conversation not found' }); const result = db.prepare('INSERT INTO messages (conversation_id,sender_id,body) VALUES (?,?,?)').run(Number(req.params.conversationId), req.user.id, body); db.prepare('UPDATE conversations SET updated_at=CURRENT_TIMESTAMP WHERE id=?').run(Number(req.params.conversationId)); return res.status(201).json({ message: messageResponse(findMessage(result.lastInsertRowid)) }); });
app.patch('/api/messages/:id', requireAuth, (req, res) => { const message = findMessage(req.params.id); const body = String(req.body?.body || '').trim(); if (!message || message.sender_id !== req.user.id) return res.status(404).json({ error: 'Message not found' }); if (!body) return res.status(400).json({ error: 'Message body cannot be empty' }); db.prepare('UPDATE messages SET body=?,updated_at=CURRENT_TIMESTAMP WHERE id=?').run(body, message.id); return res.json({ message: messageResponse(findMessage(message.id)) }); });
app.delete('/api/messages/:id', requireAuth, (req, res) => { const message = findMessage(req.params.id); if (!message || message.sender_id !== req.user.id) return res.status(404).json({ error: 'Message not found' }); db.prepare('UPDATE messages SET deleted_at=CURRENT_TIMESTAMP WHERE id=?').run(message.id); return res.json({ ok: true }); });

app.use((error, _req, res, _next) => { console.error(error); res.status(500).json({ error: 'Server error' }); });
const port = Number(process.env.PORT || 3001);
const server = app.listen(port, () => console.log(`Swell API listening on http://localhost:${port}`));

let shuttingDown = false;
const shutdown = (signal) => {
  if (shuttingDown) return;
  shuttingDown = true;
  console.log(`${signal} received. Closing Swell API…`);
  server.close((error) => {
    if (error) console.error('Error while closing HTTP server', error);
    try { db.close(); } catch (dbError) { console.error('Error while closing SQLite', dbError); }
    process.exit(error ? 1 : 0);
  });
};

process.once('SIGINT', () => shutdown('SIGINT'));
process.once('SIGTERM', () => shutdown('SIGTERM'));
