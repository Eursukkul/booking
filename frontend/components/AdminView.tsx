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
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none" aria-hidden="true">
        <path
          d="M33.3337 35V31.6667C33.3337 29.8986 32.6313 28.2029 31.381 26.9526C30.1308 25.7024 28.4351 25 26.667 25H13.3337C11.5655 25 9.86986 25.7024 8.61961 26.9526C7.36937 28.2029 6.66699 29.8986 6.66699 31.6667V35"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M19.9997 18.3333C23.6816 18.3333 26.6663 15.3486 26.6663 11.6667C26.6663 7.98477 23.6816 5 19.9997 5C16.3178 5 13.333 7.98477 13.333 11.6667C13.333 15.3486 16.3178 18.3333 19.9997 18.3333Z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
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
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none" aria-hidden="true">
        <path
          d="M19.9997 24.9993C26.443 24.9993 31.6663 19.776 31.6663 13.3327C31.6663 6.88936 26.443 1.66602 19.9997 1.66602C13.5564 1.66602 8.33301 6.88936 8.33301 13.3327C8.33301 19.776 13.5564 24.9993 19.9997 24.9993Z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M13.6837 23.1495L11.667 38.3328L20.0003 33.3328L28.3337 38.3328L26.317 23.1328"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  if (name === 'cancel') {
    return (
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none" aria-hidden="true">
        <path
          d="M19.9997 36.6673C29.2044 36.6673 36.6663 29.2054 36.6663 20.0007C36.6663 10.7959 29.2044 3.33398 19.9997 3.33398C10.7949 3.33398 3.33301 10.7959 3.33301 20.0007C3.33301 29.2054 10.7949 36.6673 19.9997 36.6673Z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M25 15L15 25"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M15 15L25 25"
          stroke="currentColor"
          strokeWidth="2"
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

  const stats = useMemo(
    () => [
      { label: 'Total of seats', value: metrics.totalSeats, color: 'blue', icon: 'total' as const },
      {
        label: 'Available',
        value: metrics.totalSeats - metrics.reservedSeats,
        color: 'green',
        icon: 'reserve' as const
      },
      { label: 'Cancelled', value: metrics.canceledCount, color: 'red', icon: 'cancel' as const }
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
              <input
                className="total-seat-input"
                required
                type="number"
                min={1}
                placeholder="500"
                value={form.totalSeats}
                onChange={(event) => setForm((prev) => ({ ...prev, totalSeats: event.target.value }))}
              />
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
