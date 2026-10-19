
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Cloud, User, Mail, Lock, Eye, EyeOff,
  AlertCircle, CheckCircle
} from 'lucide-react';
import { register, confirmRegistration } from '../services/auth';

export default function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [code, setCode] = useState('');

  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [needsConfirmation, setNeedsConfirmation] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!name.trim() || !email.trim() || !password || !confirm) {
      setError('All fields are required.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoading(true);

    try {
      const result = await register(
        name.trim(),
        email.trim(),
        password
      );

      if (result.isSignUpComplete) {
        setSuccess(true);
        setTimeout(() => navigate('/login', { replace: true }), 1200);
      } else if (
        result.nextStep?.signUpStep === 'CONFIRM_SIGN_UP'
      ) {
        setNeedsConfirmation(true);
      } else {
        setError(
          `Additional registration step required: ${
            result.nextStep?.signUpStep || 'unknown'
          }`
        );
      }
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleConfirmation(e) {
    e.preventDefault();
    setError('');

    if (!code.trim()) {
      setError('Enter the verification code sent to your email.');
      return;
    }

    setLoading(true);

    try {
      await confirmRegistration(email.trim(), code);
      setSuccess(true);
      setTimeout(() => navigate('/login', { replace: true }), 1200);
    } catch (err) {
      setError(
        err.message || 'Verification failed. Check the code and try again.'
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-card__brand">
          <div className="auth-card__brand-icon">
            <Cloud size={22} />
          </div>
          <span className="auth-card__brand-name">CloudVault</span>
        </div>

        <h1 className="auth-card__title">
          {needsConfirmation
            ? 'Verify your email'
            : 'Create your account'}
        </h1>

        <p className="auth-card__subtitle">
          {needsConfirmation
            ? `Enter the verification code sent to ${email}`
            : 'Start storing files securely in the cloud'}
        </p>

        {error && (
          <div className="alert alert--error">
            <AlertCircle size={15} />
            {error}
          </div>
        )}

        {success && (
          <div className="alert alert--success">
            <CheckCircle size={15} />
            {needsConfirmation
              ? 'Email verified! Redirecting to sign in…'
              : 'Account created! Redirecting to sign in…'}
          </div>
        )}

        {!needsConfirmation ? (
          <form
            className="auth-card__form"
            onSubmit={handleSubmit}
            noValidate
          >
            <div className="form-group">
              <label className="form-label" htmlFor="reg-name">
                Full name
              </label>
              <div style={{ position: 'relative' }}>
                <span style={{
                  position: 'absolute', left: 12, top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)', display: 'flex',
                  pointerEvents: 'none',
                }}>
                  <User size={15} />
                </span>
                <input
                  id="reg-name"
                  type="text"
                  className="form-input"
                  placeholder="Jane Doe"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  style={{ paddingLeft: 38 }}
                  autoComplete="name"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="reg-email">
                Email address
              </label>
              <div style={{ position: 'relative' }}>
                <span style={{
                  position: 'absolute', left: 12, top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)', display: 'flex',
                  pointerEvents: 'none',
                }}>
                  <Mail size={15} />
                </span>
                <input
                  id="reg-email"
                  type="email"
                  className="form-input"
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  style={{ paddingLeft: 38 }}
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="reg-password">
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <span style={{
                  position: 'absolute', left: 12, top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)', display: 'flex',
                  pointerEvents: 'none',
                }}>
                  <Lock size={15} />
                </span>
                <input
                  id="reg-password"
                  type={showPwd ? 'text' : 'password'}
                  className="form-input"
                  placeholder="Min. 8 characters"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  style={{ paddingLeft: 38, paddingRight: 40 }}
                  autoComplete="new-password"
                  required
                />
                <button
                  type="button"
                  style={{
                    position: 'absolute', right: 12, top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none', border: 'none',
                    color: 'var(--text-muted)', cursor: 'pointer',
                    display: 'flex', padding: 0,
                  }}
                  onClick={() => setShowPwd(s => !s)}
                  aria-label="Toggle password visibility"
                >
                  {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="reg-confirm">
                Confirm password
              </label>
              <div style={{ position: 'relative' }}>
                <span style={{
                  position: 'absolute', left: 12, top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)', display: 'flex',
                  pointerEvents: 'none',
                }}>
                  <Lock size={15} />
                </span>
                <input
                  id="reg-confirm"
                  type={showConfirm ? 'text' : 'password'}
                  className="form-input"
                  placeholder="Repeat your password"
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  style={{ paddingLeft: 38, paddingRight: 40 }}
                  autoComplete="new-password"
                  required
                />
                <button
                  type="button"
                  style={{
                    position: 'absolute', right: 12, top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none', border: 'none',
                    color: 'var(--text-muted)', cursor: 'pointer',
                    display: 'flex', padding: 0,
                  }}
                  onClick={() => setShowConfirm(s => !s)}
                  aria-label="Toggle confirmation password visibility"
                >
                  {showConfirm
                    ? <EyeOff size={15} />
                    : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn--primary btn--lg"
              style={{
                width: '100%', justifyContent: 'center', marginTop: 4
              }}
              disabled={loading || success}
            >
              {loading
                ? <><span className="spinner" /> Creating account…</>
                : 'Create account'}
            </button>
          </form>
        ) : (
          <form
            className="auth-card__form"
            onSubmit={handleConfirmation}
            noValidate
          >
            <div className="form-group">
              <label className="form-label" htmlFor="verification-code">
                Email verification code
              </label>
              <input
                id="verification-code"
                type="text"
                className="form-input"
                placeholder="Enter verification code"
                value={code}
                onChange={e => setCode(e.target.value)}
                autoComplete="one-time-code"
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn--primary btn--lg"
              style={{
                width: '100%', justifyContent: 'center', marginTop: 4
              }}
              disabled={loading || success}
            >
              {loading
                ? <><span className="spinner" /> Verifying…</>
                : 'Verify email'}
            </button>
          </form>
        )}

        <div className="auth-card__divider" />

        <p className="auth-card__footer">
          Already have an account?{' '}
          <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
