export const profile = {
  name: 'Patrick McDonald',
  initials: 'PM',
  title: 'Air Compliance Supervisor',
  department: 'PSC',
  archetype: 'Strategist',
  personality: 'INTJ',
  confidence: 78,
  labels: ['Analytical', 'Independent', 'Goal-oriented'],
  description: 'You bring structured thinking to complex work, pairing a clear point of view with a focus on meaningful outcomes.',
  archetypeExplanation: 'Your archetype is an entry point into a broader workplace profile built from 63 evolving traits.',
};

export const currentUserId = 'EO';

export const swellProfiles = {
  EO: {
    id: 'EO',
    viewer: 'currentUser',
    profile: {
      name: 'Enoch Olukolajo',
      initials: 'EO',
      title: 'Product Team Member',
      department: 'PSC',
      archetype: 'Strategist',
      personality: 'INTJ',
      confidence: 78,
      labels: ['Analytical', 'Independent', 'Goal-oriented'],
      description: 'You bring structured thinking to complex work, pairing a clear point of view with a focus on meaningful outcomes.',
      archetypeExplanation: 'Your archetype is an entry point into a broader workplace profile built from 63 evolving traits.',
    },
  },
  PM: {
    id: 'PM',
    viewer: 'teammate',
    profile,
  },
};

export const createInitialProfileStates = () => ({
  EO: { userId: 'EO', profileCompleted: false, assessment: { status: 'welcome', currentIndex: 0, responses: {}, completed: false }, swellProfile: null },
  PM: { userId: 'PM', profileCompleted: true, assessment: { responses: {}, completed: false }, swellProfile: createDemoSwellProfile(profile) },
});

// Placeholder assessment architecture. The final 63-item instrument and scoring model can replace this data and function.
export const assessmentDimensions = [
  { id: 'identity-drive', name: 'Identity & Drive', trait: 'Goal Orientation', description: 'What motivates you, how you approach goals, and how you make decisions about your work.', question: 'When starting an important piece of work, what helps you move forward most?', choices: ['A clear outcome and ownership of the approach', 'Frequent guidance and shared checkpoints', 'Space to explore possibilities before defining the outcome'] },
  { id: 'mind-reasoning', name: 'Mind & Reasoning', trait: 'Analytical Thinking', description: 'How you interpret information, solve problems, and form decisions.', question: 'When a problem is complex, where do you usually begin?', choices: ['Map the system and look for the underlying pattern', 'Talk through options with colleagues first', 'Test a practical action and adjust from there'] },
  { id: 'communication', name: 'Communication', trait: 'Audience Awareness', description: 'How you share context, listen, and adapt messages for different audiences.', question: 'Before communicating a decision, what do you consider first?', choices: ['The context people need to understand why', 'The shortest path to a clear answer', 'How the message may land with each audience'] },
  { id: 'collaboration', name: 'Collaboration', trait: 'Shared Ownership', description: 'How you partner, build trust, and contribute within shared work.', question: 'In a cross-functional project, you are most effective when…', choices: ['Roles and outcomes are clear from the start', 'The group can shape the process together', 'You can coordinate closely as work unfolds'] },
  { id: 'leadership-influence', name: 'Leadership & Influence', trait: 'Direction Setting', description: 'How you create direction, build alignment, and help others succeed.', question: 'When helping a team make progress, you tend to…', choices: ['Clarify the objective and create a workable plan', 'Build agreement before choosing a direction', 'Lead by stepping in where support is needed'] },
  { id: 'adaptability', name: 'Adaptability', trait: 'Learning Agility', description: 'How you respond constructively to change, uncertainty, and shifting priorities.', question: 'When priorities change unexpectedly, your first move is to…', choices: ['Reassess the plan against the new outcome', 'Gather perspectives on the impact', 'Start adapting immediately and refine along the way'] },
  { id: 'conflict-repair', name: 'Conflict & Repair', trait: 'Constructive Candor', description: 'How you navigate disagreement, feedback, and rebuilding alignment.', question: 'When you disagree with a colleague, you prefer to…', choices: ['Discuss the reasoning directly and respectfully', 'Find common ground before raising the concern', 'Reflect first, then share a considered point of view'] },
  { id: 'execution-work-style', name: 'Execution & Work Style', trait: 'Planning', description: 'How you plan, prioritize, and turn commitments into progress.', question: 'How do you keep a high-priority initiative moving?', choices: ['Break it into milestones with clear ownership', 'Stay flexible and respond to the most urgent needs', 'Create momentum through regular team check-ins'] },
  { id: 'social-presence', name: 'Social Presence', trait: 'Participation', description: 'How you show up in groups and make space for productive connection.', question: 'In a new working group, you usually…', choices: ['Observe the dynamics before contributing a point of view', 'Introduce ideas early to create momentum', 'Focus on helping others connect and participate'] },
];

