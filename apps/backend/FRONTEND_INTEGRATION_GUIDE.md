# Frontend Integration Guide

## Overview

This guide shows how to integrate your Next.js dashboard with the Microphina backend API.

---

## 1. Setup - Environment & HTTP Client

### Environment Variables (.env.local)

```env
NEXT_PUBLIC_API_URL=http://localhost:3030
NEXT_PUBLIC_API_TIMEOUT=30000
```

### HTTP Client (lib/api.ts)

```typescript
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3030';

export const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token refresh on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          const { data } = await axios.post(`${API_URL}/auth/refresh`, {
            refreshToken,
          });
          localStorage.setItem('accessToken', data.data.accessToken);
          localStorage.setItem('refreshToken', data.data.refreshToken);
          // Retry original request
          return api(error.config);
        } catch {
          // Refresh failed, redirect to login
          window.location.href = '/login';
        }
      } else {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
```

---

## 2. Authentication Pages

### Login Page (/app/login/page.tsx)

```typescript
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data } = await api.post('/auth/login', { email, password });
      
      // Store tokens
      localStorage.setItem('accessToken', data.data.accessToken);
      localStorage.setItem('refreshToken', data.data.refreshToken);
      localStorage.setItem('user', JSON.stringify(data.data.user));

      // Redirect to dashboard
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      {error && <p className="error">{error}</p>}
      <button type="submit" disabled={loading}>
        {loading ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
}
```

### Register Page (/app/register/page.tsx)

```typescript
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    nom: '',
    role: 'ADMIN',
    telephone: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data } = await api.post('/auth/register', formData);
      
      localStorage.setItem('accessToken', data.data.accessToken);
      localStorage.setItem('refreshToken', data.data.refreshToken);
      localStorage.setItem('user', JSON.stringify(data.data.user));

      router.push('/dashboard');
    } catch (err: any) {
      const errors = err.response?.data?.details;
      if (errors) {
        setError(errors.map((e: any) => `${e.field}: ${e.message}`).join(', '));
      } else {
        setError(err.response?.data?.error || 'Registration failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleRegister}>
      {/* Form fields */}
      <button type="submit" disabled={loading}>
        Register
      </button>
    </form>
  );
}
```

---

## 3. Dashboard Layout

### Main Dashboard (/app/dashboard/page.tsx)

```typescript
'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';

interface DashboardStats {
  totalClients: number;
  totalBalance: number;
  pendingApprovals: number;
  activeCollectors: number;
  monthlyRevenue: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [alerts, setAlerts] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const { data } = await api.get('/reports/dashboard');
        setStats(data.data.stats);
        setAlerts(data.data.alerts);
      } catch (error) {
        console.error('Failed to load dashboard', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="dashboard">
      <h1>Dashboard</h1>
      
      {/* Stats Cards */}
      <div className="stats-grid">
        <StatCard title="Total Clients" value={stats?.totalClients} />
        <StatCard title="Total Balance" value={stats?.totalBalance} />
        <StatCard title="Pending Approvals" value={stats?.pendingApprovals} />
        <StatCard title="Active Collectors" value={stats?.activeCollectors} />
        <StatCard title="Monthly Revenue" value={stats?.monthlyRevenue} />
      </div>

      {/* Alerts */}
      {alerts?.hasIssues && (
        <div className="alerts">
          <p>⚠️ {alerts.rejectedMovements} transactions rejected</p>
        </div>
      )}
    </div>
  );
}
```

---

## 4. User Management

### Users List Page (/app/users/page.tsx)

```typescript
'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';

interface User {
  id: number;
  email: string;
  nom: string;
  role: string;
  isActive: boolean;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [skip, setSkip] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data } = await api.get(`/users?skip=${skip}&take=20`);
        setUsers(data.data);
        setTotal(data.total);
      } catch (error) {
        console.error('Failed to load users', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [skip]);

  const handleCreateUser = async (formData: any) => {
    try {
      await api.post('/users', formData);
      // Reload users list
      setSkip(0);
    } catch (error: any) {
      const errors = error.response?.data?.details;
      alert(errors ? errors.map((e: any) => e.message).join('\n') : 'Failed to create user');
    }
  };

  return (
    <div>
      <h1>Users Management</h1>
      <button onClick={() => {/* Show create modal */}}>Create User</button>
      
      <table>
        <thead>
          <tr>
            <th>Email</th>
            <th>Name</th>
            <th>Role</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.email}</td>
              <td>{user.nom}</td>
              <td>{user.role}</td>
              <td>{user.isActive ? 'Active' : 'Inactive'}</td>
              <td>
                <button>Edit</button>
                <button>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
      <div className="pagination">
        <button onClick={() => setSkip(Math.max(0, skip - 20))}>Previous</button>
        <span>{skip / 20 + 1} / {Math.ceil(total / 20)}</span>
        <button onClick={() => setSkip(skip + 20)}>Next</button>
      </div>
    </div>
  );
}
```

