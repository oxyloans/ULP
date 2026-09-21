import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { BASE_URL, getToken } from '../../api/client';

// ─── Icons ────────────────────────────────────────────────────────────────────
const LockIcon   = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>;
const SendIcon   = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>;
const ListIcon   = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>;
const InfoIcon   = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>;

const inputStyle = {
  background: 'var(--input-bg)',
  border: '1px solid var(--input-border)',
  color: 'var(--text-primary)',
  borderRadius: 10,
  padding: '9px 12px',
  fontSize: 13,
  width: '100%',
  outline: 'none',
  transition: 'border-color 0.15s',
};
const labelStyle = {
  color: 'var(--text-muted)',
  fontSize: 11,
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  marginBottom: 5,
  display: 'block',
};
const errStyle = { color: '#e95330', fontSize: 11, marginTop: 3 };

export default function AdminHoldAmount() {
  const navigate = useNavigate();
  const token = getToken();

  const [form, setForm] = useState({
    comments:   '',
    dealId:     '',
    holdAmount: '',
    userId:     '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const set = (key, val) => {
    setForm(f => ({ ...f, [key]: val }));
    setErrors(e => ({ ...e, [key]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!form.userId.trim())     e.userId     = 'User ID is required';
    if (!form.dealId.trim())     e.dealId     = 'Deal ID is required';
    if (!String(form.holdAmount).trim()) e.holdAmount = 'Hold Amount is required';
    else if (isNaN(Number(form.holdAmount)) || Number(form.holdAmount) <= 0)
      e.holdAmount = 'Enter a valid positive amount';
    if (!form.comments.trim())   e.comments   = 'Comments are required';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    try {
      await axios.post(
        `${BASE_URL}/oxybrick-service/holdAmount`,
        {
          comments:   form.comments.trim(),
          dealId:     form.dealId.trim(),
          holdAmount: Number(form.holdAmount),
          userId:     form.userId.trim(),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Hold amount submitted successfully!');
      navigate('/admin/hold-amount/list');
    } catch (err) {
      toast.error(err?.response?.data?.message ?? err?.response?.data?.error ?? 'Submission failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid gap-6 max-w-2xl mx-auto">

      {/* Page header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl flex items-center justify-center"
            style={{ background: 'rgba(245,131,17,0.12)', border: '1px solid rgba(245,131,17,0.25)', color: '#f58311', boxShadow: '0 0 18px rgba(245,131,17,0.15)' }}>
            <LockIcon />
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest font-semibold" style={{ color: '#f58311' }}>Hold Amount</p>
            <h1 className="text-xl font-extrabold tracking-tight" style={{ color: 'var(--text-primary)' }}>Create Hold Amount</h1>
          </div>
        </div>
        <button
          onClick={() => navigate('/admin/hold-amount/list')}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:scale-105"
          style={{ background: 'rgba(245,131,17,0.08)', color: '#f58311', border: '1px solid rgba(245,131,17,0.2)' }}>
          <ListIcon /> View List
        </button>
      </div>

      {/* Info banner */}
      <div className="flex items-start gap-3 px-4 py-3 rounded-xl"
        style={{ background: 'rgba(38,115,187,0.07)', border: '1px solid rgba(38,115,187,0.18)' }}>
        <span style={{ color: '#2673bb', marginTop: 1 }}><InfoIcon /></span>
        <p className="text-xs" style={{ color: 'var(--text-muted)', lineHeight: 1.6 }}>
          Hold amount reserves funds from a user's deal participation. After submission you can
          map the hold amount to specific deals from the list screen.
        </p>
      </div>

      {/* Form card */}
      <div className="rounded-2xl p-6"
        style={{ background: 'var(--table-bg)', border: '1px solid var(--border)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>

        <div className="flex items-center gap-2 mb-6 pb-4" style={{ borderBottom: '1px solid var(--border)' }}>
          <LockIcon />
          <h2 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Hold Amount Details</h2>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-5">

          {/* User ID */}
          <div>
            <label style={labelStyle}>User ID <span style={{ color: '#e95330' }}>*</span></label>
            <input
              style={{ ...inputStyle, borderColor: errors.userId ? '#e95330' : undefined }}
              placeholder="e.g. 3fa85f64-5717-4562-b3fc-2c963f66afa6"
              value={form.userId}
              onChange={e => set('userId', e.target.value)}
            />
            {errors.userId && <p style={errStyle}>{errors.userId}</p>}
          </div>

          {/* Deal ID */}
          <div>
            <label style={labelStyle}>Deal ID <span style={{ color: '#e95330' }}>*</span></label>
            <input
              style={{ ...inputStyle, borderColor: errors.dealId ? '#e95330' : undefined }}
              placeholder="e.g. 3fa85f64-5717-4562-b3fc-2c963f66afa6"
              value={form.dealId}
              onChange={e => set('dealId', e.target.value)}
            />
            {errors.dealId && <p style={errStyle}>{errors.dealId}</p>}
          </div>

          {/* Hold Amount */}
          <div>
            <label style={labelStyle}>Hold Amount (₹) <span style={{ color: '#e95330' }}>*</span></label>
            <input
              type="number"
              min="1"
              style={{ ...inputStyle, borderColor: errors.holdAmount ? '#e95330' : undefined }}
              placeholder="Enter amount to hold"
              value={form.holdAmount}
              onChange={e => set('holdAmount', e.target.value)}
            />
            {errors.holdAmount && <p style={errStyle}>{errors.holdAmount}</p>}
          </div>

          {/* Comments */}
          <div>
            <label style={labelStyle}>Comments <span style={{ color: '#e95330' }}>*</span></label>
            <textarea
              rows={3}
              style={{ ...inputStyle, resize: 'vertical', borderColor: errors.comments ? '#e95330' : undefined }}
              placeholder="Enter remarks or reason for holding…"
              value={form.comments}
              onChange={e => set('comments', e.target.value)}
            />
            {errors.comments && <p style={errStyle}>{errors.comments}</p>}
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => { setForm({ comments: '', dealId: '', holdAmount: '', userId: '' }); setErrors({}); }}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-all hover:scale-105"
              style={{ background: 'var(--input-bg)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
              Reset
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: 'linear-gradient(135deg,#f58311,#d4690a)', color: '#fff', boxShadow: '0 4px 16px rgba(245,131,17,0.35)' }}>
              {loading
                ? <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" strokeOpacity="0.25"/><path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round"/></svg>
                : <SendIcon />}
              {loading ? 'Submitting…' : 'Submit Hold Amount'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
