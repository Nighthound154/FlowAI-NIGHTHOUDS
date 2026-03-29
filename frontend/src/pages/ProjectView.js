import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import styles from './ProjectView.module.css';

const Tag = ({ children, color = 'amber' }) => (
  <span className={`${styles.tag} ${styles['tag_' + color]}`}>{children}</span>
);

const ProjectView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('research');

  useEffect(() => {
    api.get(`/projects/${id}`)
      .then(res => setData(res.data))
      .catch(() => setError('Project not found or access denied.'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className={styles.page}>
      <div className={styles.loading}>
        <div className="ph-line" style={{ width: 200, height: 20, marginBottom: 12 }} />
        <div className="ph-line" style={{ width: 300, height: 14 }} />
      </div>
    </div>
  );

  if (error) return (
    <div className={styles.page}>
      <div className={styles.errorBox}>{error}</div>
      <button className={styles.backBtn} onClick={() => navigate('/dashboard')}>← Back to Dashboard</button>
    </div>
  );

  const { project, results } = data;
  const r = results;

  const TABS = [
    { key: 'research', label: '🔍 Research' },
    { key: 'plan', label: '🏗 Plan' },
    { key: 'content', label: '🎨 Content' },
    { key: 'learning', label: '🎓 Learning' },
  ];

  return (
    <div className={styles.page}>
      <div className={styles.topBar}>
        <button className={styles.backBtn} onClick={() => navigate('/dashboard')}>← Dashboard</button>
        <span className={styles.date}>{new Date(project.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
      </div>

      <div className={styles.hero}>
        <div className={styles.heroBadge}>Execution Plan</div>
        <h1 className={styles.heroTitle}>{project.title}</h1>
        <p className={styles.heroIdea}>{project.idea}</p>
      </div>

      <div className={styles.tabs}>
        {TABS.map(t => (
          <button key={t.key} className={`${styles.tab} ${activeTab === t.key ? styles.activeTab : ''}`} onClick={() => setActiveTab(t.key)}>
            {t.label}
          </button>
        ))}
      </div>

      <div className={styles.content}>
        {activeTab === 'research' && r.research && (
          <div className={styles.panel}>
            <div className={styles.twoCol}>
              <div className={styles.infoCard}>
                <div className={styles.cardLabel}>Market Opportunity</div>
                <p className={styles.prose}>{r.research.market_opportunity}</p>
              </div>
              <div className={styles.infoCard}>
                <div className={styles.cardLabel}>Market Size</div>
                <p className={styles.prose}>{r.research.market_size}</p>
              </div>
            </div>
            <div className={styles.twoCol}>
              <div className={styles.infoCard}>
                <div className={styles.cardLabel}>Target Audience</div>
                <div className={styles.tagRow}>{r.research.target_audience?.map(t => <Tag key={t} color="blue">{t}</Tag>)}</div>
              </div>
              <div className={styles.infoCard}>
                <div className={styles.cardLabel}>Competitors</div>
                <div className={styles.tagRow}>{r.research.competitors?.map(t => <Tag key={t} color="amber">{t}</Tag>)}</div>
              </div>
            </div>
            <div className={styles.infoCard}>
              <div className={styles.cardLabel}>Pain Points Addressed</div>
              <div className={styles.bullets}>{r.research.pain_points?.map((p, i) => <div key={i} className={styles.bullet}><span className={styles.dot} />{p}</div>)}</div>
            </div>
            <div className={styles.highlightCard}>
              <div className={styles.cardLabel}>Competitive Edge</div>
              <p className={styles.highlightText}>{r.research.competitive_edge}</p>
            </div>
          </div>
        )}

        {activeTab === 'plan' && r.plan && (
          <div className={styles.panel}>
            <div className={styles.infoCard}>
              <div className={styles.cardLabel}>Tech Stack</div>
              <div className={styles.tagRow}>{r.plan.tech_stack?.map(t => <Tag key={t} color="purple">{t}</Tag>)}</div>
            </div>
            <div className={styles.infoCard}>
              <div className={styles.cardLabel}>MVP Features</div>
              <div className={styles.bullets}>{r.plan.mvp_features?.map((f, i) => <div key={i} className={styles.bullet}><span className={styles.numBullet}>{i + 1}</span>{f}</div>)}</div>
            </div>
            <div className={styles.infoCard}>
              <div className={styles.cardLabel}>Project Phases</div>
              {r.plan.phases?.map((p, i) => (
                <div key={i} className={styles.phaseRow}>
                  <div className={styles.phaseNum}>{i + 1}</div>
                  <div>
                    <div className={styles.phaseName}>{p.name}</div>
                    <div className={styles.phaseDesc}>{p.description}</div>
                    <div className={styles.phaseDeliverable}>→ {p.deliverable}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className={styles.infoCard}>
              <div className={styles.cardLabel}>Risks to Watch</div>
              <div className={styles.bullets}>{r.plan.risks?.map((r, i) => <div key={i} className={styles.bullet}><span style={{ color: 'var(--red)' }}>⚠</span>{r}</div>)}</div>
            </div>
          </div>
        )}

        {activeTab === 'content' && r.content && (
          <div className={styles.panel}>
            <div className={styles.pitchHero}>
              <div className={styles.cardLabel}>Elevator Pitch</div>
              <div className={styles.pitchText}>"{r.content.elevator_pitch}"</div>
              <div className={styles.taglineText}>{r.content.tagline}</div>
            </div>
            <div className={styles.infoCard}>
              <div className={styles.cardLabel}>Brand Voice</div>
              <div className={styles.tagRow}>{r.content.brand_voice?.map(t => <Tag key={t} color="amber">{t}</Tag>)}</div>
            </div>
            <div className={styles.infoCard}>
              <div className={styles.cardLabel}>Social Post Ideas</div>
              {r.content.social_posts?.map((p, i) => (
                <div key={i} className={styles.postRow}>
                  <span className={styles.platform}>{['LinkedIn', 'X (Twitter)', 'Instagram'][i]}</span>
                  <p className={styles.prose}>{p}</p>
                </div>
              ))}
            </div>
            <div className={styles.infoCard}>
              <div className={styles.cardLabel}>Pitch Deck Outline</div>
              <div className={styles.bullets}>{r.content.pitch_deck_outline?.map((s, i) => <div key={i} className={styles.bullet}><span className={styles.numBullet}>{i + 1}</span>{s}</div>)}</div>
            </div>
          </div>
        )}

        {activeTab === 'learning' && r.learning && (
          <div className={styles.panel}>
            {r.learning.skills?.map((s, i) => (
              <div key={i} className={styles.skillCard}>
                <div className={styles.skillTop}>
                  <span className={styles.skillNum}>{i + 1}</span>
                  <span className={styles.skillName}>{s.skill}</span>
                  <span className={styles.skillTime}>{s.time}</span>
                </div>
                <p className={styles.skillWhy}>{s.why}</p>
                <p className={styles.skillResource}>📚 {s.resource}</p>
              </div>
            ))}
            <div className={styles.infoCard}>
              <div className={styles.cardLabel}>Quick Wins</div>
              {r.learning.quick_wins?.map((w, i) => (
                <div key={i} className={styles.bullet}>
                  <span className={styles.winLabel}>{['Today', 'This Week', 'This Month'][i]}</span>
                  {w}
                </div>
              ))}
            </div>
            <div className={styles.timelineCard}>
              <span className={styles.cardLabel}>Total Timeline to MVP-Ready</span>
              <span className={styles.timelineVal}>{r.learning.timeline}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectView;
