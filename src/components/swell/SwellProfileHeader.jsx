import React from 'react';
import { Sparkles } from 'lucide-react';

export default function SwellProfileHeader({ profile, viewer }) {
  return <header className="profile-header">
    <div className="profile-avatar">{profile.initials}<span className="presence" /></div>
    <div><h1>{profile.name}</h1><p>{profile.title} <span>•</span> {profile.department}</p></div>
    <div className="swell-wordmark"><Sparkles size={16} /> {viewer === 'currentUser' ? 'My Swell' : 'Swell'}</div>
  </header>;
}
