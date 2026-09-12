export const workplaceTraitTaxonomy = [
  { id: 'identity-drive', name: 'Identity & Drive', traits: ['Goal Orientation', 'Ambition', 'Autonomy', 'Initiative', 'Ownership', 'Persistence', 'Impact Orientation'] },
  { id: 'mind-reasoning', name: 'Mind & Reasoning', traits: ['Analytical Thinking', 'Pattern Recognition', 'Decision Speed', 'Cognitive Flexibility', 'Evidence Orientation', 'Practical Judgment', 'Systems Thinking'] },
  { id: 'communication', name: 'Communication', traits: ['Audience Awareness', 'Directness', 'Context Sharing', 'Listening Orientation', 'Communication Flexibility', 'Conciseness', 'Feedback Receptivity'] },
  { id: 'collaboration', name: 'Collaboration', traits: ['Shared Ownership', 'Trust Building', 'Cooperation', 'Supportiveness', 'Perspective Seeking', 'Coordination', 'Interdependence'] },
  { id: 'leadership-influence', name: 'Leadership & Influence', traits: ['Direction Setting', 'Delegation', 'Influence', 'Accountability', 'Coaching Orientation', 'Consensus Building', 'Decision Leadership'] },
  { id: 'adaptability', name: 'Adaptability', traits: ['Learning Agility', 'Change Readiness', 'Uncertainty Tolerance', 'Recovery Speed', 'Flexibility', 'Reprioritization', 'Experimentation'] },
  { id: 'conflict-repair', name: 'Conflict & Repair', traits: ['Constructive Candor', 'Conflict Tolerance', 'Accountability Style', 'Resolution Orientation', 'Emotional Regulation', 'Perspective Taking', 'Repair Initiative'] },
  { id: 'execution-work-style', name: 'Execution & Work Style', traits: ['Planning', 'Prioritization', 'Follow Through', 'Pace', 'Structure Preference', 'Detail Orientation', 'Reliability'] },
  { id: 'social-presence', name: 'Social Presence', traits: ['Participation', 'Assertiveness', 'Sociability', 'Group Awareness', 'Presence', 'Visibility', 'Inclusion Orientation'] },
];

const slug = (value) => value.toLowerCase().replaceAll(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const offsets = [4, -3, 2, -4, 0, 3, -2];
const clamp = (score) => Math.max(0, Math.min(100, Math.round(score)));

export function createTraitProfile(swellProfile) {
  return workplaceTraitTaxonomy.map((taxonomyDimension) => {
    const dimension = swellProfile.workplaceDimensions.find((item) => item.id === taxonomyDimension.id || item.name === taxonomyDimension.name);
    const baseScore = dimension?.score ?? 70;
    const detailedTraits = taxonomyDimension.traits.map((name, index) => ({ id: slug(name), name, score: clamp(baseScore + offsets[index]), history: [{ score: clamp(baseScore + offsets[index]), source: 'initial-assessment', date: new Date().toISOString() }] }));
    return {
      id: taxonomyDimension.id,
      name: taxonomyDimension.name,
      score: calculateDimensionScore(detailedTraits),
      traits: detailedTraits,
    };
  });
}

export function calculateDimensionScore(traits) { return Math.round(traits.reduce((total, trait) => total + trait.score, 0) / traits.length); }
export function traitExplanation(trait, dimension) { return { measures: `${trait.name} describes a practical tendency in how you approach ${dimension.name.toLowerCase()} at work.`, work: `It can shape how you contribute, make decisions, and collaborate in everyday workplace situations.`, interpretation: `${trait.score >= 78 ? 'This is a consistent part of your current work style.' : trait.score >= 65 ? 'This appears as a situational preference in your current work style.' : 'This is an area where your approach may vary by context and can develop over time.'}` }; }

export function microAssessmentQuestions(traitName) {
  if (traitName === 'Communication Flexibility') return [
    { prompt: 'You are explaining a technical decision to someone outside your specialty. You usually…', choices: ['Give the full reasoning so they have the complete picture', 'Start with the outcome, then add detail based on their questions', 'Ask what level of detail would be most useful before explaining'] },
    { prompt: 'A teammate says your message was difficult to follow. You are most likely to…', choices: ['Clarify the wording while keeping the same level of detail', 'Shorten the message and emphasize the key action', 'Ask what part was unclear before changing the explanation'] },
    { prompt: 'When writing to different audiences, your messages are usually…', choices: ['Similar because consistency prevents confusion', 'Adjusted somewhat depending on the recipient', 'Deliberately shaped around what each audience needs'] },
  ];
  return [
    { prompt: `A new situation calls for ${traitName.toLowerCase()}. What is your first move?`, choices: ['Use the approach that has worked reliably before', 'Adapt the approach to the immediate context', 'Ask for the perspective that will make the work clearer'] },
    { prompt: `A teammate asks for support related to ${traitName.toLowerCase()}. You are most likely to…`, choices: ['Offer a direct, practical response', 'Explore the context before suggesting an approach', 'Coordinate a shared next step'] },
    { prompt: `When priorities shift, ${traitName.toLowerCase()} is most useful when you…`, choices: ['Protect the essential outcome', 'Adjust the process thoughtfully', 'Make expectations explicit with others'] },
  ];
}

export const traitScoreFromAnswers = (answers) => Math.round(55 + ((answers.reduce((total, answer) => total + answer, 0) / (answers.length * 2)) * 35));
