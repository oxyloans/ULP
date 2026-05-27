import { Fragment, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { getUserId } from '../api/client';
import {
  downloadGoldMou,
  getGoldParticipationDetails,
  getGoldParticipationSlips,
  updateSlipDescription,
  uploadGoldParticipationSlip,
} from '../api/afterlogin-user';
import { formatINR } from '../utils/currency';

function fmtINR(n) {
  return formatINR(n ?? 0);
}

function statusBadge(status) {
  if (status === 'VIEWANDAPPROVE') {
    return <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: 'rgba(16,185,129,0.15)', color: '#10b981', border: '1px solid rgba(16,185,129,0.28)' }}>Approved</span>;
  }
  if (status === 'NOTVIEW') {
    return <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.28)' }}>Pending</span>;
  }
  return <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: 'rgba(239,68,68,0.15)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.28)' }}>Rejected</span>;
}

function filePreview(url) {
  if (!url) return null;
  if (url.toLowerCase().endsWith('.pdf')) {
    return `https://docs.google.com/gview?url=${encodeURIComponent(url)}&embedded=true`;
  }
  return url;
}

function SlipHistoryTable({ docs, messageDraft, setMessageDraft, messageLoading, saveMessage, setPreviewDoc }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr style={{ background: 'var(--table-header-bg)' }}>
            {['#', 'Date', 'Payment', 'Status', 'Description', 'User Comments', 'Document', 'Message'].map(h => (
              <th key={h} className="text-left px-3 py-2 text-xs" style={{ color: 'var(--text-muted)' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {docs.map((doc, idx) => (
            <tr key={`${doc.documentId}-${idx}`} style={{ borderTop: '1px solid var(--border)' }}>
              <td className="px-3 py-2">{idx + 1}</td>
              <td className="px-3 py-2">{doc.participatedDate ?? '-'}</td>
              <td className="px-3 py-2 font-semibold">{fmtINR(doc.paymentAmount)}</td>
              <td className="px-3 py-2">{statusBadge(doc.documentStatus)}</td>
              <td className="px-3 py-2">{doc.description ?? '-'}</td>
              <td className="px-3 py-2">{doc.userComments ?? '-'}</td>
              <td className="px-3 py-2">
                <button
                  onClick={() => setPreviewDoc(doc)}
                  className="text-xs underline"
                  style={{ color: '#6366f1' }}>
                  {doc.documentName ?? 'View'}
                </button>
              </td>
              <td className="px-3 py-2 min-w-[220px]">
                <div className="flex items-center gap-2">
                  <input
                    value={messageDraft[doc.documentId] ?? ''}
                    onChange={e => setMessageDraft(prev => ({ ...prev, [doc.documentId]: e.target.value }))}
                    placeholder="Add comment"
                    className="w-full px-2 py-1.5 rounded-lg text-xs outline-none"
                    style={{ background: 'var(--input-bg)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                  />
                  <button
                    onClick={() => saveMessage(doc.documentId)}
                    disabled={messageLoading === doc.documentId}
                    className="px-2 py-1.5 rounded-lg text-xs font-semibold"
                    style={{ background: '#6366f1', color: '#fff' }}>
                    {messageLoading === doc.documentId ? '...' : 'Save'}
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function GoldParticipationDetails() {
  const { propertyId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const userId = getUserId();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expanded, setExpanded] = useState(null);
  const [slipsByParticipation, setSlipsByParticipation] = useState({});
  const [slipsLoading, setSlipsLoading] = useState({});
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadParticipationId, setUploadParticipationId] = useState('');
  const [uploadAmount, setUploadAmount] = useState('');
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadMessage, setUploadMessage] = useState('');
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploadMessageError, setUploadMessageError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState('');
  const [messageDraft, setMessageDraft] = useState({});
  const [messageLoading, setMessageLoading] = useState('');
  const [previewDoc, setPreviewDoc] = useState(null);

  const propertyType = location.state?.propertyType ?? data?.propertyType ?? 'GOLDLOT';
  const auctionType = location.state?.auctionType ?? data?.auctionType ?? 'Open';
  const userParticipationStatus = location.state?.userParticipationStatus ?? 'MOU';

  const loadDetails = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getGoldParticipationDetails(propertyId);
      setData(res);
    } catch (e) {
      setError(e.message ?? 'Failed to load participation details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (propertyId) loadDetails();
  }, [propertyId]);

  const participations = data?.userParticipatedList ?? [];

  const loadSlips = async (participationId) => {
    if (!participationId) return;
    setSlipsLoading(prev => ({ ...prev, [participationId]: true }));
    try {
      const res = await getGoldParticipationSlips({ propertyId, participationId });
      const list = res?.documentUploadResponseList ?? [];
      setSlipsByParticipation(prev => ({ ...prev, [participationId]: list }));
    } catch {
      setSlipsByParticipation(prev => ({ ...prev, [participationId]: [] }));
    } finally {
      setSlipsLoading(prev => ({ ...prev, [participationId]: false }));
    }
  };

  useEffect(() => {
    if (!participations.length) return;
    Promise.all(participations.map(p => loadSlips(p.participatedId)));
  }, [data?.propertyId, participations.length]);

  const totals = useMemo(() => {
    const totalContributed = Number(data?.totalSum ?? 0);
    const approved = participations.reduce((sum, p) => {
      const docs = slipsByParticipation[p.participatedId] ?? [];
      const approvedAmt = docs
        .filter(d => d.documentStatus === 'VIEWANDAPPROVE')
        .reduce((s, d) => s + Number(d.paymentAmount ?? 0), 0);
      return sum + approvedAmt;
    }, 0);
    const committed = Math.max(0, totalContributed - approved);
    return { totalContributed, approved, committed };
  }, [data?.totalSum, participations, slipsByParticipation]);

  const userFees = useMemo(() => {
    const fromFirst = data?.userParticipatedList?.[0]?.userIndividualFeeDto;
    if (Array.isArray(fromFirst)) return [...fromFirst].reverse();
    return [];
  }, [data?.userParticipatedList]);

  const startUpload = (participationId) => {
    setUploadParticipationId(participationId);
    setUploadAmount('');
    setUploadFile(null);
    setUploadMessage('');
    setUploadError('');
    setUploadMessageError('');
    setUploadSuccess('');
    setUploadOpen(true);
  };

  const submitUpload = async () => {
    const amountNum = Number(uploadAmount);
    if (!amountNum || amountNum <= 0) {
      setUploadError('Please enter a valid amount.');
      return;
    }
    if (!uploadFile) {
      setUploadError('Please upload JPG, PNG, or PDF.');
      return;
    }
    if (!uploadMessage.trim()) {
      setUploadMessageError('Message is required before submitting slip.');
      return;
    }
    setUploadLoading(true);
    setUploadError('');
    setUploadMessageError('');
    setUploadSuccess('');
    try {
      const uploadRes = await uploadGoldParticipationSlip({
        propertyId,
        participationId: uploadParticipationId,
        amount: amountNum,
        file: uploadFile,
      });
      const uploadedDocumentId = uploadRes?.documentId ?? uploadRes?.id ?? null;
      if (uploadedDocumentId) await updateSlipDescription({ documentId: uploadedDocumentId, description: uploadMessage.trim() });
      setUploadSuccess('Slip uploaded successfully.');
      await loadSlips(uploadParticipationId);
      setUploadOpen(false);
    } catch (e) {
      setUploadError(e.message ?? 'Upload failed. Please try again.');
    } finally {
      setUploadLoading(false);
    }
  };

  const downloadMou = async () => {
    try {
      const blob = await downloadGoldMou(data?.propertyId, userId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `MoU_${data?.propertyName ?? 'Gold_Deal'}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      setError(e.message ?? 'Failed to download MoU.');
    }
  };

  const saveMessage = async (documentId) => {
    const description = messageDraft[documentId] ?? '';
    if (!description.trim()) return;
    setMessageLoading(documentId);
    try {
      await updateSlipDescription({ documentId, description });
      const pid = expanded;
      if (pid) await loadSlips(pid);
      setMessageDraft(prev => ({ ...prev, [documentId]: '' }));
    } catch (e) {
      setError(e.message ?? 'Unable to save message.');
    } finally {
      setMessageLoading('');
    }
  };

  if (loading) {
    return <div className="py-16 text-center text-sm font-semibold" style={{ color: 'var(--text-muted)' }}>Loading participation details...</div>;
  }

  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <p className="text-xs uppercase tracking-widest font-semibold" style={{ color: '#f59e0b' }}>Gold Participation</p>
          <h1 className="text-lg font-extrabold" style={{ color: 'var(--text-primary)' }}>{data?.propertyName ?? 'Details'}</h1>
        </div>
        <button onClick={() => navigate('/gold-deals-participation')} className="px-3 py-2 rounded-xl text-xs font-semibold" style={{ background: 'var(--input-bg)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
          Back to Gold Deals
        </button>
      </div>

      {error && (
        <div className="px-4 py-2.5 rounded-xl text-xs font-semibold" style={{ background: 'rgba(239,68,68,0.08)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }}>
          {error}
        </div>
      )}
      {uploadSuccess && (
        <div className="px-4 py-2.5 rounded-xl text-xs font-semibold" style={{ background: 'rgba(16,185,129,0.08)', color: '#10b981', border: '1px solid rgba(16,185,129,0.2)' }}>
          {uploadSuccess}
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl p-4" style={{ background: 'var(--surface-card)', border: '1px solid var(--border)' }}>
          <p className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>Total Contributed</p>
          <p className="text-xl font-extrabold mt-1" style={{ color: '#6366f1' }}>{fmtINR(totals.totalContributed)}</p>
        </div>
        {auctionType === 'Open' && (
          <div className="rounded-2xl p-4" style={{ background: 'var(--surface-card)', border: '1px solid var(--border)' }}>
            <p className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>Total Committed</p>
            <p className="text-xl font-extrabold mt-1" style={{ color: '#f59e0b' }}>{fmtINR(totals.committed)}</p>
          </div>
        )}
        {auctionType === 'Open' && (
          <div className="rounded-2xl p-4" style={{ background: 'var(--surface-card)', border: '1px solid var(--border)' }}>
            <p className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>Total Approved</p>
            <p className="text-xl font-extrabold mt-1" style={{ color: '#10b981' }}>{fmtINR(totals.approved)}</p>
          </div>
        )}
      </div>

      <div className="rounded-2xl p-3 flex items-center gap-2 flex-wrap" style={{ background: 'var(--surface-card)', border: '1px solid var(--border)' }}>
        <button
          onClick={() => navigate(`/interestPaymentDates/${propertyId}/`)}
          disabled={userParticipationStatus !== 'MOU'}
          className="px-3 py-2 rounded-xl text-xs font-semibold disabled:opacity-50"
          style={{ background: 'linear-gradient(135deg,#6366f1,#4f46e5)', color: '#fff' }}>
          Realization Payout
        </button>
        <button
          onClick={downloadMou}
          disabled={userParticipationStatus !== 'MOU'}
          className="px-3 py-2 rounded-xl text-xs font-semibold disabled:opacity-50"
          style={{ background: 'var(--input-bg)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}>
          View MoU
        </button>
      </div>

      <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid var(--border)', background: 'var(--surface-card)' }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: 'var(--table-header-bg)' }}>
                <th className="text-left px-3 py-2 text-xs" style={{ color: 'var(--text-muted)' }}>{propertyType === 'GOLDLOT' || propertyType === 'SDLOT' ? 'Deal Name' : 'Property Name'}</th>
                <th className="text-left px-3 py-2 text-xs" style={{ color: 'var(--text-muted)' }}>Contributed</th>
                <th className="text-left px-3 py-2 text-xs" style={{ color: 'var(--text-muted)' }}>Fee Amount</th>
                <th className="text-left px-3 py-2 text-xs" style={{ color: 'var(--text-muted)' }}>Received / Remaining</th>
                <th className="text-left px-3 py-2 text-xs" style={{ color: 'var(--text-muted)' }}>Realization</th>
                <th className="text-left px-3 py-2 text-xs" style={{ color: 'var(--text-muted)' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {participations.filter(p => Number(p.participatedAmount) > 0).map((p, idx) => {
                const docs = slipsByParticipation[p.participatedId] ?? [];
                const received = docs.filter(d => d.documentStatus === 'VIEWANDAPPROVE').reduce((s, d) => s + Number(d.paymentAmount ?? 0), 0);
                const remaining = Math.max(0, Number(p.participatedAmount ?? 0) - received);
                const isOpen = expanded === p.participatedId;
                return (
                  <Fragment key={p.participatedId ?? idx}>
                    <tr style={{ borderTop: '1px solid var(--border)' }}>
                      <td className="px-3 py-2.5" style={{ color: 'var(--text-primary)' }}>{data?.propertyName ?? 'N/A'}</td>
                      <td className="px-3 py-2.5 font-semibold" style={{ color: 'var(--text-primary)' }}>{fmtINR(p.participatedAmount)}</td>
                      <td className="px-3 py-2.5">{fmtINR(userFees[idx]?.participatedPaidFee ?? 0)}</td>
                      <td className="px-3 py-2.5">
                        <span style={{ color: '#10b981', fontWeight: 700 }}>{fmtINR(received)}</span>
                        <span style={{ color: 'var(--text-muted)' }}> / </span>
                        <span style={{ color: '#f59e0b', fontWeight: 700 }}>{fmtINR(remaining)}</span>
                      </td>
                      <td className="px-3 py-2.5" style={{ textTransform: 'capitalize' }}>
                        {(p.participatedType === 'eod' ? 'End of the deal' : (p.participatedType ?? 'N/A'))}
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          {(p.userParticipationStatus === 'CALLFORMONEY' || p.userParticipationStatus === 'PARTICIPATED') && (
                            <button onClick={() => startUpload(p.participatedId)} className="px-2.5 py-1.5 rounded-lg text-xs font-semibold" style={{ background: 'linear-gradient(135deg,#f59e0b,#d97706)', color: '#fff' }}>
                              Upload
                            </button>
                          )}
                          <button
                            onClick={async () => {
                              if (isOpen) {
                                setExpanded(null);
                                return;
                              }
                              setExpanded(p.participatedId);
                              await loadSlips(p.participatedId);
                            }}
                            className="px-2.5 py-1.5 rounded-lg text-xs font-semibold"
                            style={{ background: 'var(--input-bg)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}>
                            {isOpen ? 'Hide Slips' : 'View Slips'}
                          </button>
                          <span className="text-xs font-semibold" style={{ color: '#10b981' }}>
                            {docs.filter(d => d.documentStatus === 'VIEWANDAPPROVE').length} Approved
                          </span>
                          <span className="text-xs font-semibold" style={{ color: '#f59e0b' }}>
                            {docs.filter(d => d.documentStatus === 'NOTVIEW').length} Pending
                          </span>
                        </div>
                      </td>
                    </tr>
                    {isOpen && (
                      <tr>
                        <td colSpan={6} className="p-0">
                          <div style={{ borderTop: '1px solid var(--border)', background: 'var(--surface)' }}>
                            <div className="px-4 py-3 text-xs font-bold uppercase tracking-widest" style={{ color: '#6366f1' }}>Slip History</div>
                            {slipsLoading[p.participatedId] ? (
                              <div className="px-4 pb-4 text-sm" style={{ color: 'var(--text-muted)' }}>Loading slips...</div>
                            ) : (slipsByParticipation[p.participatedId]?.length ?? 0) === 0 ? (
                              <div className="px-4 pb-4 text-sm" style={{ color: 'var(--text-muted)' }}>No documents available for this participation.</div>
                            ) : (
                              <SlipHistoryTable
                                docs={slipsByParticipation[p.participatedId] ?? []}
                                messageDraft={messageDraft}
                                setMessageDraft={setMessageDraft}
                                messageLoading={messageLoading}
                                saveMessage={saveMessage}
                                setPreviewDoc={setPreviewDoc}
                              />
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {uploadOpen && (
        <div className="fixed inset-0 z-50 flex justify-end" style={{ background: 'rgba(0,0,0,0.45)' }} onClick={() => setUploadOpen(false)}>
          <div className="h-full w-full max-w-md p-5 overflow-y-auto" style={{ background: 'var(--surface-card)', borderLeft: '1px solid var(--border)' }} onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-extrabold" style={{ color: 'var(--text-primary)' }}>Upload Payment Slip</h3>
              <button onClick={() => setUploadOpen(false)} className="w-8 h-8 rounded-lg" style={{ background: 'var(--input-bg)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>x</button>
            </div>

            <div className="grid gap-3">
              <div className="grid gap-1.5">
                <label className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>Amount (₹)</label>
                <input
                  type="text"
                  value={uploadAmount}
                  onChange={e => {
                    const val = e.target.value;
                    if (/^\d*(\.\d{0,2})?$/.test(val)) setUploadAmount(val);
                  }}
                  className="px-3 py-2 rounded-xl text-sm outline-none"
                  style={{ background: 'var(--input-bg)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                />
              </div>

              <div className="grid gap-1.5">
                <label className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>File</label>
                <input
                  type="file"
                  accept="image/jpeg,image/png,application/pdf"
                  onChange={e => {
                    const f = e.target.files?.[0];
                    if (!f) return setUploadFile(null);
                    if (!['image/jpeg', 'image/png', 'application/pdf'].includes(f.type)) {
                      setUploadError('Invalid file type. Please upload JPG, PNG, or PDF.');
                      setUploadFile(null);
                      return;
                    }
                    setUploadError('');
                    setUploadFile(f);
                  }}
                  className="text-sm"
                />
              </div>

              <div className="grid gap-1.5">
                <label className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>Message</label>
                <textarea
                  rows={3}
                  value={uploadMessage}
                  onChange={e => { setUploadMessage(e.target.value); setUploadMessageError(''); }}
                  placeholder="Enter your confirmation message"
                  className="px-3 py-2 rounded-xl text-sm outline-none resize-none"
                  style={{ background: 'var(--input-bg)', border: `1px solid ${uploadMessageError ? '#ef4444' : 'var(--border)'}`, color: 'var(--text-primary)' }}
                />
                {uploadMessageError && <p className="text-xs font-semibold" style={{ color: '#ef4444' }}>{uploadMessageError}</p>}
              </div>

              {uploadError && <p className="text-xs font-semibold" style={{ color: '#ef4444' }}>{uploadError}</p>}

              <button
                onClick={submitUpload}
                disabled={uploadLoading}
                className="w-full py-2.5 rounded-xl text-sm font-bold"
                style={{ background: 'linear-gradient(135deg,#6366f1,#4f46e5)', color: '#fff' }}>
                {uploadLoading ? 'Uploading...' : 'Upload'}
              </button>
            </div>
          </div>
        </div>
      )}

      {previewDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.6)' }} onClick={() => setPreviewDoc(null)}>
          <div className="w-full max-w-3xl rounded-2xl overflow-hidden" style={{ background: 'var(--surface-card)', border: '1px solid var(--border)' }} onClick={e => e.stopPropagation()}>
            <div className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border)' }}>
              <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{previewDoc.documentName ?? 'Document Preview'}</p>
              <button onClick={() => setPreviewDoc(null)} className="w-7 h-7 rounded-lg" style={{ background: 'var(--input-bg)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>x</button>
            </div>
            <div className="p-4" style={{ minHeight: 420 }}>
              {filePreview(previewDoc.documentUrl)?.includes('gview') ? (
                <iframe title="doc-preview" src={filePreview(previewDoc.documentUrl)} className="w-full h-[520px]" />
              ) : (
                <img src={previewDoc.documentUrl} alt="Document" className="max-w-full max-h-[520px] mx-auto rounded-xl" />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
