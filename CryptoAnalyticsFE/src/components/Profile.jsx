import { useEffect, useState } from "react";
import { getMe, changePassword } from "../api/cryptoApi";
import "./Profile.css";

export default function Profile({ onLogout }) {
  const [me, setMe] = useState(null);
  const [err, setErr] = useState(null);
  const [oldPwd, setOldPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [submitErr, setSubmitErr] = useState(null);
  const [submitOk, setSubmitOk] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getMe()
      .then(d => { if (!cancelled) setMe(d); })
      .catch(e => { if (!cancelled) setErr(e.message); });
    return () => { cancelled = true; };
  }, []);

  function validate() {
    if (!oldPwd || !newPwd || !confirmPwd) return "All fields are required.";
    if (newPwd.length < 4) return "New password must be at least 4 characters.";
    if (!/[a-z]/.test(newPwd) || !/[A-Z]/.test(newPwd) || !/\d/.test(newPwd))
      return "New password must contain upper, lower, and a digit.";
    if (newPwd !== confirmPwd) return "New password and confirmation don't match.";
    if (newPwd === oldPwd) return "New password must differ from the current one.";
    return null;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitErr(null); setSubmitOk(false);
    const v = validate();
    if (v) { setSubmitErr(v); return; }
    setSubmitting(true);
    try {
      await changePassword(oldPwd, newPwd);
      setSubmitOk(true);
      setOldPwd(""); setNewPwd(""); setConfirmPwd("");
    } catch (ex) {
      setSubmitErr(ex.message || "Failed to change password.");
    } finally {
      setSubmitting(false);
    }
  }

  if (err) {
    return <div className="pf-page"><div className="pf-error">Failed to load profile: {err}</div></div>;
  }
  if (!me) {
    return <div className="pf-page"><div className="pf-loading">Loading…</div></div>;
  }

  const initials = ((me.nome?.[0] ?? "") + (me.cognome?.[0] ?? "")).toUpperCase() || "?";

  return (
    <div className="pf-page">
      <div className="pf-header">
        <div>
          <h1>Pro<span>file</span></h1>
          <p>Your account</p>
        </div>
      </div>

      <div className="pf-card">
        <div className="pf-avatar">{initials}</div>
        <div className="pf-info">
          <div className="pf-name">{me.nome} {me.cognome}</div>
          <div className="pf-username">@{me.username}</div>
          <div className="pf-meta">
            <span className="pf-meta-item"><span className="pf-meta-label">Email</span> {me.email}</span>
            <span className="pf-meta-item"><span className="pf-meta-label">Role</span> {me.role}</span>
          </div>
        </div>
      </div>

      <div className="pf-section">
        <h3>Change password</h3>
        <form className="pf-form" onSubmit={handleSubmit}>
          <label>
            <span className="pf-label">Current password</span>
            <input
              type="password"
              value={oldPwd}
              onChange={e => setOldPwd(e.target.value)}
              autoComplete="current-password"
            />
          </label>
          <label>
            <span className="pf-label">New password</span>
            <input
              type="password"
              value={newPwd}
              onChange={e => setNewPwd(e.target.value)}
              autoComplete="new-password"
            />
          </label>
          <label>
            <span className="pf-label">Confirm new password</span>
            <input
              type="password"
              value={confirmPwd}
              onChange={e => setConfirmPwd(e.target.value)}
              autoComplete="new-password"
            />
          </label>

          {submitErr && <div className="pf-msg pf-msg-err">{submitErr}</div>}
          {submitOk &&  <div className="pf-msg pf-msg-ok">Password updated.</div>}

          <button className="pf-submit" type="submit" disabled={submitting}>
            {submitting ? "Saving…" : "Update password"}
          </button>
        </form>
      </div>

      <div className="pf-section">
        <button className="pf-logout" onClick={onLogout}>Sign out</button>
      </div>
    </div>
  );
}
