import React, { useEffect, useState } from 'react';
import { Bell, CalendarDays, Ellipsis, Grid2X2, MessageSquare, Search, Users } from 'lucide-react';
import SwellProfile from './components/swell/SwellProfile';
import { createInitialProfileStates, currentUserId, generateInitialSwellProfile, swellProfiles } from './data/swellMockData';
import { loadSwellGoals, saveSwellGoals } from './data/swellGoals';

const sideIcons = [MessageSquare, CalendarDays, Users];
const loadProfileStates = () => {
  const initialStates = createInitialProfileStates();
  try {
    const storedEO = window.localStorage.getItem('swellProfileState:eo');
    return storedEO ? { ...initialStates, EO: { ...initialStates.EO, ...JSON.parse(storedEO) } } : initialStates;
  } catch { return initialStates; }
};

export default function App() {
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [profileStates, setProfileStates] = useState(loadProfileStates);
  const [goalsByUser, setGoalsByUser] = useState(() => ({ [currentUserId]: loadSwellGoals(currentUserId) }));
  const openProfile = (profileKey) => setSelectedProfile(profileKey);
  const updateAssessment = (assessment) => setProfileStates((states) => ({ ...states, EO: { ...states.EO, assessment } }));
  const completeAssessment = (responses) => setProfileStates((states) => ({
    ...states,
    EO: {
      ...states.EO,
      profileCompleted: true,
      assessment: { ...states.EO.assessment, status: 'dashboard', responses, completed: true, currentIndex: 8 },
      swellProfile: generateInitialSwellProfile(swellProfiles.EO.profile, responses),
    },
  }));
  const updateGoals = (userId, goals) => setGoalsByUser((existing) => ({ ...existing, [userId]: goals }));
  useEffect(() => { saveSwellGoals(currentUserId, goalsByUser[currentUserId] ?? []); }, [goalsByUser]);
  useEffect(() => { window.localStorage.setItem('swellProfileState:eo', JSON.stringify(profileStates.EO)); }, [profileStates.EO]);

  return (
    <main className="teams-shell">
      <aside className="rail" aria-label="Teams navigation">
        <Grid2X2 size={20} />
        {sideIcons.map((Icon, index) => <Icon key={index} size={22} className={index === 0 ? 'rail-active' : ''} />)}
        <Ellipsis size={23} />
      </aside>
      <section className="teams-workspace">
        <header className="teams-topbar">
          <span className="teams-mark">T</span>
          <div className="teams-search"><Search size={18} /> Search</div>
          <Bell size={19} />
          <button className="mini-avatar profile-trigger" onClick={() => openProfile('EO')} aria-label="Open My Swell profile">EO</button>
        </header>
        <div className="workspace-body">
          <aside className="chat-list">
            <div className="chat-list-title">Chat</div>
            <button className="chat-filter">Recent</button>
            <button className="chat-item selected profile-trigger" onClick={() => openProfile('PM')} aria-label="Open Patrick McDonald's Swell profile"><span className="person-dot">PM</span><span>Patrick McDonald</span></button>
            <div className="chat-item"><span className="person-dot green">AC</span><span>Alex Carter</span></div>
            <div className="chat-item"><span className="person-dot purple">JT</span><span>Jordan Taylor</span></div>
          </aside>
          <section className="chat-pane"><div className="chat-pane-title">Patrick McDonald</div><p>View a teammate's profile to learn how they work best.</p></section>
        </div>
      </section>
      {selectedProfile && <SwellProfile profileData={swellProfiles[selectedProfile]} profileState={profileStates[selectedProfile]} currentUserProfileState={profileStates[currentUserId]} goals={goalsByUser[currentUserId] ?? []} onGoalsChange={(goals) => updateGoals(currentUserId, goals)} onAssessmentChange={updateAssessment} onAssessmentComplete={completeAssessment} onClose={() => setSelectedProfile(null)} />}
    </main>
  );
}
