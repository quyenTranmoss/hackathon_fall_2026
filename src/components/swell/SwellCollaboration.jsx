import React from 'react';
import { HeartHandshake, MessageSquareText, Sparkles, UsersRound } from 'lucide-react';
import { generateRelationshipInsights } from '../../data/relationshipInsights';

function List({ items }) { return <div className="collaboration-list">{items.map((item) => <span key={item}>{item}</span>)}</div>; }

export default function SwellCollaboration({ dashboardData, profile, currentUserProfile }) {
  const { collaborationSnapshot, communicationPreferences } = dashboardData;
  const firstName = profile.name.split(' ')[0];
  const relationshipInsights = generateRelationshipInsights(currentUserProfile, dashboardData);
  return <><div className="page-intro"><h2>Collaboration</h2><p>Practical context for working effectively with {firstName}.</p></div><div className="collaboration-grid">
    <article className="card"><div className="card-title"><span><HeartHandshake size={17} /> How {firstName} works best</span></div><List items={collaborationSnapshot.bestWith} /></article>
    <article className="card"><div className="card-title"><span><MessageSquareText size={17} /> Communication preferences</span></div><List items={communicationPreferences} /></article>
    <article className="card"><div className="card-title"><span><UsersRound size={17} /> Potential friction</span></div><List items={collaborationSnapshot.friction} /></article>
    <article className="card working-recommendation"><div className="card-title"><span><Sparkles size={17} /> Working with {firstName}</span></div><p>{collaborationSnapshot.tip}</p></article>
  </div><section className="relationship-insights"><div className="relationship-heading"><div><Sparkles size={18} /><span>You + {firstName}</span></div><p>Insights based on a comparison of both Swell workplace profiles.</p></div>{relationshipInsights ? <><div className="fit-summary"><span>Collaboration fit</span>{Object.entries(relationshipInsights.compatibilitySummary).map(([label, value]) => <div key={label}><small>{label.replace(/([A-Z])/g, ' $1')}</small><b>{value}</b></div>)}</div><div className="relationship-grid"><article className="card"><h3>Where you align</h3><List items={relationshipInsights.alignmentAreas} /></article><article className="card"><h3>Where you complement each other</h3><List items={relationshipInsights.complementaryStrengths} /></article><article className="card"><h3>Watch for friction</h3><List items={relationshipInsights.frictionAreas} /></article><article className="card"><h3>Communication dynamic</h3><List items={relationshipInsights.communicationDynamics} /></article></div><article className="relationship-recommendations"><span>Try this</span><List items={relationshipInsights.recommendations} /></article></> : <article className="future-insights"><div><Sparkles size={18} /><span>You + {firstName}</span></div><p>Complete your Swell profile to see how your working styles connect.</p></article>}</section></>;
}