---

## 5. Workflows & Approvals

### Pending Approvals Page (/app/approvals/page.tsx)

```typescript
'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';

interface Movement {
  id: number;
  reference: string;
  type: string;
  montant: number;
  clientName: string;
  createdBy: string;
  observations?: string;
}

export default function ApprovalsPage() {
  const [movements, setMovements] = useState<Movement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPending();
  }, []);

  const fetchPending = async () => {
    try {
      const { data } = await api.get('/workflows/pending');
      setMovements(data.data.movements);
    } catch (error) {
      console.error('Failed to load pending approvals', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (movementId: number) => {
    try {
      await api.post(`/workflows/mouvement-epargne/${movementId}/approve`);
      alert('Movement approved');
      fetchPending();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to approve');
    }
  };

  const handleReject = async (movementId: number, reason: string) => {
    try {
      await api.post(`/workflows/mouvement-epargne/${movementId}/reject`, { reason });
      alert('Movement rejected');
      fetchPending();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to reject');
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h1>Pending Approvals ({movements.length})</h1>
      
      <table>
        <thead>
          <tr>
            <th>Reference</th>
            <th>Type</th>
            <th>Amount</th>
            <th>Client</th>
            <th>Created By</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {movements.map((m) => (
            <tr key={m.id}>
              <td>{m.reference}</td>
              <td>{m.type}</td>
              <td>{m.montant}</td>
              <td>{m.clientName}</td>
              <td>{m.createdBy}</td>
              <td>
                <button onClick={() => handleApprove(m.id)}>Approve</button>
                <button onClick={() => handleReject(m.id, 'Invalid')}>Reject</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

---

## 6. Bulk Operations

### Import Clients Page (/app/import/clients/page.tsx)

```typescript
'use client';
import { useState } from 'react';
import api from '@/lib/api';