export const traits = [
  { name: 'Analytical', score: 91, detail: 'You look for patterns, context, and evidence before moving forward.', color: 'blue' },
  { name: 'Independence', score: 84, detail: 'You are energized by owning work and turning ambiguity into a plan.', color: 'violet' },
  { name: 'Goal Orientation', score: 88, detail: 'Clear outcomes keep you focused and help you make practical choices.', color: 'teal' },
  { name: 'Adaptability', score: 71, detail: 'You can adjust course thoughtfully when priorities or conditions change.', color: 'amber' },
  { name: 'Communication', score: 62, detail: 'You communicate with precision and may benefit from tailoring detail to the audience.', color: 'pink' },
  { name: 'Collaboration', score: 63, detail: 'You value reliable partnerships and contribute best with defined roles.', color: 'indigo' },
];

export const strengths = ['Strategic thinking', 'Problem solving', 'Planning'];
export const growthAreas = ['Communication flexibility', 'Delegation', 'Adaptability'];

export const collaborationSnapshot = {
  bestWith: ['Clear objectives', 'Defined ownership', 'Time to analyze problems'],
  friction: ['Ambiguous responsibilities', 'Rapid decisions without context', 'Highly unstructured collaboration'],
  tip: 'Provide clear objectives and context, then allow room to determine the approach.',
};

export const workplaceDimensions = [
  { name: 'Identity & Drive', score: 86, color: 'violet', description: 'What motivates you and how you orient around purpose, autonomy, and goals.', traits: ['Goal Orientation', 'Ownership', 'Purpose Drive'] },
  { name: 'Mind & Reasoning', score: 91, color: 'blue', description: 'How you interpret information, solve problems, and form decisions.', traits: ['Analytical Thinking', 'Systems Thinking', 'Judgment'] },
  { name: 'Communication', score: 62, color: 'pink', description: 'How you share context, listen, and adapt messages for different audiences.', traits: ['Clarity', 'Listening', 'Audience Awareness'] },
  { name: 'Collaboration', score: 63, color: 'indigo', description: 'How you partner, build trust, and contribute within shared work.', traits: ['Cooperation', 'Reliability', 'Shared Ownership'] },
  { name: 'Leadership & Influence', score: 74, color: 'teal', description: 'How you create direction, build alignment, and help others succeed.', traits: ['Direction Setting', 'Empowerment', 'Influence'] },
  { name: 'Adaptability', score: 71, color: 'amber', description: 'How you respond constructively to change, uncertainty, and shifting priorities.', traits: ['Flexibility', 'Learning Agility', 'Resilience'] },
  { name: 'Conflict & Repair', score: 68, color: 'violet', description: 'How you navigate disagreement, feedback, and rebuilding alignment.', traits: ['Constructive Candor', 'Perspective Taking', 'Repair'] },
  { name: 'Execution & Work Style', score: 88, color: 'blue', description: 'How you plan, prioritize, and turn commitments into progress.', traits: ['Planning', 'Focus', 'Follow-through'] },
  { name: 'Social Presence', score: 66, color: 'teal', description: 'How you show up in groups and make space for productive connection.', traits: ['Approachability', 'Participation', 'Energy'] },
];

export const goals = [
  { title: 'Improve communication', detail: 'Share context earlier and adapt the level of detail to the audience.', progress: 66, color: 'blue' },
  { title: 'Improve delegation', detail: 'Create space for others to own meaningful decisions and outcomes.', progress: 42, color: 'violet' },
  { title: 'Strengthen team leadership', detail: 'Set clear direction while inviting more perspectives into the plan.', progress: 58, color: 'teal' },
  { title: 'Adapt to changing priorities', detail: 'Practice resetting plans quickly while keeping the team aligned on outcomes.', progress: 51, color: 'amber' },
];

export const communicationTrend = [
  { week: 'Week 1', value: 62 },
  { week: 'Week 4', value: 66 },
  { week: 'Week 8', value: 71 },
];

const traitToDimension = {
  Analytical: 'mind-reasoning', Independence: 'identity-drive', 'Goal Orientation': 'execution-work-style',
  Adaptability: 'adaptability', Communication: 'communication', Collaboration: 'collaboration',
};

const traitDetails = Object.fromEntries(traits.map(({ name, detail, color }) => [name, { detail, color }]));

