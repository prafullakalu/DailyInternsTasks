import React, { useEffect, useMemo, useState } from 'react';
import { UserService } from '../services/userService';

const Settings: React.FC = () => {
  const storedUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('user') || '{}');
    } catch {
      return {};
    }
  }, []);

  const [profile, setProfile] = useState({
    name: storedUser?.name || 'Your name',
    email: storedUser?.email || 'you@example.com',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await UserService.getProfile();
        setProfile({ name: res.data.name, email: res.data.email });
      } catch (err: any) {
        setError(err?.response?.data?.error || 'Unable to load profile');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleSave = async () => {
    setLoading(true);
    setMessage(null);
    setError(null);
    try {
      const res = await UserService.updateProfile(profile);
      setProfile({ name: res.data.name, email: res.data.email });
      localStorage.setItem('user', JSON.stringify(res.data));
      setMessage('Profile updated');
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Unable to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setProfile({
      name: storedUser?.name || 'Your name',
      email: storedUser?.email || 'you@example.com',
    });
    setMessage(null);
    setError(null);
  };

  const initials = useMemo(() => {
    if (!profile.name) return 'AA';
    return profile.name
      .split(' ')
      .map((chunk: string) => chunk[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  }, [profile.name]);

  return (
    <section className="profile-page">
      <div className="profile-card">
        <div className="profile-heading">
          <div>
            <h1>Profile</h1>
            <p>Ensure everyone recognizes you across your teams and projects.</p>
          </div>
          <span className="badge badge-soft">Pro</span>
        </div>

        <div className="profile-content">
          <div className="profile-photo">
            <div className="avatar-large">{initials}</div>
            <button type="button" className="ghost-pill">
              + Upload photo
            </button>
            <p>Supported formats: jpg, gif, png · Max file size: 500kb.</p>
          </div>

          <form className="profile-form">
            {loading && <p className="muted">Saving...</p>}
            {message && <p className="success-text">{message}</p>}
            {error && <p className="error-text">{error}</p>}
            <label>
              Contact · Full name
              <input
                value={profile.name}
                onChange={(event) => setProfile((prev) => ({ ...prev, name: event.target.value }))}
              />
            </label>
            <label>
              Email address
              <input
                type="email"
                value={profile.email}
                onChange={(event) => setProfile((prev) => ({ ...prev, email: event.target.value }))}
              />
            </label>
            <div className="profile-actions">
              <button type="button" className="ghost" onClick={handleCancel} disabled={loading}>
                Cancel
              </button>
              <button type="button" className="primary" onClick={handleSave} disabled={loading}>
                Save changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default Settings;
