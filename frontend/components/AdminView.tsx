'use client';

import { useEffect, useMemo, useState } from 'react';
import type { Concert, HistoryItem } from '../app.d';
import { createConcert, deleteConcert, getConcerts, getHistory } from '../lib/api';

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
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<Concert | null>(null);
  const [selectedConcertIdForStats, setSelectedConcertIdForStats] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', description: '', totalSeats: '' });

  const sortedConcerts = useMemo(
    () => [...concerts].sort((a, b) => (a.createdAt > b.createdAt ? 1 : -1)),
    [concerts]
  );

  const refresh = async () => {
    try {
      setError('');
      const [nextConcerts, nextHistory] = await Promise.all([
        getConcerts(),
        getHistory()
      ]);
      setConcerts(nextConcerts);
      setHistory(nextHistory);
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

  useEffect(() => {
    const firstId = sortedConcerts[0]?.id ?? null;
    if (!selectedConcertIdForStats || !sortedConcerts.some((c) => c.id === selectedConcertIdForStats)) {
      setSelectedConcertIdForStats(firstId);
    }
  }, [sortedConcerts, selectedConcertIdForStats]);

  const selectedConcertForStats = useMemo(() => {
    const id = selectedConcertIdForStats ?? sortedConcerts[0]?.id;
    return id ? sortedConcerts.find((c) => c.id === id) ?? null : null;
  }, [sortedConcerts, selectedConcertIdForStats]);

  const selectedConcertStats = useMemo(() => {
    if (!selectedConcertForStats) {
      return { totalSeats: 0, reserve: 0, cancel: 0 };
    }
    const cancelCount = history.filter(
      (h) => h.concertId === selectedConcertForStats.id && h.action === 'cancel'
    ).length;
    return {
      totalSeats: selectedConcertForStats.totalSeats,
      reserve: selectedConcertForStats.reservedByUserIds.length,
      cancel: cancelCount
    };
  }, [selectedConcertForStats, history]);

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
      if (selectedConcertIdForStats === deleteTarget.id) {
        setSelectedConcertIdForStats(null);
      }
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

      <section className="stats-section">
        <div className="stats-grid">
          <article className="stat-card blue">
            <span className="stat-icon">
              <AdminIcon name="total" />
            </span>
            <span>Total of seats</span>
            <strong>{selectedConcertStats.totalSeats.toLocaleString()}</strong>
          </article>
          <article className="stat-card green">
            <span className="stat-icon">
              <AdminIcon name="reserve" />
            </span>
            <span>Reserve</span>
            <strong>{selectedConcertStats.reserve.toLocaleString()}</strong>
          </article>
          <article className="stat-card red">
            <span className="stat-icon">
              <AdminIcon name="cancel" />
            </span>
            <span>Cancel</span>
            <strong>{selectedConcertStats.cancel.toLocaleString()}</strong>
          </article>
        </div>
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
          {sortedConcerts.map((concert) => (
            <article
              key={concert.id}
              role="button"
              tabIndex={0}
              className={`concert-card ${selectedConcertForStats?.id === concert.id ? 'selected' : ''}`}
              onClick={() => setSelectedConcertIdForStats(concert.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setSelectedConcertIdForStats(concert.id);
                }
              }}
            >
              <h3>{concert.name}</h3>
              <p>{concert.description}</p>
              <div className="card-footer">
                <span className="seat-count">
                  <span className="seat-icon" aria-hidden>
                    <AdminIcon name="total" />
                  </span>
                  {concert.availableSeats.toLocaleString()} available
                </span>
                <button
                  type="button"
                  className="danger btn-with-icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeleteTarget(concert);
                  }}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <path d="M3 6H5H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M10 11V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M14 11V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
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
          <div className="modal delete-modal">
            <div className="delete-modal-icon" aria-hidden>
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                <circle cx="24" cy="24" r="24" fill="#ef5656" />
                <path
                  d="M30 18L18 30M18 18l12 12"
                  stroke="white"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <h4 className="delete-modal-title">Are you sure to delete?</h4>
            <p className="delete-modal-name">&quot;{deleteTarget.name}&quot;</p>
            <div className="modal-actions">
              <button type="button" className="modal-btn-cancel" onClick={() => setDeleteTarget(null)}>
                Cancel
              </button>
              <button type="button" className="modal-btn-delete" onClick={confirmDelete}>
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
