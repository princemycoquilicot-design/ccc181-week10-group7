// Part 2 (Member 3): App decides what to show: checking, login form, or Welcome.
import { useEffect, useState } from 'react';
import Navbar from './components/Navbar';
import BrandPanel from './components/BrandPanel';
import LoginForm from './components/LoginForm';
import Welcome from './components/Welcome';
import Footer from './components/Footer';
import { ApiError, clearToken, getMe, getToken } from './api/auth';
import type { User } from './api/auth';

type Session =
  | { status: 'checking' } // a token exists, waiting for GET /users/me
  | { status: 'out' } // show the login form
  | { status: 'in'; user: User }; // show the Welcome screen

export default function App() {
  const [session, setSession] = useState<Session>(() =>
    getToken() ? { status: 'checking' } : { status: 'out' },
  );

  // Stay logged in on refresh: ask the API who the token belongs to.
  useEffect(() => {
    const token = getToken();
    let cancelled = false;

    if (token) {
      getMe(token)
        .then((user) => {
          if (!cancelled) setSession({ status: 'in', user });
        })
        .catch((error: unknown) => {
          if (cancelled) return;
          // 401: the token is wrong or expired, so delete it.
          if (error instanceof ApiError && error.kind === 'rejected') {
            clearToken();
          }
          setSession({ status: 'out' });
        });
    }

    return () => {
      cancelled = true;
    };
  }, []);

  function handleLoggedIn(user: User) {
    setSession({ status: 'in', user });
  }

  // The API is stateless, so logging out only deletes the token.
  function handleLogout() {
    clearToken();
    setSession({ status: 'out' });
  }

  return (
    <div className="page">
      <Navbar />
      <main className="container">
        {session.status === 'checking' && (
          <p className="auth-checking" role="status">
            Checking your session...
          </p>
        )}
        {session.status === 'out' && (
          <div className="login-layout">
            <BrandPanel />
            <LoginForm onLoggedIn={handleLoggedIn} />
          </div>
        )}
        {session.status === 'in' && (
          <Welcome user={session.user} onLogout={handleLogout} />
        )}
      </main>
      <Footer />
    </div>
  );
}
