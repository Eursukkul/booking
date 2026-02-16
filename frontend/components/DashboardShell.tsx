'use client';

import { ReactNode } from 'react';

interface DashboardShellProps {
  title: string;
  role: 'admin' | 'user';
  onSwitchRole: () => void;
  sidebarItems?: { label: string; active?: boolean; onClick?: () => void }[];
  children: ReactNode;
}

function SidebarIcon({ name }: { name: 'home' | 'history' | 'switch' | 'logout' }) {
  if (name === 'home') {
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M9 22V12H15V22"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  if (name === 'history') {
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M22 12H16L14 15H10L8 12H2"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M5.45 5.11L2 12V18C2 18.5304 2.21071 19.0391 2.58579 19.4142C2.96086 19.7893 3.46957 20 4 20H20C20.5304 20 21.0391 19.7893 21.4142 19.4142C21.7893 19.0391 22 18.5304 22 18V12L18.55 5.11C18.3844 4.77679 18.1292 4.49637 17.813 4.30028C17.4967 4.10419 17.1321 4.0002 16.76 4H7.24C6.86792 4.0002 6.50326 4.10419 6.18704 4.30028C5.87083 4.49637 5.61558 4.77679 5.45 5.11Z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  if (name === 'switch') {
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M1 4V10H7"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M23 20V14H17"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M20.49 8.99959C19.9828 7.56637 19.1209 6.28499 17.9845 5.27501C16.8482 4.26502 15.4745 3.55935 13.9917 3.22385C12.5089 2.88834 10.9652 2.93393 9.50481 3.35636C8.04437 3.77879 6.71475 4.5643 5.64 5.63959L1 9.99959M23 13.9996L18.36 18.3596C17.2853 19.4349 15.9556 20.2204 14.4952 20.6428C13.0348 21.0652 11.4911 21.1108 10.0083 20.7753C8.52547 20.4398 7.1518 19.7342 6.01547 18.7242C4.87913 17.7142 4.01717 16.4328 3.51 14.9996"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  const common = {
    width: 18,
    height: 18,
    viewBox: '0 0 24 24',
    fill: 'none' as const,
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const
  };

  return (
    <svg {...common}>
      <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
      <path d="M10 17l5-5-5-5" />
      <path d="M15 12H3" />
    </svg>
  );
}

export function DashboardShell({
  title,
  role,
  onSwitchRole,
  sidebarItems = [],
  children
}: DashboardShellProps) {
  const switchLabel = role === 'admin' ? 'Switch to user' : 'Switch to Admin';

  return (
    <div className="screen-wrap">
      <aside className="sidebar">
        <h2>{title}</h2>
        {sidebarItems.length > 0 ? (
          <nav>
            {sidebarItems.map((item) => (
              <button
                key={item.label}
              className={`nav-item ${item.active ? 'active' : ''}`}
              onClick={item.onClick}
              type="button"
            >
              <span className="icon-inline">
                <SidebarIcon name={item.label.toLowerCase().includes('history') ? 'history' : 'home'} />
              </span>
              {item.label}
            </button>
          ))}
          </nav>
        ) : null}
        <button className="ghost-btn sidebar-switch" type="button" onClick={onSwitchRole}>
          <span className="icon-inline">
            <SidebarIcon name="switch" />
          </span>
          {switchLabel}
        </button>
        <div className="sidebar-bottom">
          <button className="logout-btn" type="button">
            <span className="icon-inline">
              <SidebarIcon name="logout" />
            </span>
            Logout
          </button>
        </div>
      </aside>
      <main className="content">{children}</main>
    </div>
  );
}
