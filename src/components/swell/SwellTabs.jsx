import React from 'react';

const ownProfileTabs = ['Overview', 'Traits', 'Goals', 'Growth'];
const coworkerTabs = ['Overview', 'Traits', 'Collaboration', 'Growth'];
export default function SwellTabs({ active, isOwnProfile, onChange }) {
  const tabs = isOwnProfile ? ownProfileTabs : coworkerTabs;
  return <nav className="swell-tabs" aria-label="Swell profile navigation">
    {tabs.map(tab => <button key={tab} onClick={() => onChange(tab)} className={active === tab ? 'active' : ''}>{tab}</button>)}
    <span className="demo-label">Demo data</span>
  </nav>;
}
