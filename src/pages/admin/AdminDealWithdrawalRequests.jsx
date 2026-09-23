import { useEffect, useMemo, useState } from "react";
import {
  approveOrRejectDealWithdrawal,
  generateWithdrawalFile,
  getApprovedWithdrawalUsersForFile,
  getAdminInitiatedWithdrawalRequests,
  updateWithdrawalPaidDate,
} from "../../api/afterlogin-admin";
import { formatINR } from "../../utils/currency";

const RefreshIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-4 h-4"
  >
    <polyline points="23 4 23 10 17 10" />
    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
  </svg>
);

function Status({ value }) {
  const status = String(value || "PENDING").toUpperCase();
  const color =
    status === "APPROVED"
      ? "#10b981"
      : status === "REJECTED"
        ? "#ef4444"
        : "#f59e0b";
  return (
    <span
      className="inline-flex px-2.5 py-1 rounded-full text-xs font-bold"
      style={{
        color,
        background: `${color}1f`,
        border: `1px solid ${color}4d`,
      }}
    >
      {status}
    </span>
  );
}

function normalize(response) {
  const withdrawalList = Array.isArray(response?.withdrawalList)
    ? response.withdrawalList
    : [];
  const principal = Array.isArray(response?.principalWithdrawalList)
    ? response.principalWithdrawalList
    : withdrawalList;
  const explicitInterest = Array.isArray(response?.withdrawalInterestList)
    ? response.withdrawalInterestList
    : [];
  const derivedInterest = explicitInterest.length
    ? []
    : principal
        .filter((item) => ["APPROVED", "EXECUTED"].includes(String(item.withdrawalStatus).toUpperCase()))
        .map((item) => ({
          ...item,
          withdrawalInterestStatus: item.withdrawalInterestStatus || "INITIATED",
        }));
  return {
    principal,
    interest: [...explicitInterest, ...derivedInterest],
  };
}

