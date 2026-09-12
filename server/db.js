import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, 'data');
fs.mkdirSync(dataDir, { recursive: true });

export const db = new Database(path.join(dataDir, 'swollen-teams.db'));
db.pragma('foreign_keys = ON');
db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT, email TEXT UNIQUE NOT NULL, password_hash TEXT NOT NULL,
    first_name TEXT NOT NULL, last_name TEXT NOT NULL, display_name TEXT NOT NULL, initials TEXT NOT NULL,
    job_title TEXT, department TEXT, status TEXT DEFAULT 'available', avatar_url TEXT,
    is_current_user INTEGER DEFAULT 0, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS profiles (
    id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER UNIQUE NOT NULL, bio TEXT, location TEXT, organization TEXT,
    manager_name TEXT, phone TEXT, profile_complete INTEGER DEFAULT 0, swell_archetype TEXT, mbti TEXT,
    swell_confidence INTEGER, analytical INTEGER, independence INTEGER, goal_orientation INTEGER, adaptability INTEGER,
    communication INTEGER, collaboration INTEGER, identity_drive INTEGER, mind_reasoning INTEGER,
    leadership_influence INTEGER, conflict_repair INTEGER, execution_work_style INTEGER, social_presence INTEGER,
    strengths_json TEXT, growth_areas_json TEXT, collaboration_json TEXT, goals_json TEXT, growth_history_json TEXT,
    swell_data_json TEXT, assessment_responses_json TEXT, assessment_state_json TEXT,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );
  CREATE TABLE IF NOT EXISTS conversations (
    id INTEGER PRIMARY KEY AUTOINCREMENT, type TEXT NOT NULL CHECK(type IN ('dm','self','group')), name TEXT,
    avatar_url TEXT, created_by INTEGER, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(created_by) REFERENCES users(id)
  );
  CREATE TABLE IF NOT EXISTS conversation_members (
    id INTEGER PRIMARY KEY AUTOINCREMENT, conversation_id INTEGER NOT NULL, user_id INTEGER NOT NULL,
    joined_at DATETIME DEFAULT CURRENT_TIMESTAMP, UNIQUE(conversation_id,user_id),
    FOREIGN KEY(conversation_id) REFERENCES conversations(id), FOREIGN KEY(user_id) REFERENCES users(id)
  );
  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT, conversation_id INTEGER NOT NULL, sender_id INTEGER NOT NULL, body TEXT NOT NULL,
    message_type TEXT DEFAULT 'text', created_at DATETIME DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    deleted_at DATETIME, FOREIGN KEY(conversation_id) REFERENCES conversations(id), FOREIGN KEY(sender_id) REFERENCES users(id)
  );
`);

// Keep existing local demo databases compatible when assessment state is added.
const ensureProfileColumn = (name, definition) => {
  const columns = db.prepare('PRAGMA table_info(profiles)').all().map((column) => column.name);
  if (!columns.includes(name)) db.exec(`ALTER TABLE profiles ADD COLUMN ${name} ${definition}`);
};
ensureProfileColumn('assessment_responses_json', 'TEXT');
ensureProfileColumn('assessment_state_json', 'TEXT');

export const parseJson = (value, fallback) => { try { return value ? JSON.parse(value) : fallback; } catch { return fallback; } };
export const publicUser = (user) => user && ({ id: user.id, email: user.email, firstName: user.first_name, lastName: user.last_name, displayName: user.display_name, initials: user.initials, jobTitle: user.job_title, department: user.department, status: user.status, avatarUrl: user.avatar_url, isCurrentUser: Boolean(user.is_current_user) });

export function normalizedProfile(user, row) {
  if (!user || !row) return null;
  const workStyle = { analytical: row.analytical, independence: row.independence, goalOrientation: row.goal_orientation, adaptability: row.adaptability, communication: row.communication, collaboration: row.collaboration };
  const dimensions = { identityDrive: row.identity_drive, mindReasoning: row.mind_reasoning, leadershipInfluence: row.leadership_influence, conflictRepair: row.conflict_repair, executionWorkStyle: row.execution_work_style, socialPresence: row.social_presence };
  const completed = Boolean(row.profile_complete);
  const savedAssessment = parseJson(row.assessment_state_json, {});
  return { user: publicUser(user), profile: { bio: row.bio, location: row.location, organization: row.organization, managerName: row.manager_name, phone: row.phone, profileComplete: completed }, assessment: { status: savedAssessment.status || (completed ? 'dashboard' : 'welcome'), currentIndex: Number.isInteger(savedAssessment.currentIndex) ? savedAssessment.currentIndex : 0, responses: parseJson(row.assessment_responses_json, {}), completed }, swell: { archetype: row.swell_archetype, mbti: row.mbti, confidence: row.swell_confidence, workStyle, dimensions, strengths: parseJson(row.strengths_json, []), growthAreas: parseJson(row.growth_areas_json, []), collaboration: parseJson(row.collaboration_json, {}), goals: parseJson(row.goals_json, []), growthHistory: parseJson(row.growth_history_json, []), data: parseJson(row.swell_data_json, {}) } };
}
