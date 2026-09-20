import React, { useEffect, useRef, Suspense } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { BRAND_NAME, DEMO_USER } from './config';
import { InitialsAvatar } from '@/components/ui/InitialsAvatar';
import { RouteLoadingFallback } from '@/components/ui/RouteLoadingFallback';
import styles from './AppShell.module.css';

export const AppShell: React.FC = () => {
  const location = useLocation();
  const isFirstRender = useRef(true);

  // Manage route focus on client-side navigation (supports lazy route chunks)
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    let isDisposed = false;

    const attemptFocus = () => {
      if (isDisposed) return false;
      const mainEl = document.getElementById('main-content');
      const h1El = mainEl?.querySelector('h1') as HTMLElement | null;

      if (h1El) {
        h1El.setAttribute('tabindex', '-1');
        h1El.focus();
        return true;
      }
      return false;
    };

    if (!attemptFocus()) {
      const intervalId = setInterval(() => {
        if (attemptFocus()) {
          clearInterval(intervalId);
        }
      }, 50);

      const timeoutId = setTimeout(() => {
        clearInterval(intervalId);
        if (!isDisposed) {
          const mainEl = document.getElementById('main-content');
          if (mainEl && !mainEl.contains(document.activeElement)) {
            mainEl.setAttribute('tabindex', '-1');
            mainEl.focus();
          }
        }
      }, 600);

      return () => {
        isDisposed = true;
        clearInterval(intervalId);
        clearTimeout(timeoutId);
      };
    }

    return () => {
      isDisposed = true;
    };
  }, [location.pathname]);

  return (
    <div className={styles.shell}>
      <a href="#main-content" className={styles.skipLink}>
        Skip to main content
      </a>

      <header className={styles.topNav} role="banner">
        <div className={styles.navContainer}>
          <div className={styles.leftGroup}>
            <NavLink to="/overview" className={styles.brand} aria-label={`${BRAND_NAME} Home`}>
              <span className={styles.brandDot} aria-hidden="true" />
              <span>{BRAND_NAME}</span>
            </NavLink>

            <nav aria-label="Main Navigation">
              <ul className={styles.navLinks}>
                <li className={styles.navItem}>
                  <NavLink
                    to="/overview"
                    className={({ isActive }) =>
                      `${styles.navLink} ${isActive ? styles.active : ''}`
                    }
                  >
                    Overview
                  </NavLink>
                </li>
                <li className={styles.navItem}>
                  <NavLink
                    to="/employees"
                    className={({ isActive }) =>
                      `${styles.navLink} ${isActive ? styles.active : ''}`
                    }
                  >
                    Employees
                  </NavLink>
                </li>
                <li className={styles.navItem}>
                  <NavLink
                    to="/onboarding"
                    className={({ isActive }) =>
                      `${styles.navLink} ${isActive ? styles.active : ''}`
                    }
                  >
                    Onboarding
                  </NavLink>
                </li>
              </ul>
            </nav>
          </div>

          <div className={styles.userIdentity} aria-label={`Logged in as ${DEMO_USER.name}`}>
            <InitialsAvatar initials={DEMO_USER.initials} size="md" />
            <div className={styles.userDetails}>
              <span className={styles.userName}>{DEMO_USER.name}</span>
              <span className={styles.userRole}>{DEMO_USER.role}</span>
            </div>
          </div>
        </div>
      </header>

      <main className={styles.mainContent} id="main-content">
        <Suspense fallback={<RouteLoadingFallback />}>
          <Outlet />
        </Suspense>
      </main>
    </div>
  );
};
