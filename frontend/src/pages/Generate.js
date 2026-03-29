import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import styles from './Generate.module.css';

const EXAMPLES = [
  'An app that helps students track study time with Pomodoro sessions and performance analytics',
  'A subscription box for indie board games delivered monthly with curator notes',
  'A freelance marketplace for regional language content creators in India',
  'An AI tutoring platform for JEE and NEET preparation with adaptive practice',
  'A peer-to-peer skill exchange platform where people trade skills without money',
];

const STEPS = ['Idea', 'Research', 'Plan', 'Content', 'Learning', 'Done'];

const Tag = ({ children, color = 'amber' }) => (
  <span className={`${styles.tag} ${styles['tag_' + color]}`}>{children}</span>
);

const SectionLabel = ({ children }) => <div className={styles.sectionLabel}>{children}</div>;

const ResearchModule = ({ d }) => (
  <div className={styles.moduleBody}>
    <div className={styles.section}>
      <SectionLabel>Market Opportunity</SectionLabel>
      <p className={styles.prose}>{d.market_opportunity}</p>
    </div>
    <div className={styles.section}>
      <SectionLabel>Market Size</SectionLabel>
      <p className={styles.prose}>{d.market_size}</p>
    </div>
    <div className={styles.twoCol}>
      <div>
        <SectionLabel>Target Audience</SectionLabel>
        <div className={styles.tagRow}>{d.target_audience?.map(t => <Tag key={t} color="blue">{t}</Tag>)}</div>
      </div>
      <div>
        <SectionLabel>Competitors</SectionLabel>
        <div className={styles.tagRow}>{d.competitors?.map(t => <Tag key={t} color="amber">{t}</Tag>)}</div>
      </div>
    </div>
    <div className={styles.section}>
      <SectionLabel>Pain Points</SectionLabel>
      <div className={styles.bullets}>{d.pain_points?.map((p, i) => <div key={i} className={styles.bullet}><span className={styles.dot} />  {p}</div>)}</div>
    </div>
    <div className={styles.section}>
      <SectionLabel>Competitive Edge</SectionLabel>
      <p className={styles.prose} style={{ fontStyle: 'italic', color: 'var(--text)' }}>{d.competitive_edge}</p>
    </div>
  </div>
);

const PlanModule = ({ d }) => (
  <div className={styles.moduleBody}>
    <div className={styles.section}>
      <SectionLabel>Tech Stack</SectionLabel>
      <div className={styles.tagRow}>{d.tech_stack?.map(t => <Tag key={t} color="purple">{t}</Tag>)}</div>
    </div>
    <div className={styles.section}>
      <SectionLabel>MVP Features</SectionLabel>
      <div className={styles.bullets}>{d.mvp_features?.map((f, i) => <div key={i} className={styles.bullet}><span className={styles.numDot}>{i+1}</span>{f}</div>)}</div>
    </div>
    <div className={styles.section}>
      <SectionLabel>Phases</SectionLabel>
      {d.phases?.map((p, i) => (
        <div key={i} className={styles.timelineItem}>
          <div className={styles.timelineDot} />
          {i < d.phases.length - 1 && <div className={styles.timelineLine} />}
          <div>
            <div className={styles.timelinePhase}>{p.name}</div>
            <div className={styles.timelineDesc}>{p.description}</div>
            <div className={styles.timelineDeliverable}>→ {p.deliverable}</div>
          </div>
        </div>
      ))}
    </div>
    <div className={styles.section}>
      <SectionLabel>Risks to Watch</SectionLabel>
      <div className={styles.bullets}>{d.risks?.map((r, i) => <div key={i} className={styles.bullet}><span style={{ color: 'var(--red)', flexShrink: 0 }}>⚠</span>{r}</div>)}</div>
    </div>
  </div>
);

const ContentModule = ({ d }) => (
  <div className={styles.moduleBody}>
    <div className={styles.pitchBox}>
      <div className={styles.pitchLabel}>Elevator Pitch</div>
      <div className={styles.pitch}>"{d.elevator_pitch}"</div>
      <div className={styles.tagline}>{d.tagline}</div>
    </div>
    <div className={styles.section}>
      <SectionLabel>Brand Voice</SectionLabel>
      <div className={styles.tagRow}>{d.brand_voice?.map(t => <Tag key={t} color="amber">{t}</Tag>)}</div>
    </div>
    <div className={styles.section}>
      <SectionLabel>Social Post Ideas</SectionLabel>
      <div className={styles.bullets}>{d.social_posts?.map((p, i) => (
        <div key={i} className={styles.bullet}><span className={styles.platformDot}>{['in','𝕏','ig'][i]}</span>{p}</div>
      ))}</div>
    </div>
    <div className={styles.section}>
      <SectionLabel>Pitch Deck Outline</SectionLabel>
      <div className={styles.bullets}>{d.pitch_deck_outline?.map((s, i) => <div key={i} className={styles.bullet}><span className={styles.numDot}>{i+1}</span>{s}</div>)}</div>
    </div>
  </div>
);

const LearningModule = ({ d }) => (
  <div className={styles.moduleBody}>
    <div className={styles.section}>
      <SectionLabel>Skills Roadmap</SectionLabel>
      {d.skills?.map((s, i) => (
        <div key={i} className={styles.skillCard}>
          <div className={styles.skillHeader}>
            <span className={styles.skillNum}>{i + 1}</span>
            <span className={styles.skillName}>{s.skill}</span>
            <span className={styles.skillTime}>{s.time}</span>
          </div>
          <p className={styles.skillWhy}>{s.why}</p>
          <p className={styles.skillResource}>📚 {s.resource}</p>
        </div>
      ))}
    </div>
    <div className={styles.section}>
      <SectionLabel>Quick Wins</SectionLabel>
      {d.quick_wins?.map((w, i) => (
        <div key={i} className={styles.bullet}>
          <span className={styles.numDot}>{['Today', 'Week', 'Month'][i]}</span>
          {w}
        </div>
      ))}
    </div>
    <div className={styles.timelineSummary}>
      <span className={styles.timelineSummaryLabel}>Total Timeline</span>
      <span className={styles.timelineSummaryVal}>{d.timeline}</span>
    </div>
  </div>
);

