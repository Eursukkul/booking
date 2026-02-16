'use client';

import { useEffect, useState } from 'react';
import type { Concert } from '../app.d';
import { cancelSeat, getConcerts, reserveSeat } from '../lib/api';

const DEMO_USER_ID = 'user-jane';

function SeatIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 40 40" fill="none" aria-hidden="true">
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

export function UserView() {
  const [concerts, setConcerts] = useState<Concert[]>([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const refresh = async () => {
    try {
      setError('');
      const nextConcerts = await getConcerts();
      setConcerts(nextConcerts);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to fetch user data');
    }
  };

  useEffect(() => {
    void refresh();
  }, []);

  const handleReserve = async (concertId: string) => {
    setError('');
    setSuccess('');
    try {
      await reserveSeat(concertId, DEMO_USER_ID);
      setSuccess('Seat reserved successfully');
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reserve seat');
    }
  };

  const handleCancel = async (concertId: string) => {
    setError('');
    setSuccess('');
    try {
      await cancelSeat(concertId, DEMO_USER_ID);
      setSuccess('Reservation canceled successfully');
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cancel reservation');
    }
  };

  return (
    <>
      {error ? <p className="alert error">{error}</p> : null}
      {success ? <p className="alert success">{success}</p> : null}

      <section className="list-stack">
        {[...concerts]
          .sort((a, b) => (a.createdAt > b.createdAt ? 1 : -1))
          .map((concert) => {
          const hasReserved = concert.reservedByUserIds.includes(DEMO_USER_ID);

          return (
            <article key={concert.id} className="concert-card">
              <h3>{concert.name}</h3>
              <p>{concert.description}</p>
              <div className="card-footer">
                <span className="seat-count">
                  <span className="seat-icon" aria-hidden>
                    <SeatIcon />
                  </span>
                  {concert.availableSeats.toLocaleString()}
                </span>
                {hasReserved ? (
                  <button type="button" className="danger" onClick={() => handleCancel(concert.id)}>
                    Cancel
                  </button>
                ) : (
                  <button
                    type="button"
                    className="primary"
                    onClick={() => handleReserve(concert.id)}
                    disabled={concert.soldOut}
                  >
                    {concert.soldOut ? 'Sold out' : 'Reserve'}
                  </button>
                )}
              </div>
            </article>
          );
        })}
      </section>
    </>
  );
}
