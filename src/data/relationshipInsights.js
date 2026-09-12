const dimensionKey = (dimension) => dimension.id ?? dimension.name.toLowerCase().replaceAll(' & ', '-').replaceAll(' ', '-');
const byDimension = (profile) => Object.fromEntries(profile.workplaceDimensions.map((dimension) => [dimensionKey(dimension), dimension]));

const alignmentCopy = {
  'identity-drive': 'Shared focus on ownership and outcomes',
  'mind-reasoning': 'Both value analytical problem solving',
  communication: 'Both respond well to clear communication',
  collaboration: 'Both value intentional alignment',
  'leadership-influence': 'Both bring direction to shared work',
  adaptability: 'Both can adjust when conditions change',
  'conflict-repair': 'Both can approach disagreement constructively',
  'execution-work-style': 'Both value reliable execution and clear milestones',
  'social-presence': 'Both are comfortable contributing in working groups',
};

const frictionCopy = {
  adaptability: (currentName, viewedName, currentHigher) => currentHigher
    ? `${currentName} may be ready to adjust quickly while ${viewedName} may prefer a more stable plan.`
    : `${viewedName} may be ready to adjust quickly while ${currentName} may prefer more continuity.`,
  'social-presence': (currentName, viewedName, currentHigher) => currentHigher
    ? `${currentName} may prefer more active discussion while ${viewedName} may value time to process independently.`
    : `${viewedName} may prefer more active discussion while ${currentName} may value time to process independently.`,
  collaboration: (currentName, viewedName, currentHigher) => currentHigher
    ? `${currentName} may seek frequent alignment while ${viewedName} may prefer greater individual ownership.`
    : `${viewedName} may seek frequent alignment while ${currentName} may prefer greater individual ownership.`,
  communication: (currentName, viewedName, currentHigher) => currentHigher
    ? `${currentName} may share thinking sooner while ${viewedName} may want more context before responding.`
    : `${viewedName} may share thinking sooner while ${currentName} may want more context before responding.`,
  'execution-work-style': (currentName, viewedName, currentHigher) => currentHigher
    ? `${currentName} may favor more structure and milestones than ${viewedName} needs.`
    : `${viewedName} may favor more structure and milestones than ${currentName} needs.`,
};

const complementCopy = {
  adaptability: (currentName, viewedName) => `${currentName} can help the pair adjust when conditions change, while ${viewedName} can protect structure and consistency.`,
  communication: (currentName, viewedName) => `${currentName} can help surface and communicate ideas, while ${viewedName} can help pressure-test the reasoning.`,
  collaboration: (currentName, viewedName) => `${currentName} can create alignment across the work, while ${viewedName} can bring focused ownership to key decisions.`,
  'leadership-influence': (currentName, viewedName) => `${currentName} can create momentum and direction, while ${viewedName} can strengthen the plan behind it.`,
};

function insightForComplement(currentDimensions, viewedDimensions, currentName, viewedName) {
  const candidates = [
    ['adaptability', 'execution-work-style'],
    ['communication', 'mind-reasoning'],
    ['collaboration', 'identity-drive'],
    ['leadership-influence', 'execution-work-style'],
  ].map(([currentKey, viewedKey]) => ({
    currentKey, viewedKey, current: currentDimensions[currentKey]?.score ?? 0, viewed: viewedDimensions[viewedKey]?.score ?? 0,
  })).filter((candidate) => candidate.current >= 74 && candidate.viewed >= 74)
    .sort((left, right) => (right.current + right.viewed) - (left.current + left.viewed));

  return candidates.slice(0, 3).map((candidate) => complementCopy[candidate.currentKey](currentName, viewedName));
}

export function generateRelationshipInsights(currentUserProfile, viewedUserProfile) {
  if (!currentUserProfile?.workplaceDimensions || !viewedUserProfile?.workplaceDimensions) return null;

  const currentDimensions = byDimension(currentUserProfile);
  const viewedDimensions = byDimension(viewedUserProfile);
  const currentName = currentUserProfile.profile.name.split(' ')[0];
  const viewedName = viewedUserProfile.profile.name.split(' ')[0];
  const shared = Object.keys(currentDimensions).filter((key) => viewedDimensions[key]).map((key) => ({
    key, current: currentDimensions[key].score, viewed: viewedDimensions[key].score,
    difference: Math.abs(currentDimensions[key].score - viewedDimensions[key].score),
  }));

  const alignmentAreas = shared.filter((dimension) => dimension.current >= 72 && dimension.viewed >= 72 && dimension.difference <= 14)
    .sort((left, right) => (Math.min(right.current, right.viewed) - right.difference) - (Math.min(left.current, left.viewed) - left.difference))
    .slice(0, 4).map((dimension) => alignmentCopy[dimension.key]);
  const frictionDimensions = shared.filter((dimension) => dimension.difference >= 18 && frictionCopy[dimension.key])
    .sort((left, right) => right.difference - left.difference).slice(0, 3);
  const frictionAreas = frictionDimensions.map((dimension) => frictionCopy[dimension.key](currentName, viewedName, dimension.current > dimension.viewed));
  const complementaryStrengths = insightForComplement(currentDimensions, viewedDimensions, currentName, viewedName);

  if (!alignmentAreas.length) alignmentAreas.push('Shared opportunity to align on objectives and ownership before execution.');
  if (!complementaryStrengths.length) complementaryStrengths.push(`${currentName} and ${viewedName} can combine their respective strengths by being explicit about who owns each part of the work.`);
  if (!frictionAreas.length) frictionAreas.push('Similar working patterns can still benefit from explicit expectations when priorities shift.');

  const communicationDynamics = [];
  if ((currentDimensions.communication?.score ?? 0) >= (viewedDimensions.communication?.score ?? 0) + 12) communicationDynamics.push(`${currentName} may share thinking sooner, while ${viewedName} may benefit from receiving the objective and relevant context first.`);
  if ((currentDimensions['social-presence']?.score ?? 0) >= (viewedDimensions['social-presence']?.score ?? 0) + 12) communicationDynamics.push(`${currentName} may prefer more active discussion; giving ${viewedName} space to process can improve the quality of the response.`);
  if ((viewedDimensions['mind-reasoning']?.score ?? 0) >= 76) communicationDynamics.push(`${viewedName} is likely to respond well when decisions are grounded in evidence and the reasoning is made visible.`);
  if (!communicationDynamics.length) communicationDynamics.push(`Both profiles support a clear, context-first communication style with defined ownership.`);

  const recommendations = [
    'Agree on the objective before discussing execution.',
    frictionDimensions.some((dimension) => dimension.key === 'execution-work-style' || dimension.key === 'adaptability') ? 'Set key milestones, then leave room to adapt the approach.' : 'Use short alignment checkpoints instead of constant coordination.',
    frictionDimensions.some((dimension) => dimension.key === 'communication' || dimension.key === 'social-presence') ? `Give ${viewedName} context before asking for a rapid decision.` : 'Define ownership clearly before work begins.',
  ];

  const compatibilitySummary = {
    naturalStrengths: alignmentAreas.length >= 2 || complementaryStrengths.length >= 2 ? 'High' : 'Moderate',
    potentialFriction: frictionDimensions.length >= 2 ? 'Moderate' : 'Low',
    communicationAdjustment: communicationDynamics.length >= 2 ? 'Medium' : 'Low',
  };

  return { alignmentAreas, complementaryStrengths, frictionAreas, communicationDynamics: communicationDynamics.slice(0, 3), recommendations, compatibilitySummary };
}
