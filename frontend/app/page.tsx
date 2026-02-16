'use client';

import { useMemo, useState } from 'react';
import { AdminView } from '../components/AdminView';
import { DashboardShell } from '../components/DashboardShell';
import { UserView } from '../components/UserView';

export default function Page() {
  const [role, setRole] = useState<'admin' | 'user'>('admin');
  const [adminTab, setAdminTab] = useState<'overview' | 'create' | 'history'>('overview');

  const sidebarItems = useMemo(() => {
    if (role === 'admin') {
      return [
        { label: 'Home', active: adminTab !== 'history', onClick: () => setAdminTab('overview') },
        { label: 'History', active: adminTab === 'history', onClick: () => setAdminTab('history') }
      ];
    }

    return [];
  }, [adminTab, role]);

  const handleSwitchRole = () => {
    setRole((prev) => {
      if (prev === 'admin') {
        return 'user';
      }

      setAdminTab('overview');
      return 'admin';
    });
  };

  return (
    <DashboardShell
      title={role === 'admin' ? 'Admin' : 'User'}
      role={role}
      onSwitchRole={handleSwitchRole}
      sidebarItems={sidebarItems}
    >
      {role === 'admin' ? (
        <AdminView tab={adminTab} onTabChange={setAdminTab} />
      ) : (
        <UserView />
      )}
    </DashboardShell>
  );
}