const archetypeDefinitions = [
  { name: 'Strategist', positive: { 'mind-reasoning': 1.3, 'identity-drive': 1.1, 'execution-work-style': 1.2 }, inverse: { collaboration: 0.35, 'social-presence': 0.45 }, description: 'You bring structured thinking to complex work, pairing a clear point of view with a focus on meaningful outcomes.' },
  { name: 'Connector', positive: { communication: 1.25, collaboration: 1.3, 'social-presence': 1.2, 'conflict-repair': 0.75 }, inverse: { 'mind-reasoning': 0.15 }, description: 'You create momentum through clear communication, shared understanding, and strong working relationships.' },
  { name: 'Driver', positive: { 'leadership-influence': 1.35, 'identity-drive': 1.2, 'execution-work-style': 1.3 }, inverse: { 'conflict-repair': 0.2 }, description: 'You create direction, turn priorities into action, and help work move decisively forward.' },
  { name: 'Facilitator', positive: { collaboration: 1.3, communication: 1.2, 'conflict-repair': 1.2, adaptability: 1.05 }, inverse: { 'identity-drive': 0.15 }, description: 'You help people find alignment, navigate differences, and make progress together.' },
  { name: 'Problem Solver', positive: { 'mind-reasoning': 1.4, adaptability: 1.15, 'execution-work-style': 1.1 }, inverse: { 'social-presence': 0.2 }, description: 'You make sense of complex situations, adapt your approach, and convert insight into practical action.' },
  { name: 'Influencer', positive: { 'social-presence': 1.35, 'leadership-influence': 1.25, communication: 1.25 }, inverse: { 'execution-work-style': 0.1 }, description: 'You build energy around ideas, bring people with you, and create visible momentum.' },
  { name: 'Operator', positive: { 'execution-work-style': 1.4, 'identity-drive': 1.2, 'conflict-repair': 0.8 }, inverse: { adaptability: 0.25 }, description: 'You bring consistency, ownership, and dependable structure to important work.' },
  { name: 'Explorer', positive: { adaptability: 1.4, 'mind-reasoning': 1.2, 'social-presence': 0.65 }, inverse: { 'execution-work-style': 0.25 }, description: 'You are comfortable exploring uncertainty, spotting possibilities, and learning your way forward.' },
];

const descriptorByDimension = {
  'identity-drive': 'Independent', 'mind-reasoning': 'Analytical', communication: 'Clear communicator', collaboration: 'Collaborative',
  'leadership-influence': 'Decisive', adaptability: 'Adaptable', 'conflict-repair': 'Empathetic', 'execution-work-style': 'Goal-oriented', 'social-presence': 'Engaging',
};

const strengthByDimension = {
  'identity-drive': 'Self-direction', 'mind-reasoning': 'Strategic thinking', communication: 'Clear communication', collaboration: 'Team coordination',
  'leadership-influence': 'Team leadership', adaptability: 'Adaptability', 'conflict-repair': 'Conflict navigation', 'execution-work-style': 'Planning', 'social-presence': 'Relationship building',
};

const growthByDimension = {
  'identity-drive': 'Delegation', 'mind-reasoning': 'Decision speed', communication: 'Communication flexibility', collaboration: 'Collaboration balance',
  'leadership-influence': 'Shared leadership', adaptability: 'Comfort with ambiguity', 'conflict-repair': 'Constructive feedback', 'execution-work-style': 'Planning flexibility', 'social-presence': 'Visible participation',
};

export function createDemoSwellProfile(profileData) {
  return {
    profile: profileData, traits, workplaceDimensions, strengths, growthAreas, collaborationSnapshot, goals, communicationTrend,
    communicationPreferences: ['Prefers context before decisions', 'Values concise, evidence-based communication', 'Responds well to clear ownership'],
  };
}

function rankArchetypes(scoreById) {
  return archetypeDefinitions.map((archetype) => {
    const weightedScores = [
      ...Object.entries(archetype.positive).map(([id, weight]) => [scoreById[id], weight]),
      ...Object.entries(archetype.inverse).map(([id, weight]) => [100 - scoreById[id], weight]),
    ];
    const totalWeight = weightedScores.reduce((total, [, weight]) => total + weight, 0);
    return { ...archetype, matchScore: weightedScores.reduce((total, [score, weight]) => total + score * weight, 0) / totalWeight };
  }).sort((left, right) => right.matchScore - left.matchScore);
}

function deriveMbti(scoreById) {
  const extroversion = (scoreById['social-presence'] + scoreById.communication + scoreById.collaboration) / 3;
  const introversion = (scoreById['identity-drive'] + scoreById['mind-reasoning']) / 2;
  const intuition = scoreById['mind-reasoning'] + (scoreById.adaptability * 0.25);
  const sensing = scoreById['execution-work-style'] + (scoreById['identity-drive'] * 0.25);
  const thinking = scoreById['mind-reasoning'] + (scoreById['execution-work-style'] * 0.2);
  const feeling = ((scoreById.collaboration + scoreById.communication + scoreById['conflict-repair']) / 3) * 1.2;
  const judging = scoreById['execution-work-style'] + (scoreById['identity-drive'] * 0.2);
  const perceiving = scoreById.adaptability + (scoreById['social-presence'] * 0.2);
  return `${extroversion >= introversion ? 'E' : 'I'}${intuition >= sensing ? 'N' : 'S'}${thinking >= feeling ? 'T' : 'F'}${judging >= perceiving ? 'J' : 'P'}`;
}