function ActionModal({ request, type, onClose, onComplete }) {
  const [action, setAction] = useState("APPROVED");
  const [remarks, setRemarks] = useState("");
  const [saving, setSaving] = useState(false);
  const submit = async () => {
    setSaving(true);
    try {
      await approveOrRejectDealWithdrawal({
        action,
        remarks,
        withdrawalId: request.id,
      });
      onComplete(request.id, type, action);
    } catch (error) {
      onComplete(
        null,
        null,
        null,
        error?.message || "Unable to update withdrawal",
      );
    } finally {
      setSaving(false);
    }
  };
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(6px)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl p-5"
        style={{
          background: "var(--surface-card)",
          border: "1px solid var(--border)",
        }}
        onClick={(event) => event.stopPropagation()}
      >
        <h3
          className="text-lg font-black"
          style={{ color: "var(--text-primary)" }}
        >
          {action === "APPROVED" ? "Approve" : "Reject"} {type} Withdrawal
        </h3>
        <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
          {request.userName} · {formatINR(request.withdrawalAmount)}
        </p>
        <div className="flex gap-2 mt-5">
          <button
            onClick={() => setAction("APPROVED")}
            className="flex-1 py-2 rounded-xl text-sm font-bold"
            style={{
              background: action === "APPROVED" ? "#10b981" : "var(--input-bg)",
              color: action === "APPROVED" ? "#fff" : "var(--text-muted)",
            }}
          >
            Approve
          </button>
          <button
            onClick={() => setAction("REJECTED")}
            className="flex-1 py-2 rounded-xl text-sm font-bold"
            style={{
              background: action === "REJECTED" ? "#ef4444" : "var(--input-bg)",
              color: action === "REJECTED" ? "#fff" : "var(--text-muted)",
            }}
          >
            Reject
          </button>
        </div>
        <textarea
          value={remarks}
          onChange={(event) => setRemarks(event.target.value)}
          rows={3}
          className="w-full mt-4 px-3 py-2.5 rounded-xl text-sm"
          placeholder="Remarks"
          style={{
            background: "var(--input-bg)",
            color: "var(--text-primary)",
            border: "1px solid var(--border)",
          }}
        />
        <div className="flex gap-3 mt-4">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
            style={{
              background: "var(--input-bg)",
              color: "var(--text-muted)",
              border: "1px solid var(--border)",
            }}
          >
            Cancel
          </button>
          <button
            disabled={saving}
            onClick={submit}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold"
            style={{ background: "#6366f1", color: "#fff" }}
          >
            {saving ? "Saving…" : "Confirm"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminDealWithdrawalRequests() {
  const [data, setData] = useState({ principal: [], interest: [] });
  const [tab, setTab] = useState("principal");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [active, setActive] = useState(null);
  const [generating, setGenerating] = useState("");
  const [generatedFiles, setGeneratedFiles] = useState(new Set());

  const updateRows = (id, type, changes) => {
    setData((current) => ({
      ...current,
      [type]: current[type].map((item) =>
        item.id === id ? { ...item, ...changes } : item,
      ),
    }));
  };

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const next = normalize(await getAdminInitiatedWithdrawalRequests());
      setData(next);
      if (next.principal.length === 0 && next.interest.length > 0) {
        setTab("interest");
      }
    } catch (err) {
      setError(err?.message || "Failed to load withdrawal requests");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    load();
  }, []);

  const approvedPrincipalIds = useMemo(
    () =>
      new Set(
        data.principal
          .filter(
            (item) =>
              ["APPROVED", "EXECUTED"].includes(
                String(item.withdrawalStatus).toUpperCase(),
              ),
          )
          .map((item) => item.id),
      ),
    [data.principal],
  );
  const visibleInterest = data.interest.filter(
    (item) =>
      approvedPrincipalIds.has(item.id) ||
      ["APPROVED", "EXECUTED"].includes(
        String(item.withdrawalStatus).toUpperCase(),
      ),
  );
  const rows = tab === "principal" ? data.principal : visibleInterest;
  const total = rows.reduce(
    (sum, item) => sum + Number(item.withdrawalAmount || 0),
    0,
  );
  const complete = (id, type, action, message) => {
    if (message) {
      setError(message);
      return;
    }
    setData((current) => ({
      ...current,
      [type]: current[type].map((item) =>
        item.id === id
          ? {
              ...item,
              [type === "principal"
                ? "withdrawalStatus"
                : "withdrawalInterestStatus"]: action,
            }
          : item,
      ),
    }));
    if (type === "principal" && action === "APPROVED") {
      setTab("interest");
      load();
    }
    setActive(null);
  };

  const downloadFile =async (request, type) => {
    const fileType = type === "principal" ? "principalwithdrawal" : "withdrawalinterest";
     try {
       await getApprovedWithdrawalUsersForFile({ fileType, withdrawalId: request.id });
     } catch (err) {
       setError(err?.message || "Failed to download file");
     }
   };

  const generateFile = async (request, type) => {
    const key = `${type}-${request.id}`;
    setGenerating(key);
    setError("");
    try {
      const fileType = type === "principal" ? "principalwithdrawal" : "withdrawalinterest";
      await getApprovedWithdrawalUsersForFile({ fileType, withdrawalId: request.id });
      const generated = await generateWithdrawalFile({ fileType, withdrawalId: request.id });
      const fileChanges = type === "principal"
        ? { principalFileName: generated?.fileName, principalDownloadUrl: generated?.downloadUrl, withdrawalStatus: "EXECUTED" }
        : { interestFileName: generated?.fileName, interestDownloadUrl: generated?.downloadUrl, withdrawalInterestStatus: "EXECUTED" };
      updateRows(request.id, type, fileChanges);
      setGeneratedFiles((current) => new Set([...current, key]));
    } catch (err) {
      setError(err?.message || `Failed to generate ${type} file`);
    } finally {
      setGenerating("");
    }
  };

  const markAsPaid = async (request, type) => {
    const fileType = type === "principal" ? "principalwithdrawal" : "withdrawalinterest";
    setError("");
    try {
      const paidDate = new Date().toISOString();
      await updateWithdrawalPaidDate({ fileType, paidDate, withdrawalId: request.id });
      updateRows(request.id, type, type === "principal" ? { paidDate } : { interestPaidDate: paidDate });
    } catch (err) {
      setError(err?.message || `Failed to mark ${type} withdrawal as paid`);
    }
  };

  return (
    <div className="grid gap-6">
      {active && (
        <ActionModal
          request={active.request}
          type={active.type}
          onClose={() => setActive(null)}
          onComplete={complete}
        />
      )}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1
            className="text-2xl font-black"
            style={{ color: "var(--text-primary)" }}
          >
            Deal Withdrawal Requests
          </h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--text-muted)" }}>
            Review principal and interest withdrawal requests
          </p>
        </div>
        <button
          onClick={load}
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold"
          style={{
            background: "var(--input-bg)",
            color: "var(--text-primary)",
            border: "1px solid var(--border)",
          }}
        >
          <RefreshIcon /> Refresh
        </button>
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => setTab("principal")}
          className="px-4 py-2 rounded-xl text-sm font-bold"
          style={{
            background: tab === "principal" ? "#6366f1" : "var(--input-bg)",
            color: tab === "principal" ? "#fff" : "var(--text-muted)",
          }}
        >
          Principal · {data.principal.length}
        </button>
        <button
          disabled={!visibleInterest.length}
          onClick={() => setTab("interest")}
          className="px-4 py-2 rounded-xl text-sm font-bold disabled:opacity-40"
          style={{
            background: tab === "interest" ? "#6366f1" : "var(--input-bg)",
            color: tab === "interest" ? "#fff" : "var(--text-muted)",
          }}
        >
          Interest · {visibleInterest.length}
        </button>
      </div>
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          background: "var(--surface-card)",
          border: "1px solid var(--border)",
        }}
      >
        {loading ? (
          <p className="p-5 text-sm" style={{ color: "var(--text-muted)" }}>
            Loading withdrawals…
          </p>
        ) : error ? (
          <p className="p-5 text-sm" style={{ color: "#ef4444" }}>
            {error}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr
                  style={{
                    background: "var(--input-bg)",
                    borderBottom: "1px solid var(--border)",
                  }}
                >
                          {[
                    "User",
                    "Deal",
                    "Amount",
                    "Interest",
                    "Requested",
                    "Status",
                    "Action",
                  ].map((title) => (
                    <th
                      key={title}
                      className="text-left py-3 px-4 text-xs uppercase tracking-widest whitespace-nowrap"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {title}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="py-10 text-center"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {tab === "interest"
                        ? "Approve a principal withdrawal to view interest requests"
                        : "No withdrawal requests found"}
                    </td>
                  </tr>
                ) : (
                  rows.map((item) => {
                    const status =
                      tab === "principal"
                        ? item.withdrawalStatus
                        : item.withdrawalInterestStatus;
                    const statusValue = String(status).toUpperCase();
                    const downloadUrl = tab === "principal"
                      ? item.principalDownloadUrl
                      : item.interestDownloadUrl;
                    const paidDate = tab === "principal"
                      ? item.paidDate
                      : item.interestPaidDate;
                    return (
                      <tr
                        key={`${tab}-${item.id}`}
                        style={{ borderBottom: "1px solid var(--border)" }}
                      >
                        <td
                          className="py-3 px-4 font-semibold"
                          style={{ color: "var(--text-primary)" }}
                        >
                          {item.userName || "—"}
                        </td>
                        <td
                          className="py-3 px-4 text-xs"
                          style={{ color: "var(--text-muted)" }}
                        >
                          {item.dealName || "—"}
                        </td>
                        <td
                          className="py-3 px-4 font-bold"
                          style={{ color: "#10b981" }}
                        >
                          {formatINR(item.withdrawalAmount)}
                        </td>
                        <td
                          className="py-3 px-4"
                          style={{ color: "var(--text-primary)" }}
                        >
                          {item.withdrawalInterest ?? "—"}
                        </td>
                        <td
                          className="py-3 px-4 text-xs"
                          style={{ color: "var(--text-muted)" }}
                        >
                          {item.initiatedDate || "—"}
                        </td>
                        <td className="py-3 px-4">
                          <Status value={status} />
                        </td>
                        <td className="py-3 px-4">
                          {statusValue === "APPROVED" ? (
                            <button
                              onClick={() => generateFile(item, tab)}
                              disabled={generating === `${tab}-${item.id}`}
                              className="px-3 py-1.5 rounded-lg text-xs font-bold disabled:opacity-60"
                              style={{ background: "rgba(16,185,129,0.14)", color: "#059669" }}
                            >
                              {generating === `${tab}-${item.id}`
                                ? "Generating…"
                                : generatedFiles.has(`${tab}-${item.id}`)
                                  ? "File Generated"
                                  : `Generate ${tab === "principal" ? "Principal" : "Interest"} File`}
                            </button>
                          ) : statusValue === "INITIATED" ? (
                            <button
                              onClick={() => setActive({ request: item, type: tab })}
                              className="px-3 py-1.5 rounded-lg text-xs font-bold"
                              style={{ background: "rgba(99,102,241,0.14)", color: "#6366f1" }}
                            >
                              {tab === "principal" ? "Principal Approve" : "Interest Approve"}
                            </button>
                          ) : statusValue === "EXECUTED" ? (
                            <div className="flex items-center gap-2 flex-wrap">
                              {downloadUrl && (
                                <a
                                  href={downloadUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  download
                                  className="px-3 py-1.5 rounded-lg text-xs font-bold"
                                  style={{ background: "rgba(16,185,129,0.14)", color: "#059669" }}
                                >
                                  Download File
                                </a>
                              )}
                              {paidDate ? (
                                <span className="text-xs font-semibold" style={{ color: "#10b981" }}>Paid</span>
                              ) : (
                                <button
                                  onClick={() => markAsPaid(item, tab)}
                                  className="px-3 py-1.5 rounded-lg text-xs font-bold"
                                  style={{ background: "rgba(245,158,11,0.14)", color: "#d97706" }}
                                >
                                  Mark {tab === "principal" ? "Principal" : "Interest"} Paid
                                </button>
                              )}
                            </div>
                          ) : (
                            <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                              Processed
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
