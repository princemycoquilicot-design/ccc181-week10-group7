// Part 2 (Member 3): shown ONLY after the API answers 200 (or getMe succeeds).
// Styled in src/styles/auth.css.
import type { User } from '../api/auth';

interface WelcomeProps {
  user: User;
  onLogout: () => void;
}

export default function Welcome({ user, onLogout }: WelcomeProps) {
  return (
    <section className="welcome" aria-labelledby="welcome-heading">
      <h2 id="welcome-heading" className="welcome__title">
        Welcome, {user.name}
      </h2>
      <p className="welcome__email">{user.email}</p>
      <button
        type="button"
        className="btn btn--secondary welcome__logout"
        onClick={onLogout}
      >
        Log out
      </button>
    </section>
  );
}