function deriveCollaborationSnapshot(scoreById, rankedDimensions) {
  const structure = (scoreById['execution-work-style'] + scoreById['identity-drive']) / 2;
  const peopleFocus = (scoreById.collaboration + scoreById.communication + scoreById['social-presence']) / 3;
  if (scoreById.adaptability > structure) return {
    bestWith: ['Flexible teams', 'Iterative work', 'Changing priorities'],
    friction: ['Overly rigid processes', 'Excessive approvals', 'Plans that cannot adapt'],
    tip: 'Share your evolving thinking early, then align the team on what is changing and why.',
  };
  if (peopleFocus >= structure) return {
    bestWith: ['Shared problem solving', 'Frequent alignment', 'Open communication'],
    friction: ['Isolated decision making', 'Poor communication', 'Work that lacks collaboration'],
    tip: 'Use regular alignment points to connect perspectives and turn shared context into action.',
  };
  return {
    bestWith: ['Clear objectives', 'Defined ownership', 'Predictable checkpoints'],
    friction: ['Ambiguous responsibilities', 'Rapid changes without context', 'Highly unstructured collaboration'],
    tip: 'Provide clear objectives and context, then allow room to determine the approach.',
  };
}

// Temporary deterministic mapping from placeholder responses to profile results. Replace with the 63-trait scoring service later.
export function generateInitialSwellProfile(profileData, responses) {
  const dimensionResults = assessmentDimensions.map((dimension, index) => {
    const selectedIndex = dimension.choices.indexOf(responses[dimension.id]);
    const score = [88, 74, 60][selectedIndex < 0 ? 1 : selectedIndex] + (index % 2 ? 2 : 0);
    return { ...workplaceDimensions[index], id: dimension.id, score };
  });
  const scoreFor = (dimensionId) => dimensionResults.find((dimension) => dimension.id === dimensionId)?.score ?? 70;
  const scoreById = Object.fromEntries(dimensionResults.map(({ id, score }) => [id, score]));
  const generatedTraits = Object.entries(traitToDimension).map(([name, dimensionId]) => ({ name, score: scoreFor(dimensionId), ...traitDetails[name] }));
  const rankedDimensions = [...dimensionResults].sort((a, b) => b.score - a.score);
  const growthDimensions = [...dimensionResults].sort((a, b) => a.score - b.score);
  const archetypeMatches = rankArchetypes(scoreById);
  const [bestMatch, secondMatch] = archetypeMatches;
  const completeness = Math.min(1, Object.keys(responses).length / assessmentDimensions.length);
  const confidence = Math.max(61, Math.min(93, Math.round(55 + (completeness * 10) + ((bestMatch.matchScore - secondMatch.matchScore) * 1.25))));
  const labels = rankedDimensions.slice(0, 3).map((dimension) => descriptorByDimension[dimension.id]);
  const communicationScore = generatedTraits.find((trait) => trait.name === 'Communication')?.score ?? 70;
  const profile = { ...profileData, archetype: bestMatch.name, personality: deriveMbti(scoreById), confidence, labels, description: bestMatch.description };
  const growthAreas = growthDimensions.slice(0, 3).map((dimension) => growthByDimension[dimension.id]);
  const strengths = rankedDimensions.slice(0, 3).map((dimension) => strengthByDimension[dimension.id]);
  const goals = growthDimensions.slice(0, 4).map((dimension, index) => ({
    title: growthByDimension[dimension.id],
    detail: `Build on your ${dimension.name.toLowerCase()} through deliberate workplace practice.`,
    progress: Math.max(35, dimension.score - 18), color: ['pink', 'violet', 'amber', 'teal'][index],
  }));
  return {
    profile, responses, traits: generatedTraits, workplaceDimensions: dimensionResults, strengths, growthAreas,
    archetypeMatches: archetypeMatches.map(({ name, matchScore }) => ({ name, matchScore })),
    collaborationSnapshot: deriveCollaborationSnapshot(scoreById, rankedDimensions),
    communicationPreferences: communicationScore < 70
      ? ['Benefits from context before decisions', 'Values time to prepare a clear point of view', 'Responds well to explicit ownership']
      : ['Shares context early', 'Adapts communication to the audience', 'Responds well to frequent alignment'],
    goals,
    communicationTrend: [{ week: 'Week 1', value: Math.max(50, communicationScore - 9) }, { week: 'Week 4', value: Math.max(54, communicationScore - 5) }, { week: 'Week 8', value: communicationScore }],
  };
}
