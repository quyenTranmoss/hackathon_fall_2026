import React from 'react';
import { ArrowLeft, ArrowRight, Check, Sparkles } from 'lucide-react';
import { assessmentDimensions } from '../../data/swellMockData';

export default function SwellAssessment({ assessment, onChange, onComplete }) {
  const { status, responses } = assessment;
  const activeIndex = assessment.currentIndex ?? 0;
  const activeDimension = assessmentDimensions[activeIndex];
  const completedCount = Object.keys(responses).length;

  if (status === 'welcome') return <section className="swell-assessment assessment-welcome">
    <div className="assessment-mark"><Sparkles size={20} /></div>
    <div className="card-kicker">CREATE YOUR SWELL PROFILE</div>
    <h2>Understand how you work, communicate, and collaborate.</h2>
    <div className="assessment-meta">63 evolving traits <span>·</span> 9 workplace dimensions</div>
    <p>Your profile isn't a fixed personality type. It develops as Swell learns from your responses and interactions.</p>
    <button className="assessment-primary" onClick={() => onChange({ ...assessment, status: 'inProgress', currentIndex: 0 })}>Begin <ArrowRight size={17} /></button>
  </section>;

  if (status === 'complete') return <section className="swell-assessment assessment-complete">
    <div className="assessment-mark complete"><Check size={24} /></div>
    <div className="card-kicker">INITIAL PROFILE COMPLETE</div>
    <h2>Your Swell Profile is taking shape.</h2>
    <div className="completion-stats"><div><b>63</b><span>traits completed</span></div><div><b>9</b><span>workplace dimensions mapped</span></div></div>
    <p>Your responses give Swell a starting picture of how you work. Your profile can continue evolving as you interact with your team.</p>
    <button className="assessment-primary" onClick={() => onComplete(responses)}>View My Swell <ArrowRight size={17} /></button>
  </section>;

  const selectedChoice = responses[activeDimension.id];
  const selectChoice = (choice) => onChange({ ...assessment, responses: { ...responses, [activeDimension.id]: choice } });
  const goPrevious = () => onChange({ ...assessment, currentIndex: Math.max(0, activeIndex - 1) });
  const next = () => {
    if (activeIndex === assessmentDimensions.length - 1) onChange({ ...assessment, status: 'complete' });
    else onChange({ ...assessment, currentIndex: activeIndex + 1 });
  };

  return <section className="swell-assessment assessment-flow">
    <div className="assessment-topline"><div><span>{activeDimension.name.toUpperCase()}</span><p>{activeDimension.description}</p></div><b>{activeIndex + 1} / {assessmentDimensions.length} dimensions</b></div>
    <div className="assessment-progress"><i style={{ width: `${(completedCount / assessmentDimensions.length) * 100}%` }} /></div>
    <article className="card assessment-question"><span className="trait-reference">WORKPLACE TRAIT · {activeDimension.trait}</span><h2>{activeDimension.question}</h2><div className="answer-list">{activeDimension.choices.map((choice) => <button key={choice} className={selectedChoice === choice ? 'selected' : ''} onClick={() => selectChoice(choice)}><span>{choice}</span><i>{selectedChoice === choice && <Check size={15} />}</i></button>)}</div></article>
    <div className="assessment-actions"><button className="assessment-secondary" disabled={activeIndex === 0} onClick={goPrevious}><ArrowLeft size={16} /> Previous</button><button className="assessment-primary" disabled={!selectedChoice} onClick={next}>{activeIndex === assessmentDimensions.length - 1 ? 'Complete assessment' : 'Next'} <ArrowRight size={17} /></button></div>
    <p className="assessment-resume">Your responses are saved in this profile while you complete the assessment.</p>
  </section>;
}
