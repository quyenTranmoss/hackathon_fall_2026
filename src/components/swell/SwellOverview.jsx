import React from 'react';
import { ArrowUpRight, Compass, HeartHandshake, Sparkles, Target } from 'lucide-react';
function TraitBars({ items }) { return <div className="trait-bars">{items.map(t => <div className="trait-row" key={t.name}><div><span>{t.name}</span><b>{t.score}%</b></div><div className="bar"><i className={t.color} style={{ width: `${t.score}%` }} /></div></div>)}</div>; }
function TagList({ items, tone }) { return <div className="tag-list">{items.map(item => <span className={`tag ${tone}`} key={item}>{item}</span>)}</div>; }

export default function SwellOverview({ profile, dashboardData, isOwnProfile }) {
  return <div className="overview-grid">
    <article className="card personality-card"><div className="card-kicker"><Sparkles size={15} /> SWELL ARCHETYPE <small>Based on 63 evolving traits</small></div><div className="personality-head"><div className="type-ring"><Sparkles size={22} /></div><div><strong className="archetype-name">{profile.archetype}</strong><span className="confidence">{profile.personality} · {profile.confidence}% confidence</span><div className="personality-labels">{profile.labels.join(' · ')}</div></div></div><p>{profile.description}</p><p className="archetype-explanation">{isOwnProfile ? profile.archetypeExplanation : `${profile.name.split(' ')[0]}'s archetype is an entry point into a broader workplace profile built from 63 evolving traits.`}</p></article>
    <article className="card work-style-card"><div className="card-title"><span><Compass size={17} /> Work style</span><ArrowUpRight size={17} /></div><TraitBars items={dashboardData.traits} /></article>
    <article className="card"><div className="card-title"><span><Target size={17} /> Strengths</span></div><TagList items={dashboardData.strengths} tone="strength" /></article>
    <article className="card"><div className="card-title"><span><ArrowUpRight size={17} /> Areas of growth</span></div><TagList items={dashboardData.growthAreas} tone="growth" /></article>
    <article className="card collaboration-card"><div className="card-title"><span><HeartHandshake size={17} /> Collaboration snapshot</span></div><div className="snapshot-grid"><div><span>Best with</span><TagList items={dashboardData.collaborationSnapshot.bestWith} tone="strength" /></div><div><span>Potential friction</span><TagList items={dashboardData.collaborationSnapshot.friction} tone="growth" /></div></div><div className="collab-note"><b>Communication tip</b>{dashboardData.collaborationSnapshot.tip}</div></article>
  </div>;
}
