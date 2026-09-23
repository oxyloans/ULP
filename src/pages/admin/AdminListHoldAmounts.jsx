import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { BASE_URL, getToken } from "../../api/client";
import { getUserViewInterestStatement } from "../../api/afterlogin-user";

const PAGE_SIZE = 8;
const money = (n) =>
  Number(n ?? 0).toLocaleString("en-IN", { maximumFractionDigits: 2 });
const date = (v) => {
  if (!v) return "—";
  const d = new Date(v);
  return Number.isNaN(d.getTime())
    ? String(v).slice(0, 10)
    : d.toISOString().slice(0, 10);
};
const principal = (d) =>
  d?.principalAmount ??
  d?.investmentAmount ??
  d?.participationAmount ??
  d?.participatedAmount ??
  d?.paticipatedAmount ??
  d?.amount ??
  0;
const interest = (d) => {
  const direct =
    d?.interestAmount ??
    d?.lenderInterestAmount ??
    d?.totalInterest ??
    d?.interest;
  if (direct != null) return direct;
  const rows =
    d?.interestInfoList ??
    d?.lenderInterestInfoList ??
    d?.interestDetails ??
    [];
  return Array.isArray(rows)
    ? rows.reduce(
        (sum, row) => sum + Number(row?.interestAmount ?? row?.amount ?? 0),
        0,
      )
    : 0;
};

