import { db } from './db.js';

const eo = db.prepare('SELECT id FROM users WHERE email=?').get('enoch@swollenteams.demo');
if (!eo) {
  console.error('EO was not found. Run "npm run reset" first to recreate the demo database.');
  process.exitCode = 1;
} else {
  db.prepare(`UPDATE profiles SET
    profile_complete=0,
    swell_archetype=NULL, mbti=NULL, swell_confidence=NULL,
    analytical=NULL, independence=NULL, goal_orientation=NULL, adaptability=NULL, communication=NULL, collaboration=NULL,
    identity_drive=NULL, mind_reasoning=NULL, leadership_influence=NULL, conflict_repair=NULL, execution_work_style=NULL, social_presence=NULL,
    strengths_json='[]', growth_areas_json='[]', collaboration_json='{}', goals_json='[]', growth_history_json='[]', swell_data_json='{}',
    assessment_responses_json='{}', assessment_state_json='{"status":"welcome","currentIndex":0}'
    WHERE user_id=?`).run(eo.id);
  console.log('Reset EO\'s Swell assessment and generated profile. Conversations and contact profiles were preserved.');
}
db.close();
