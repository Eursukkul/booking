'use client';

import { useEffect, useState } from 'react';
import type { Concert, HistoryItem } from '../app.d';
import { cancelSeat, getConcerts, getHistory, reserveSeat } from '../lib/api';

const DEMO_USER_ID = 'user-jane';

export function UserView() {
  const [concerts, setConcerts] = useState<Concert[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const refresh = async () => {
    try {
      setError('');
      const [nextConcerts, nextHistory] = await Promise.all([getConcerts(), getHistory(DEMO_USER_ID)]);
      setConcerts(nextConcerts);
      setHistory(nextHistory);
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

      <div className="list-actions">
        <button type="button" className="ghost-btn inline" onClick={() => setShowHistory((prev) => !prev)}>
          {showHistory ? 'Hide My History' : 'Show My History'}
        </button>
      </div>

      <section className="list-stack">
        {concerts.map((concert) => {
          const hasReserved = concert.reservedByUserIds.includes(DEMO_USER_ID);

          return (
            <article key={concert.id} className="concert-card">
              <h3>{concert.name}</h3>
              <p>{concert.description}</p>
              <div className="card-footer">
                <span>
                  {concert.availableSeats.toLocaleString()} / {concert.totalSeats.toLocaleString()} seats
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

      {showHistory ? (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Date time</th>
                <th>Concert name</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {history.map((item) => (
                <tr key={item.id}>
                  <td>{new Date(item.timestamp).toLocaleString()}</td>
                  <td>{item.concertName}</td>
                  <td>{item.action}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </>
  );
}
