import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './Layout.module.css';

const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className={styles.shell}>
      <aside className={`${styles.sidebar} ${collapsed ? styles.collapsed : ''}`}>
        <div className={styles.sideTop}>
          <div className={styles.logo}>
            <div className={styles.logoIcon}>F</div>
            {!collapsed && <span className={styles.logoText}>Flow<em>AI</em></span>}
          </div>
          <button className={styles.collapseBtn} onClick={() => setCollapsed(!collapsed)}>
            {collapsed ? '›' : '‹'}
          </button>
        </div>

        <nav className={styles.nav}>
          <NavLink to="/dashboard" className={({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ''}`}>
            <span className={styles.navIcon}>⊞</span>
            {!collapsed && <span>Dashboard</span>}
          </NavLink>
          <NavLink to="/generate" className={({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ''}`}>
            <span className={styles.navIcon}>✦</span>
            {!collapsed && <span>New Idea</span>}
          </NavLink>
        </nav>

        <div className={styles.sideBottom}>
          <div className={styles.userCard}>
            <div className={styles.avatar}>{user?.name?.[0]?.toUpperCase()}</div>
            {!collapsed && (
              <div className={styles.userInfo}>
                <span className={styles.userName}>{user?.name}</span>
                <span className={styles.userEmail}>{user?.email}</span>
              </div>
            )}
          </div>
          <button className={styles.logoutBtn} onClick={handleLogout} title="Logout">
            <span>⏻</span>
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      <main className={styles.main + ' fadeIn'}>
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
