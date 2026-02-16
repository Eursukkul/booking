'use client';

import { useEffect, useMemo, useState } from 'react';
import type { Concert, HistoryItem } from '../app.d';
import { createConcert, deleteConcert, getConcerts, getHistory, getMetrics } from '../lib/api';

type AdminTab = 'overview' | 'create' | 'history';

interface AdminViewProps {
  tab: AdminTab;
  onTabChange: (tab: AdminTab) => void;
}

function AdminIcon({ name }: { name: 'total' | 'user' | 'reserve' | 'cancel' | 'save' }) {
  if (name === 'total') {
    return (
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none" aria-hidden="true">
        <circle cx="24" cy="16" r="8" stroke="currentColor" strokeWidth="2.5" fill="none" />
        <path
          d="M8 42C8 31 16 26 24 26C32 26 40 31 40 42"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>
    );
  }

  const common = {
    width: 20,
    height: 20,
    viewBox: '0 0 24 24',
    fill: 'none' as const,
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const
  };

  if (name === 'user') {
    return (
      <svg {...common}>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21a8 8 0 0 1 16 0" />
      </svg>
    );
  }
  if (name === 'reserve') {
    return (
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none" aria-hidden="true">
        <circle cx="24" cy="16" r="10" stroke="currentColor" strokeWidth="2.5" fill="none" />
        <path
          d="M12 42L14 28L20 32L24 26L28 32L34 28L36 42H12Z"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>
    );
  }
  if (name === 'cancel') {
    return (
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none" aria-hidden="true">
        <circle cx="24" cy="24" r="18" stroke="currentColor" strokeWidth="2.5" fill="none" />
        <path
          d="M17 17L31 31"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M31 17L17 31"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <path d="M19 21H5a2 2 0 0 1-2-2V7l4-4h12a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2Z" />
      <path d="M17 21v-8H7v8" />
      <path d="M7 3v4h8" />
    </svg>
  );
}

export function AdminView({ tab, onTabChange }: AdminViewProps) {
  const [concerts, setConcerts] = useState<Concert[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [metrics, setMetrics] = useState({ totalSeats: 0, reservedSeats: 0, canceledCount: 0 });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<Concert | null>(null);
  const [form, setForm] = useState({ name: '', description: '', totalSeats: '' });

  const refresh = async () => {
    try {
      setError('');
      const [nextConcerts, nextHistory, nextMetrics] = await Promise.all([
        getConcerts(),
        getHistory(),
        getMetrics()
      ]);
      setConcerts(nextConcerts);
      setHistory(nextHistory);
      setMetrics(nextMetrics);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    }
  };

  useEffect(() => {
    void refresh();
  }, []);

  useEffect(() => {
    if (!success) {
      return;
    }
    const timer = setTimeout(() => setSuccess(''), 3000);
    return () => clearTimeout(timer);
  }, [success]);

  const stats = useMemo(
    () => [
      { label: 'Total of seats', value: metrics.totalSeats, color: 'blue', icon: 'total' as const },
      {
        label: 'Reserve',
        value: metrics.reservedSeats,
        color: 'green',
        icon: 'reserve' as const
      },
      { label: 'Cancel', value: metrics.canceledCount, color: 'red', icon: 'cancel' as const }
    ],
    [metrics]
  );

  const submitCreate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSuccess('');
    setError('');

    try {
      await createConcert({
        name: form.name,
        description: form.description,
        totalSeats: Number(form.totalSeats)
      });
      setForm({ name: '', description: '', totalSeats: '' });
      setSuccess('Concert created successfully');
      onTabChange('overview');
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create concert');
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) {
      return;
    }

    try {
      await deleteConcert(deleteTarget.id);
      setDeleteTarget(null);
      setSuccess('Concert deleted successfully');
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete concert');
    }
  };

  return (
    <>
      {error ? <p className="alert error">{error}</p> : null}
      {success ? <p className="alert success">{success}</p> : null}

      <section className="stats-grid">
        {stats.map((stat) => (
          <article className={`stat-card ${stat.color}`} key={stat.label}>
            <span className="stat-icon">
              <AdminIcon name={stat.icon} />
            </span>
            <span>{stat.label}</span>
            <strong>{stat.value}</strong>
          </article>
        ))}
      </section>

      {tab !== 'history' ? (
        <div className="tabs">
          <button type="button" onClick={() => onTabChange('overview')} className={tab === 'overview' ? 'active' : ''}>
            Overview
          </button>
          <button type="button" onClick={() => onTabChange('create')} className={tab === 'create' ? 'active' : ''}>
            Create
          </button>
        </div>
      ) : null}

      {tab === 'overview' ? (
        <section className="list-stack">
          {concerts.map((concert) => (
            <article key={concert.id} className="concert-card">
              <h3>{concert.name}</h3>
              <p>{concert.description}</p>
              <div className="card-footer">
                <span className="seat-count">
                  <span className="seat-icon" aria-hidden>
                    <AdminIcon name="reserve" />
                  </span>
                  {concert.availableSeats.toLocaleString()}
                </span>
                <button type="button" className="danger" onClick={() => setDeleteTarget(concert)}>
                  Delete
                </button>
              </div>
            </article>
          ))}
          {concerts.length === 0 ? <p className="empty">No concerts yet.</p> : null}
        </section>
      ) : null}

      {tab === 'create' ? (
        <form className="panel-form" onSubmit={submitCreate}>
          <h3 className="form-title">Create</h3>
          <div className="form-divider" />
          <div className="form-row">
            <label>
              Concert Name
              <input
                required
                placeholder="Please input concert name"
                value={form.name}
                onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
              />
            </label>
            <label className="total-seat-field">
              Total of seat
              <span className="input-with-icon">
                <input
                  className="total-seat-input"
                  required
                  type="number"
                  min={1}
                  placeholder="500"
                  value={form.totalSeats}
                  onChange={(event) => setForm((prev) => ({ ...prev, totalSeats: event.target.value }))}
                />
                <span className="input-icon" aria-hidden>
                  <AdminIcon name="user" />
                </span>
              </span>
            </label>
          </div>
          <label>
            Description
            <textarea
              required
              placeholder="Please input description"
              value={form.description}
              onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
            />
          </label>
          <div className="form-actions">
            <button type="button" className="modal-cancel" onClick={() => onTabChange('overview')}>
              Cancel
            </button>
            <button type="submit" className="primary">
              <span className="icon-inline">
                <AdminIcon name="save" />
              </span>
              Save
            </button>
          </div>
        </form>
      ) : null}

      {tab === 'history' ? (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Date Time</th>
                <th>Username</th>
                <th>Concert Name</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {history.map((item) => (
                <tr key={item.id}>
                  <td>
                    {(() => {
                      const d = new Date(item.timestamp);
                      const dd = String(d.getDate()).padStart(2, '0');
                      const mm = String(d.getMonth() + 1).padStart(2, '0');
                      const yyyy = d.getFullYear();
                      const h = String(d.getHours()).padStart(2, '0');
                      const min = String(d.getMinutes()).padStart(2, '0');
                      const sec = String(d.getSeconds()).padStart(2, '0');
                      return `${dd}/${mm}/${yyyy} ${h}:${min}:${sec}`;
                    })()}
                  </td>
                  <td>{item.userId}</td>
                  <td>{item.concertName}</td>
                  <td>{item.action === 'reserve' ? 'Booked' : item.action === 'cancel' ? 'Canceled' : item.action}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      {deleteTarget ? (
        <div className="modal-backdrop">
          <div className="modal">
            <div className="modal-icon danger" aria-hidden>
              <AdminIcon name="cancel" />
            </div>
            <h4>Are you sure you want to delete &apos;{deleteTarget.name}&apos;?</h4>
            <div className="modal-actions">
              <button type="button" className="modal-cancel" onClick={() => setDeleteTarget(null)}>
                Cancel
              </button>
              <button type="button" className="danger" onClick={confirmDelete}>
                Confirm
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