export default function ImportClientsPage() {
  const [agenceId, setAgenceId] = useState('');
  const [clients, setClients] = useState<any[]>([]);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        setClients(json);
      } catch {
        alert('Invalid JSON file');
      }
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    if (!agenceId || clients.length === 0) {
      alert('Select agency and upload clients file');
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post('/bulk/import-clients', {
        agenceId: parseInt(agenceId),
        clients,
      });
      setResult(data.data);
    } catch (error: any) {
      alert(error.response?.data?.error || 'Import failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Import Clients</h1>
      
      <div>
        <label>Agency:</label>
        <select value={agenceId} onChange={(e) => setAgenceId(e.target.value)}>
          <option value="">Select Agency</option>
          {/* Fetch agencies from API */}
        </select>
      </div>

      <div>
        <label>Upload JSON file:</label>
        <input type="file" accept=".json" onChange={handleFileUpload} />
        <p>{clients.length} clients loaded</p>
      </div>

      <button onClick={handleImport} disabled={loading}>
        {loading ? 'Importing...' : 'Import'}
      </button>

      {result && (
        <div>
          <h2>Import Results</h2>
          <p>✅ Success: {result.success}</p>
          <p>❌ Failed: {result.failed}</p>
          {result.errors.length > 0 && (
            <div>
              <h3>Errors:</h3>
              <ul>
                {result.errors.map((err: any, i: number) => (
                  <li key={i}>{err.row}: {err.error}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
```

---

## 7. Analytics

### Agency Report Page (/app/reports/agency/[id]/page.tsx)

```typescript
'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import api from '@/lib/api';

interface AgencyReport {
  agency: any;
  stats: any;
  collectorPerformance: any[];
}

export default function AgencyReportPage() {
  const { id } = useParams();
  const [report, setReport] = useState<AgencyReport | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const { data } = await api.get(`/reports/agency/${id}`);
        setReport(data.data);
      } catch (error) {
        console.error('Failed to load report', error);
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [id]);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h1>{report?.agency.nom} - Agency Report</h1>
      
      <div className="stats">
        <div>Clients: {report?.stats.clientCount}</div>
        <div>Total Balance: {report?.stats.totalBalance}</div>
        <div>Monthly Revenue: {report?.stats.totalRevenue}</div>
        <div>Active Collectors: {report?.stats.activeCollectors}</div>
      </div>

      <h2>Top Collectors</h2>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Clients</th>
          </tr>
        </thead>
        <tbody>
          {report?.collectorPerformance.map((c) => (
            <tr key={c.id}>
              <td>{c.nom}</td>
              <td>{c.clientCount}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

---

## 8. State Management

### Redux/Context Store Example (lib/store.ts)

```typescript
import { create } from 'zustand';

interface User {
  id: number;
  email: string;
  role: string;
}

interface AuthStore {
  user: User | null;
  setUser: (user: User) => void;
  logout: () => void;
}

export const useAuth = create<AuthStore>((set) => ({
  user: typeof window !== 'undefined' ? 
    JSON.parse(localStorage.getItem('user') || 'null') : null,
  setUser: (user) => {
    set({ user });
    localStorage.setItem('user', JSON.stringify(user));
  },
  logout: () => {
    set({ user: null });
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  },
}));
```

---

## 9. Protected Routes

### Route Guard Hook (lib/withAuth.tsx)

```typescript
'use client';
import { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/store';

export function WithAuth({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push('/login');
    } else {
      setLoading(false);
    }
  }, [user, router]);

  if (loading) return <div>Loading...</div>;
  return <>{children}</>;
}
```

---

## 10. Integration Checklist

### Phase 1: Authentication
- [ ] Create login page (`/app/login`)
- [ ] Create register page (`/app/register`)
- [ ] Implement token storage in localStorage
- [ ] Implement token refresh logic
- [ ] Add auth interceptor to API client
- [ ] Create logout functionality

### Phase 2: Dashboard
- [ ] Create dashboard page (`/app/dashboard`)
- [ ] Display stats from `/reports/dashboard`
- [ ] Show pending approvals count
- [ ] Display alerts

### Phase 3: User Management
- [ ] Create users list page
- [ ] Implement create user form
- [ ] Implement update user form
- [ ] Implement delete user button
- [ ] Add pagination

### Phase 4: Workflows
- [ ] Create pending approvals page
- [ ] Implement approve button
- [ ] Implement reject button with reason
- [ ] Show movement details modal

### Phase 5: Bulk Operations
- [ ] Create import clients page
- [ ] Create import cotisations page
- [ ] Implement file upload
- [ ] Display import results

### Phase 6: Analytics
- [ ] Create agency report page
- [ ] Create collector report page
- [ ] Create revenue chart page
- [ ] Add date range filters

### Phase 7: Navigation
- [ ] Create main navigation menu
- [ ] Add role-based menu items
- [ ] Implement breadcrumbs
- [ ] Add user profile menu

---

## Error Handling Strategy

```typescript
const handleApiError = (error: any) => {
  const status = error.response?.status;
  const data = error.response?.data;

  switch (status) {
    case 400:
      return `Bad request: ${data.error}`;
    case 401:
      return 'Your session expired. Please login again.';
    case 403:
      return 'You do not have permission for this action.';
    case 404:
      return 'The resource was not found.';
    case 422:
      return data.details?.map((d: any) => `${d.field}: ${d.message}`).join('\n');
    case 500:
      return 'Server error. Please try again later.';
    default:
      return 'An unexpected error occurred.';
  }
};
```

---

## Testing the Integration

1. **Start Backend**: `bun run --hot src/index.ts`
2. **Start Frontend**: `npm run dev`
3. **Register Admin**: `/register` → Create first admin user
4. **Login**: `/login` → Get tokens
5. **Dashboard**: `/dashboard` → View stats
6. **Users**: `/users` → Manage users
7. **Approvals**: `/approvals` → Test workflows
8. **Import**: `/import/clients` → Test bulk operations
9. **Reports**: `/reports/agency/1` → View analytics
