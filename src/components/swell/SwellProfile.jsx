import React, { useState } from 'react';
import { MessageCircle, Network, Phone, Video, X } from 'lucide-react';
import SwellProfileHeader from './SwellProfileHeader';
import SwellTabs from './SwellTabs';
import SwellOverview from './SwellOverview';
import SwellTraits from './SwellTraits';
import SwellGoals from './SwellGoals';
import SwellGrowth from './SwellGrowth';
import SwellAssessment from './SwellAssessment';
import SwellCollaboration from './SwellCollaboration';
import { currentUserId } from '../../data/swellMockData';
import { createTraitProfile } from '../../data/swellTraitTaxonomy';

const topTabs = ['Overview', 'Profile', 'Organization', 'Swell Profile'];

export default function SwellProfile({ profileData, profileState, currentUserProfileState, goals, onGoalsChange, onTraitProfileChange, onAssessmentChange, onAssessmentComplete, onClose }) {
  const [topTab, setTopTab] = useState('Swell Profile');
  const [swellTab, setSwellTab] = useState('Overview');
  const profile = profileData?.profile;
  const isOwnProfile = profileData?.viewer === 'currentUser' || profileData?.id === currentUserId;
  const needsAssessment = isOwnProfile && !profileState?.profileCompleted;
  const dashboardData = profileState?.swellProfile ?? null;
  const traitProfile = dashboardData?.traitProfile ?? (dashboardData ? createTraitProfile(dashboardData) : null);
  const hasDashboard = Boolean(dashboardData?.profile);
  const screen = hasDashboard ? {
    Overview: <SwellOverview profile={dashboardData.profile} dashboardData={dashboardData} isOwnProfile={isOwnProfile} />,
    Traits: <SwellTraits profile={dashboardData.profile} dashboardData={dashboardData} traitProfile={traitProfile} isOwnProfile={isOwnProfile} onTraitProfileChange={onTraitProfileChange} />,
    Goals: <SwellGoals dashboardData={dashboardData} goals={goals} onGoalsChange={onGoalsChange} userId={profileData.id} />,
    Collaboration: <SwellCollaboration profile={dashboardData.profile} dashboardData={dashboardData} currentUserProfile={currentUserProfileState?.swellProfile ?? null} />,
    Growth: <SwellGrowth profile={dashboardData.profile} dashboardData={dashboardData} isOwnProfile={isOwnProfile} />,
  } : null;

  if (!profile) return <div className="modal-backdrop">
    <section className="profile-modal" aria-label="Profile loading">
      <button className="modal-close" onClick={onClose} aria-label="Close profile"><X size={24} /></button>
      <div className="placeholder-panel"><p>Profile loading</p><span>Your Swell profile information is being prepared.</span></div>
    </section>
  </div>;

  return <div className="modal-backdrop">
    <section className="profile-modal" aria-label={`${profile.name} profile`}>
      <button className="modal-close" onClick={onClose} aria-label="Close profile"><X size={24} /></button>
      <SwellProfileHeader profile={profile} viewer={isOwnProfile ? 'currentUser' : 'teammate'} />
      <div className="profile-actions" aria-label="Profile actions"><MessageCircle size={19} /><Network size={19} /><Video size={19} /><Phone size={19} /></div>
      <nav className="top-tabs" aria-label="Profile sections">
        {topTabs.map(tab => <button key={tab} onClick={() => setTopTab(tab)} className={topTab === tab ? 'active' : ''}>{tab}</button>)}
      </nav>
      {topTab === 'Swell Profile' && hasDashboard && <SwellTabs active={swellTab} isOwnProfile={isOwnProfile} onChange={setSwellTab} />}
      <div className="profile-modal-scroll-area profile-tab-content">
        {topTab === 'Swell Profile' && needsAssessment ? <SwellAssessment assessment={profileState.assessment} onChange={onAssessmentChange} onComplete={onAssessmentComplete} /> : topTab === 'Swell Profile' && hasDashboard ? <div className="swell-content">{screen[swellTab]}</div> : topTab === 'Swell Profile' ? <div className="placeholder-panel"><p>Profile loading</p><span>Your Swell profile information is being prepared.</span></div> : <div className="placeholder-panel"><p>{topTab}</p><span>This Teams profile section is shown only as surrounding context for the Swell prototype.</span></div>}
      </div>
    </section>
  </div>;
}
