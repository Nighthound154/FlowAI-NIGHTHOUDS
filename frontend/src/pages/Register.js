import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './Auth.module.css';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password.length < 8) { setError('Password must be at least 8 characters'); return; }
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page + ' glass fadeIn'}>
      <div className={styles.card}>
        <div className={styles.logoRow}>
          <div className={styles.logoIcon}>F</div>
          <span className={styles.logoText}>Flow<em>AI</em></span>
        </div>
        <h1 className={styles.heading}>Create your account</h1>
        <p className={styles.sub}>Join NIGHTHOUNDS — idea to execution, instantly</p>

        {error && <div className={styles.errorBox}>{error}</div>}

        <form onSubmit={submit} className={styles.form}>
          <div className={styles.field}>
            <label className={styles.label}>Full Name</label>
            <input className={styles.input} type="text" name="name" value={form.name} onChange={handle} placeholder="Faizan Haider Khan" required autoFocus />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Email</label>
            <input className={styles.input} type="email" name="email" value={form.email} onChange={handle} placeholder="you@example.com" required />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Password <span className={styles.hint}>(min 8 characters)</span></label>
            <input className={styles.input} type="password" name="password" value={form.password} onChange={handle} placeholder="••••••••" required />
          </div>
          <button className={styles.btn} type="submit" disabled={loading}>
            {loading ? <span className="spinner" /> : 'Create Account →'}
          </button>
        </form>

        <p className={styles.switchText}>
          Already have an account? <Link to="/login" className={styles.link}>Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
