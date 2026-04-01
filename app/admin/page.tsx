'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth  } from '@/context';

interface PendingUser {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  createdAt: string;
}

export default function AdminPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      router.push('/login');
      return;
    }
    fetchPendingUsers();
  }, [user]);

  const fetchPendingUsers = async () => {
    try {
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      setPendingUsers(data.users || []);
    } catch {
      setMessage('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      const res = await fetch('/api/admin/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: id, action: 'approve' }),
      });
      if (res.ok) {
        setMessage('Publisher approved successfully!');
        fetchPendingUsers();
      }
    } catch {
      setMessage('Failed to approve user');
    }
  };

  const handleReject = async (id: string) => {
    try {
      const res = await fetch('/api/admin/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: id, action: 'reject' }),
      });
      if (res.ok) {
        setMessage('Publisher rejected.');
        fetchPendingUsers();
      }
    } catch {
      setMessage('Failed to reject user');
    }
  };

  if (loading) return <div style={{ padding: '2rem', color: 'white' }}>Loading...</div>;

  return (
    <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto', color: 'white' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
        Admin Panel
      </h1>
      <p style={{ color: '#9ca3af', marginBottom: '2rem' }}>
        Logged in as: {user?.email}
      </p>

      {message && (
        <div style={{ background: '#1e3a5f', padding: '1rem', borderRadius: '8px',
          marginBottom: '1rem', color: '#60a5fa' }}>
          {message}
        </div>
      )}

      <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>
        Pending Publisher Requests
      </h2>

      {pendingUsers.length === 0 ? (
        <p style={{ color: '#9ca3af' }}>No pending publisher requests.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #374151' }}>
              <th style={{ textAlign: 'left', padding: '0.75rem', color: '#9ca3af' }}>Name</th>
              <th style={{ textAlign: 'left', padding: '0.75rem', color: '#9ca3af' }}>Email</th>
              <th style={{ textAlign: 'left', padding: '0.75rem', color: '#9ca3af' }}>Status</th>
              <th style={{ textAlign: 'left', padding: '0.75rem', color: '#9ca3af' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {pendingUsers.map(u => (
              <tr key={u.id} style={{ borderBottom: '1px solid #1f2937' }}>
                <td style={{ padding: '0.75rem' }}>{u.name}</td>
                <td style={{ padding: '0.75rem', color: '#9ca3af' }}>{u.email}</td>
                <td style={{ padding: '0.75rem' }}>
                  <span style={{ background: '#92400e', color: '#fcd34d',
                    padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.75rem' }}>
                    {u.status}
                  </span>
                </td>
                <td style={{ padding: '0.75rem', display: 'flex', gap: '0.5rem' }}>
                  <button onClick={() => handleApprove(u.id)}
                    style={{ background: '#16a34a', color: 'white', border: 'none',
                      padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer' }}>
                    Approve
                  </button>
                  <button onClick={() => handleReject(u.id)}
                    style={{ background: '#dc2626', color: 'white', border: 'none',
                      padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer' }}>
                    Reject
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}