function InterestDetails({ deal, userId }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let alive = true;
    setLoading(true);
    getUserViewInterestStatement(deal.dealId, userId)
      .then((r) => alive && setRows(r?.participationInterestStatement ?? []))
      .catch(() => alive && setRows([]))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [deal.dealId, userId]);
  if (loading)
    return (
      <span style={{ color: "var(--text-muted)" }}>
        Loading interest details…
      </span>
    );
  const pending = rows
    .filter(
      (r) =>
        !["PAID", "EXECUTED"].includes(String(r?.status ?? "").toUpperCase()) &&
        !r?.paidDate,
    )
    .slice(0, 1);
  if (!pending.length)
    return (
      <span style={{ color: "var(--text-muted)" }}>
        No unpaid or upcoming payment
      </span>
    );
  return (
    <div className="overflow-x-auto">
      <table
        className="w-full text-xs"
        style={{ minWidth: 600, borderCollapse: "collapse" }}
      >
        <thead>
          <tr style={{ background: "#edf6f8" }}>
            {[
              "Interest Date",
              "Days",
              "Interest Amount",
              "Paid Date",
              "Status",
            ].map((h) => (
              <th
                key={h}
                className="px-2 py-1.5 text-left"
                style={{ border: "1px solid #9aa6ad" }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {pending.map((r, i) => (
            <tr key={r.id ?? i}>
              <td
                className="px-2 py-1.5"
                style={{ border: "1px solid #c4cdd2" }}
              >
                {r.actualInterestDate ?? r.interestDate ?? "—"}
              </td>
              <td
                className="px-2 py-1.5"
                style={{ border: "1px solid #c4cdd2" }}
              >
                {r.days ?? "—"}
              </td>
              <td
                className="px-2 py-1.5 font-bold"
                style={{ border: "1px solid #c4cdd2" }}
              >
                ₹{money(r.interestAmount ?? r.amount)}
              </td>
              <td
                className="px-2 py-1.5"
                style={{ border: "1px solid #c4cdd2" }}
              >
                {r.paidDate ?? "Not paid"}
              </td>
              <td
                className="px-2 py-1.5 font-semibold"
                style={{ border: "1px solid #c4cdd2" }}
              >
                {r.status ?? "UPCOMING"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function AdminListHoldAmounts() {
  const navigate = useNavigate();
  const token = getToken();
  const [holds, setHolds] = useState([]),
    [expandedId, setExpandedId] = useState(null),
    [deals, setDeals] = useState([]),
    [nextPayments, setNextPayments] = useState({});
  const [holdInformation, setHoldInformation] = useState(null);
  const [principalIds, setPrincipalIds] = useState(new Set()),
    [interestIds, setInterestIds] = useState(new Set());
  const [loading, setLoading] = useState(false),
    [dealsLoading, setDealsLoading] = useState(false),
    [search, setSearch] = useState(""),
    [page, setPage] = useState(1);

  const fetchHolds = async () => {
    setLoading(true);
    try {
      const r = await axios.get(
        `${BASE_URL}/oxybrick-service/listOfHoldAmounts`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setHolds(Array.isArray(r.data) ? r.data : []);
    } catch (e) {
      toast.error(e?.response?.data?.message ?? "Failed to load hold amounts");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchHolds();
  }, []);
  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return q
      ? holds.filter((r) =>
          [r.userId, r.userName, r.dealId, r.comments, r.reason].some((v) =>
            String(v ?? "")
              .toLowerCase()
              .includes(q),
          ),
        )
      : holds;
  }, [holds, search]);
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const visible = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  useEffect(() => {
    if (page > pages) setPage(pages);
  }, [page, pages]);
  const selectedHold = holds.find((r) => r.id === expandedId);

  const choose = async (row) => {
    if (expandedId === row.id) {
      setExpandedId(null);
      return;
    }
    setExpandedId(row.id);
    setDeals([]);
    setNextPayments({});
    setHoldInformation(null);
    setPrincipalIds(new Set());
    setInterestIds(new Set());
    setDealsLoading(true);
    try {
      const holdInfoRequest = axios.get(
        `${BASE_URL}/oxybrick-service/holdInformation/${row.userId}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      const r = await axios.get(
        `${BASE_URL}/oxybrick-service/getRunningDeals/${row.userId}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      holdInfoRequest
        .then(response => setHoldInformation(response.data?.data ?? response.data))
        .catch(() => setHoldInformation(null));
      const d = r.data;
      const list = Array.isArray(d) ? d : (d?.participationInfo ?? []);
      setDeals(list);
      const paymentEntries = await Promise.all(list.map(async deal => {
        const dealId = deal.dealId ?? deal.id;
        try {
          const statement = await getUserViewInterestStatement(dealId, row.userId);
          const next = (statement?.participationInterestStatement ?? [])
            .find(item => !['PAID', 'EXECUTED'].includes(String(item?.status ?? '').toUpperCase()) && !item?.paidDate);
          return [dealId, next ?? null];
        } catch {
          return [dealId, null];
        }
      }));
      setNextPayments(Object.fromEntries(paymentEntries));
    } catch (e) {
      toast.error(e?.response?.data?.message ?? "Failed to load user deals");
    } finally {
      setDealsLoading(false);
    }
  };
  const toggle = (id, type) => {
    const setter = type === "principal" ? setPrincipalIds : setInterestIds;
    setter((old) => {
      const n = new Set(old);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };
  const process = () => {
    if (!selectedHold) return toast.info("Choose a hold amount first");
    navigate(`/admin/hold-amount/deals/${selectedHold.userId}`, {
      state: {
        holdAmount: selectedHold.holdAmount,
        holdId: selectedHold.id,
        userName: selectedHold.userName,
        selectedPrincipalIds: [...principalIds],
        selectedInterestIds: [...interestIds],
      },
    });
  };
  const deleteHold = async (row) => {
    if (!row?.id) return toast.error("Hold ID is missing");
    if (!window.confirm("Delete this hold amount?")) return;
    try {
      await axios.patch(
        `${BASE_URL}/oxybrick-service/deleteHoldAmount/${row.id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if (expandedId === row.id) setExpandedId(null);
      toast.success("Hold amount deleted successfully");
      await fetchHolds();
    } catch (e) {
      toast.error(e?.response?.data?.message ?? "Failed to delete hold amount");
    }
  };

  return (
    <div className="grid gap-5">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <p
            className="text-xs uppercase tracking-widest font-bold"
            style={{ color: "#2673bb" }}
          >
            Hold Amount
          </p>
          <h1
            className="text-2xl font-extrabold"
            style={{ color: "var(--text-primary)" }}
          >
            List of Hold Amounts
          </h1>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchHolds}
            className="px-3 py-2 rounded-lg text-xs font-bold"
            style={{
              background: "var(--input-bg)",
              color: "var(--text-muted)",
              border: "1px solid var(--border)",
            }}
          >
            Refresh
          </button>
          <button
            onClick={() => navigate("/admin/hold-amount/create")}
            className="px-3 py-2 rounded-lg text-xs font-bold"
            style={{ background: "#0aaed6", color: "#fff" }}
          >
            + New Hold
          </button>
        </div>
      </div>
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <button
          onClick={process}
          className="px-4 py-2 rounded-md text-sm font-bold"
          style={{ background: "#0aaed6", color: "#fff" }}
        >
          Process
        </button>
        <div className="flex gap-2">
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search lender, deal or reason"
            className="px-3 py-2 rounded-md text-xs outline-none"
            style={{
              background: "var(--input-bg)",
              border: "1px solid var(--border)",
              color: "var(--text-primary)",
              minWidth: 220,
            }}
          />
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-2 rounded disabled:opacity-40"
            style={{ border: "1px solid var(--border)" }}
          >
            ←
          </button>
          <span
            className="px-3 py-2 text-xs font-bold"
            style={{ background: "#2673bb", color: "#fff" }}
          >
            {page}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(pages, p + 1))}
            disabled={page === pages}
            className="px-3 py-2 rounded disabled:opacity-40"
            style={{ border: "1px solid var(--border)" }}
          >
            →
          </button>
        </div>
      </div>
      <div
        className="overflow-x-auto rounded-md"
        style={{ border: "1px solid #111" }}
      >
        <table
          className="w-full text-xs"
          style={{ minWidth: 900, borderCollapse: "collapse" }}
        >
          <thead>
            <tr style={{ background: "#b3c9e2", color: "#142238" }}>
              {[
                "Lender Id",
                "Request Date",
                "Current Hold Amount",
                "Hold Amount",
                "Reason",
                "Status",
                "Choose Deal",
              ].map((h) => (
                <th
                  key={h}
                  className="px-2 py-2 text-left font-extrabold"
                  style={{ border: "1px solid #111" }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={7} className="p-8 text-center">
                  Loading hold amounts…
                </td>
              </tr>
            )}
            {!loading && !visible.length && (
              <tr>
                <td colSpan={7} className="p-8 text-center">
                  No hold amounts found
                </td>
              </tr>
            )}
            {!loading &&
              visible.map((r, i) => (
                <tr
                  key={r.id ?? i}
                  style={{
                    background:
                      expandedId === r.id ? "#e7f5fb" : "var(--surface-card)",
                  }}
                >
                  <td
                    className="px-2 py-2"
                    style={{ border: "1px solid #111" }}
                  >
                    {r.userId ?? "—"}
                  </td>
                  <td
                    className="px-2 py-2"
                    style={{ border: "1px solid #111" }}
                  >
                    {date(r.createdAt ?? r.createdDate ?? r.createdOn)}
                  </td>
                  <td
                    className="px-2 py-2"
                    style={{ border: "1px solid #111" }}
                  >
                    {money(r.currentHoldAmount ?? r.currentAmount)}
                  </td>
                  <td
                    className="px-2 py-2 font-bold"
                    style={{ border: "1px solid #111" }}
                  >
                    {money(r.holdAmount)}
                  </td>
                  <td
                    className="px-2 py-2 min-w-[340px]"
                    style={{ border: "1px solid #111" }}
                  >
                    {r.comments ?? r.reason ?? "—"}
                  </td>
                  <td
                    className="px-2 py-2 font-semibold"
                    style={{ border: "1px solid #111" }}
                  >
                    {String(r.status ?? r.holdStatus ?? "OPEN").toUpperCase()}
                  </td>
                  <td
                    className="px-2 py-2"
                    style={{ border: "1px solid #111" }}
                  >
                    <button
                      onClick={() => choose(r)}
                      className="block px-2 py-1 rounded text-xs font-bold mb-1"
                      style={{ background: "#666", color: "#fff" }}
                    >
                      {expandedId === r.id ? "Close ↑" : "Choose ↓"}
                    </button>
                    <button
                      onClick={() => deleteHold(r)}
                      className="px-2 py-1 rounded text-xs font-bold"
                      style={{ background: "#ef483d", color: "#fff" }}
                    >
                      Delete ▣
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
      <div
        className="flex justify-between text-xs"
        style={{ color: "var(--text-muted)" }}
      >
        <span>{filtered.length} records</span>
        <span>
          Page {page} of {pages}
        </span>
      </div>
      {selectedHold && (
        <div
          className="rounded-md p-3 grid gap-4"
          style={{
            border: "1px solid #111",
            background: "var(--surface-card)",
          }}
        >
          <div className="grid gap-2 text-xs">
            <div
              className="rounded p-2"
              style={{ background: "#f4f7f8", border: "1px solid #c4cdd2" }}
            >
              <p className="font-bold" style={{ color: "#52616b" }}>
                Lender
              </p>
              <p className="mt-1" style={{ color: "#142238" }}>
                {selectedHold.userName ?? selectedHold.userId ?? "—"}
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {[
                ["Hold Amount", `₹${money(selectedHold.holdAmount)}`],
                [
                  "Current Hold",
                  `₹${money(holdInformation?.currentHoldAmount ?? holdInformation?.holdAmount ?? holdInformation?.amount ?? selectedHold.currentHoldAmount ?? selectedHold.currentAmount)}`,
                ],
                [
                  "Status",
                  String(
                    selectedHold.status ?? selectedHold.holdStatus ?? "OPEN",
                  ).toUpperCase(),
                ],
              ].map(([l, v]) => (
                <div
                  key={l}
                  className="rounded p-2"
                  style={{ background: "#f4f7f8", border: "1px solid #c4cdd2" }}
                >
                  <p className="font-bold" style={{ color: "#52616b" }}>
                    {l}
                  </p>
                  <p className="mt-1" style={{ color: "#142238" }}>
                    {v}
                  </p>
                </div>
              ))}
            </div>
            <p className="text-xs" style={{ color: "#52616b" }}>
              <strong>Reason:</strong>{" "}
              {selectedHold.comments ?? selectedHold.reason ?? "—"}
            </p>
          </div>
          <div className="flex justify-between items-center">
            <p
              className="text-sm font-extrabold"
              style={{ color: "var(--text-primary)" }}
            >
              Deal Information &amp; Interest Details
            </p>
            <button
              onClick={process}
              className="px-3 py-1.5 rounded text-xs font-bold"
              style={{ background: "#0aaed6", color: "#fff" }}
            >
              Process Selected
            </button>
          </div>
          <div className="overflow-x-auto">
            <table
              className="w-full text-xs"
              style={{ minWidth: 820, borderCollapse: "collapse" }}
            >
              <thead>
                <tr style={{ background: "#b3d9e5", color: "#142238" }}>
                  {[
                    "Deal Id",
                    "Deal Name",
                    "ROI",
                    "Principal Amount",
                    "Next Payment",
                    "Deduct Principal",
                    "Deduct Interest",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-2 py-2 text-left font-extrabold whitespace-nowrap"
                      style={{ border: "1px solid #111" }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {dealsLoading && (
                  <tr>
                    <td colSpan={7} className="p-8 text-center">
                      Loading deals…
                    </td>
                  </tr>
                )}
                {!dealsLoading && !deals.length && (
                  <tr>
                    <td colSpan={7} className="p-8 text-center">
                      No running deals found
                    </td>
                  </tr>
                )}
                {!dealsLoading &&
                  deals.map((d, i) => {
                    const id = d.dealId ?? d.id ?? String(i);
                    return (
                      <tr key={id}>
                        <td
                          className="px-2 py-2"
                          style={{ border: "1px solid #111" }}
                        >
                          {id}
                        </td>
                        <td
                          className="px-2 py-2"
                          style={{ border: "1px solid #111" }}
                        >
                          {d.dealName ?? d.propertyName ?? "—"}
                        </td>
                        <td
                          className="px-2 py-2"
                          style={{ border: "1px solid #111" }}
                        >
                          {d.roi ?? d.rateOfInterest ?? "—"}%
                        </td>
                        <td
                          className="px-2 py-2"
                          style={{ border: "1px solid #111" }}
                        >
                          ₹{money(principal(d))}
                        </td>
                        <td
                          className="px-2 py-2"
                          style={{ border: "1px solid #111" }}
                        >
                          {nextPayments[id] ? (
                            <span className="whitespace-nowrap">
                              {date(nextPayments[id].actualInterestDate ?? nextPayments[id].interestDate)}
                              <br />
                              <strong>₹{money(nextPayments[id].interestAmount ?? nextPayments[id].amount)}</strong>
                            </span>
                          ) : (
                            date(d.nextPaymentDate ?? d.nextInterestDate ?? d.firstInterestDate)
                          )}
                        </td>
                        <td
                          className="px-2 py-2 text-center"
                          style={{ border: "1px solid #111" }}
                        >
                          <input
                            type="checkbox"
                            checked={principalIds.has(id)}
                            onChange={() => toggle(id, "principal")}
                          />
                        </td>
                        <td
                          className="px-2 py-2 text-center"
                          style={{ border: "1px solid #111" }}
                        >
                          <input
                            type="checkbox"
                            checked={interestIds.has(id)}
                            onChange={() => toggle(id, "interest")}
                          />
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
          {/* {deals.map((d) => (
            <div
              key={`interest-${d.dealId}`}
              className="rounded p-3"
              style={{ background: "#fafcfc", border: "1px solid #c4cdd2" }}
            >
              <p
                className="text-xs font-bold mb-2"
                style={{ color: "#2673bb" }}
              >
                {d.dealName ?? d.propertyName ?? d.dealId} — unpaid/upcoming
                payment
              </p>
              <InterestDetails deal={d} userId={selectedHold.userId} />
            </div>
          ))} */}
        </div>
      )}
    </div>
  );
}
