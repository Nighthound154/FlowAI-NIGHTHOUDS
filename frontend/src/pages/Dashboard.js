import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import styles from './Dashboard.module.css';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    api.get('/projects')
      .then(res => setProjects(res.data.projects))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id, e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!window.confirm('Delete this project?')) return;
    setDeleting(id);
    try {
      await api.delete(`/projects/${id}`);
      setProjects(prev => prev.filter(p => p.id !== id));
    } catch { alert('Failed to delete.'); }
    finally { setDeleting(null); }
  };

  const formatDate = (iso) => new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.heading}>
            Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'},
            <span> {user?.name?.split(' ')[0]}</span>
          </h1>
          <p className={styles.sub}>Your ideas, organized and ready to execute.</p>
        </div>
        <button className={styles.newBtn} onClick={() => navigate('/generate')}>
          ✦ New Idea
        </button>
      </div>

      <div className={styles.statsRow}>
        <div className={styles.statCard}>
          <span className={styles.statVal}>{projects.length}</span>
          <span className={styles.statLabel}>Total Projects</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statVal}>{projects.filter(p => {
            const d = new Date(p.created_at);
            const now = new Date();
            return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
          }).length}</span>
          <span className={styles.statLabel}>This Month</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statVal}>{projects.length > 0 ? formatDate(projects[0]?.created_at) : '—'}</span>
          <span className={styles.statLabel}>Latest Project</span>
        </div>
      </div>

      {loading ? (
        <div className={styles.grid}>
          {[1,2,3].map(i => (
            <div key={i} className={styles.skeletonCard}>
              <div className="ph-line" style={{ width: '60%', height: 18, marginBottom: 12 }} />
              <div className="ph-line" style={{ width: '90%', height: 12, marginBottom: 8 }} />
              <div className="ph-line" style={{ width: '70%', height: 12 }} />
            </div>
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>✦</div>
          <h3>No projects yet</h3>
          <p>Generate your first execution plan from any idea.</p>
          <button className={styles.newBtn} onClick={() => navigate('/generate')}>Start with an idea →</button>
        </div>
      ) : (
        <div className={styles.grid}>
          {projects.map((p, i) => (
            <Link to={`/projects/${p.id}`} key={p.id} className={styles.projectCard} style={{ animationDelay: `${i * 0.05}s` }}>
              <div className={styles.cardTop}>
                <div className={styles.cardMeta}>
                  <span className={styles.cardDate}>{formatDate(p.created_at)}</span>
                  <span className={`${styles.statusBadge} ${styles['status_' + p.status]}`}>{p.status}</span>
                </div>
                <button
                  className={styles.deleteBtn}
                  onClick={(e) => handleDelete(p.id, e)}
                  disabled={deleting === p.id}
                  title="Delete"
                >
                  {deleting === p.id ? '…' : '✕'}
                </button>
              </div>
              <h3 className={styles.cardTitle}>{p.title}</h3>
              <p className={styles.cardIdea}>{p.idea.length > 100 ? p.idea.slice(0, 100) + '…' : p.idea}</p>
              <span className={styles.cardCta}>View execution plan →</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
