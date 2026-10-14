import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Cloud, User, Mail, Lock, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';
import { register } from '../services/auth';

export default function Register() {
  const navigate = useNavigate();
  const [name, setName]             = useState('');
  const [email, setEmail]           = useState('');
  const [password, setPassword]     = useState('');
  const [confirm, setConfirm]       = useState('');
  const [showPwd, setShowPwd]       = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError]           = useState('');
  const [loading, setLoading]       = useState(false);
  const [success, setSuccess]       = useState(false);

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
      await new Promise(r => setTimeout(r, 700));
      register(name.trim(), email.trim(), password);
      setSuccess(true);
      setTimeout(() => navigate('/dashboard', { replace: true }), 1000);
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        {/* Brand */}
        <div className="auth-card__brand">
          <div className="auth-card__brand-icon">
            <Cloud size={22} />
          </div>
          <span className="auth-card__brand-name">CloudVault</span>
        </div>

        <h1 className="auth-card__title">Create your account</h1>
        <p className="auth-card__subtitle">Start storing files securely in the cloud</p>

        <form className="auth-card__form" onSubmit={handleSubmit} noValidate>
          {/* Alerts */}
          {error && (
            <div className="alert alert--error">
              <AlertCircle size={15} />
              {error}
            </div>
          )}
          {success && (
            <div className="alert alert--success">
              <CheckCircle size={15} />
              Account created! Redirecting…
            </div>
          )}

          {/* Full name */}
          <div className="form-group">
            <label className="form-label" htmlFor="reg-name">Full name</label>
            <div style={{ position: 'relative' }}>
              <span style={{
                position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
                color: 'var(--text-muted)', display: 'flex', pointerEvents: 'none',
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
                autoFocus
              />
            </div>
          </div>

          {/* Email */}
          <div className="form-group">
            <label className="form-label" htmlFor="reg-email">Email address</label>
            <div style={{ position: 'relative' }}>
              <span style={{
                position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
                color: 'var(--text-muted)', display: 'flex', pointerEvents: 'none',
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
              />
            </div>
          </div>

          {/* Password */}
          <div className="form-group">
            <label className="form-label" htmlFor="reg-password">Password</label>
            <div style={{ position: 'relative' }}>
              <span style={{
                position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
                color: 'var(--text-muted)', display: 'flex', pointerEvents: 'none',
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
              />
              <button
                type="button"
                style={{
                  position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', color: 'var(--text-muted)',
                  cursor: 'pointer', display: 'flex', padding: 0,
                }}
                onClick={() => setShowPwd(s => !s)}
                tabIndex={-1}
              >
                {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {/* Confirm password */}
          <div className="form-group">
            <label className="form-label" htmlFor="reg-confirm">Confirm password</label>
            <div style={{ position: 'relative' }}>
              <span style={{
                position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
                color: 'var(--text-muted)', display: 'flex', pointerEvents: 'none',
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
              />
              <button
                type="button"
                style={{
                  position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', color: 'var(--text-muted)',
                  cursor: 'pointer', display: 'flex', padding: 0,
                }}
                onClick={() => setShowConfirm(s => !s)}
                tabIndex={-1}
              >
                {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn--primary btn--lg"
            style={{ width: '100%', justifyContent: 'center', marginTop: 4 }}
            disabled={loading || success}
          >
            {loading
              ? <><span className="spinner" /> Creating account…</>
              : success
              ? 'Account created!'
              : 'Create account'
            }
          </button>
        </form>

        <div className="auth-card__divider" />

        <p className="auth-card__footer">
          Already have an account?{' '}
          <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