const MODULE_META = [
  { key: 'research', icon: '🔍', title: 'Market Research', sub: 'Competitors · Audience · Opportunities', Component: ResearchModule },
  { key: 'plan', icon: '🏗', title: 'Project Plan', sub: 'Milestones · Tech Stack · Timeline', Component: PlanModule },
  { key: 'content', icon: '🎨', title: 'Content Strategy', sub: 'Pitch · Posts · Brand Voice', Component: ContentModule },
  { key: 'learning', icon: '🎓', title: 'Learning Roadmap', sub: 'Skills · Resources · Roadmap', Component: LearningModule },
];

const Generate = () => {
  const navigate = useNavigate();
  const [idea, setIdea] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [project, setProject] = useState(null);
  const [error, setError] = useState('');
  const [stepIndex, setStepIndex] = useState(0);

  const run = async () => {
    if (!idea.trim() || idea.trim().length < 10) { setError('Please describe your idea in at least 10 characters.'); return; }
    setError('');
    setResults(null);
    setProject(null);
    setLoading(true);
    setStepIndex(1);

    // Simulate step progression while waiting
    const stepTimer = setInterval(() => {
      setStepIndex(prev => prev < 4 ? prev + 1 : prev);
    }, 5000);

    try {
      const res = await api.post('/generate', { idea });
      clearInterval(stepTimer);
      setStepIndex(5);
      setResults(res.data.results);
      setProject(res.data.project);
    } catch (err) {
      clearInterval(stepTimer);
      setStepIndex(0);
      setError(err.response?.data?.error || 'Generation failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const reset = () => { setIdea(''); setResults(null); setProject(null); setError(''); setStepIndex(0); };

  return (
    <div className={styles.page}>
      {!results ? (
        <div className={styles.inputSection}>
          <div className={styles.inputHeader}>
            <div className={styles.heroTag}>AI-Integrated Productivity Platform</div>
            <h1 className={styles.heading}>Turn your <em>idea</em> into<br />an execution plan</h1>
            <p className={styles.sub}>Describe any raw concept. FlowAI generates Research, Project Plan, Content Strategy, and a Learning Roadmap in seconds.</p>
          </div>

          <div className={`${styles.inputWrap} ${idea.length > 0 ? styles.focused : ''}`}>
            <textarea
              className={styles.textarea}
              value={idea}
              onChange={e => setIdea(e.target.value)}
              placeholder="Describe your idea… e.g. 'An app that helps college students find affordable housing near their campus with verified listings'"
              rows={4}
              disabled={loading}
              onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) run(); }}
            />
            <div className={styles.inputFooter}>
              <span className={styles.charCount} style={{ color: idea.length > 1800 ? 'var(--red)' : 'var(--text3)' }}>
                {idea.length}/2000
              </span>
              <button className={styles.runBtn} onClick={run} disabled={loading || !idea.trim()}>
                {loading ? <><span className="spinner" />&nbsp;Processing…</> : 'Generate ↗'}
              </button>
            </div>
          </div>

          {error && <div className={styles.errorBox}>{error}</div>}

          {loading && (
            <div className={styles.pipeline}>
              {STEPS.map((s, i) => (
                <React.Fragment key={s}>
                  <div className={`${styles.pStep} ${i < stepIndex ? styles.done : i === stepIndex ? styles.active : ''}`}>
                    <div className={styles.pDot}>{i < stepIndex ? '✓' : i + 1}</div>
                    <span className={styles.pLabel}>{s}</span>
                  </div>
                  {i < STEPS.length - 1 && <div className={styles.pArrow} />}
                </React.Fragment>
              ))}
            </div>
          )}

          {!loading && (
            <div className={styles.examples}>
              <span className={styles.examplesLabel}>Try an example:</span>
              {EXAMPLES.map((ex, i) => (
                <button key={i} className={styles.exampleChip} onClick={() => setIdea(ex)}>
                  {ex.length > 55 ? ex.slice(0, 55) + '…' : ex}
                </button>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className={styles.resultsSection}>
          <div className={styles.resultsHeader}>
            <div>
              <h2 className={styles.resultTitle}>{project?.title}</h2>
              <p className={styles.resultIdea}>{project?.idea?.length > 120 ? project.idea.slice(0, 120) + '…' : project?.idea}</p>
            </div>
            <div className={styles.resultActions}>
              <button className={styles.viewBtn} onClick={() => navigate(`/projects/${project.id}`)}>View Saved →</button>
              <button className={styles.resetBtn} onClick={reset}>+ New Idea</button>
            </div>
          </div>

          <div className={styles.modulesGrid}>
            {MODULE_META.map(({ key, icon, title, sub, Component }, i) => (
              results[key] ? (
                <div key={key} className={styles.moduleCard} style={{ animationDelay: `${i * 0.08}s` }}>
                  <div className={styles.moduleHeader}>
                    <div className={styles.moduleIcon}>{icon}</div>
                    <div>
                      <div className={styles.moduleTitle}>{title}</div>
                      <div className={styles.moduleSub}>{sub}</div>
                    </div>
                    <span className={styles.doneBadge}>✓ Done</span>
                  </div>
                  <Component d={results[key]} />
                </div>
              ) : null
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Generate;
