import { useEffect, useState, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { formatINR } from "../../../utils/currency";
import { getAdminDeals } from "../../../api/afterlogin-admin";
import { Section, TableShell, TableHead, StatCard, icons } from "../AdminStats";

const ArrowLeftIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-4 h-4"
  >
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12 19 5 12 12 5" />
  </svg>
);

const SearchIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-4 h-4"
  >
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

export default function OfflineRunningDeals() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Extract category type from search params: 'sdlot' | 'gold' | 'asset'
  const categoryType = searchParams.get("type") || "sdlot";

  const [runningDeals, setRunningDeals] = useState([]);
  const [closedDeals, setClosedDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search and pagination states
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [statusFilter, setStatusFilter] = useState("all"); // "all" | "running" | "closed"

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);
        
        const [runningRes, closedRes] = await Promise.all([
          getAdminDeals("NORMAL").catch(() => ({})),
          getAdminDeals("closed").catch(() => ({}))
        ]);

        const getDealsList = (res) => {
          return res?.listOfLendersInformation ?? (Array.isArray(res) ? res : []);
        };

        setRunningDeals(getDealsList(runningRes));
        setClosedDeals(getDealsList(closedRes));
      } catch (err) {
        console.error("Failed to fetch Offline deals:", err);
        setError("Failed to load Offline deals data.");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Reset page number on search, status filter, or category tab change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, categoryType]);

  // Combine and label deals with status
  const allDeals = useMemo(() => {
    const running = runningDeals.map(d => ({ ...d, status: "Running" }));
    const closed = closedDeals.map(d => ({ ...d, status: "Closed" }));
    return [...running, ...closed];
  }, [runningDeals, closedDeals]);

  // Categorized deals helper
  const isCategoryMatch = (deal, cat) => {
    const type = (deal.globalDealType || "").toUpperCase();
    if (cat === "asset") return type === "ASSET";
    if (cat === "gold") return type === "GOLD" || type === "REALGOLD";
    // sdlot by default
    return type === "SDLOT" || (type !== "ASSET" && type !== "GOLD" && type !== "REALGOLD");
  };

  // Filter deals based on category tab, search term, and running/closed status
  const filteredDeals = useMemo(() => {
    return allDeals.filter(deal => {
      // 1. Category check
      if (!isCategoryMatch(deal, categoryType)) return false;

      // 2. Search check
      const name = (deal.dealName || "").toLowerCase();
      const id = String(deal.dealId || deal.id || "");
      const matchesSearch = name.includes(searchTerm.toLowerCase()) || id.includes(searchTerm);

      if (!matchesSearch) return false;

      // 3. Status filter check
      if (statusFilter === "running") return deal.status === "Running";
      if (statusFilter === "closed") return deal.status === "Closed";

      return true;
    });
  }, [allDeals, categoryType, searchTerm, statusFilter]);

  // Compute aggregate stats for current category
  const stats = useMemo(() => {
    const categoryDeals = allDeals.filter(d => isCategoryMatch(d, categoryType));
    let totalValue = 0;
    let totalInvested = 0;
    let runningCount = 0;
    let closedCount = 0;

    categoryDeals.forEach(d => {
      totalValue += Number(d.dealValue || d.dealAmount) || 0;
      totalInvested += Number(d.totalParticipationAmount || d.dealParticipationValue) || 0;
      if (d.status === "Running") runningCount++;
      else if (d.status === "Closed") closedCount++;
    });

    return {
      totalDeals: categoryDeals.length,
      totalValue,
      totalInvested,
      runningCount,
      closedCount
    };
  }, [allDeals, categoryType]);

  // Pagination calculations
  const totalItems = filteredDeals.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  // Guard page range
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  const paginatedDeals = useMemo(() => {
    return filteredDeals.slice(startIndex, startIndex + pageSize);
  }, [filteredDeals, startIndex, pageSize]);

  // Generate pagination page buttons
  const pageNumbers = useMemo(() => {
    const pages = [];
    const maxPageButtons = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxPageButtons / 2));
    let endPage = startPage + maxPageButtons - 1;

    if (endPage > totalPages) {
      endPage = totalPages;
      startPage = Math.max(1, endPage - maxPageButtons + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  }, [currentPage, totalPages]);

  // Quick switch tab
  const setCategory = (cat) => {
    setSearchParams({ type: cat });
  };

  if (loading) {
    return (
      <div className="grid gap-7">
        <div className="rounded-2xl p-6" style={{ background: "var(--card-bg)", border: "1px solid var(--border)" }}>
          <div className="flex items-center justify-center py-8">
            <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
            <span className="ml-3 text-sm" style={{ color: "var(--text-muted)" }}>Loading Offline deals data...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="grid gap-7">
        <div className="rounded-2xl p-6" style={{ background: "var(--card-bg)", border: "1px solid var(--border)" }}>
          <p className="text-center text-red-500 font-medium">{error}</p>
          <div className="flex justify-center mt-4">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white bg-purple-600 hover:bg-purple-700 transition-colors"
            >
              <ArrowLeftIcon /> Back to Funds Raised
            </button>
          </div>
        </div>
      </div>
    );
  }

  const categoryLabels = {
    sdlot: "SD Lot",
    gold: "Gold",
    asset: "Asset"
  };

  return (
    <div className="grid gap-7">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/admin/stats/funds-raised")}
            className="w-10 h-10 rounded-xl flex items-center justify-center transition-colors hover:bg-neutral-500/10"
            style={{
              background: "var(--card-bg)",
              border: "1px solid var(--border)",
              color: "var(--text-primary)"
            }}
            title="Back to Funds Raised"
          >
            <ArrowLeftIcon />
          </button>
          <div>
            <p className="text-xs uppercase tracking-widest font-bold" style={{ color: "#a855f7" }}>
              Stats / Platform Deal Summary
            </p>
            <h1 className="text-2xl font-black mt-1" style={{ color: "var(--text-primary)" }}>
              Offline {categoryLabels[categoryType]} Deals
            </h1>
          </div>
        </div>

        {/* Category switcher tabs */}
        <div className="flex items-center gap-2 bg-neutral-500/5 p-1 rounded-2xl border" style={{ borderColor: "var(--border)" }}>
          {Object.entries(categoryLabels).map(([cat, label]) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className="px-4 py-2 rounded-xl text-xs font-black transition-all"
              style={{
                background: categoryType === cat ? "rgba(168,85,247,0.18)" : "transparent",
                color: categoryType === cat ? "#c084fc" : "var(--text-muted)"
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Aggregate Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label={`Total ${categoryLabels[categoryType]} Deals`}
          value={stats.totalDeals.toLocaleString("en-IN")}
          sub={`Running & closed ${categoryLabels[categoryType]} deals`}
          color="#6366f1"
          Icon={icons.Deal}
        />
        <StatCard
          label="Total Deal Value"
          value={formatINR(stats.totalValue)}
          sub="Sum of value / cap limits"
          color="#f59e0b"
          Icon={icons.Rupee}
        />
        <StatCard
          label="Total Invested Amount"
          value={formatINR(stats.totalInvested)}
          sub="Lender investments"
          color="#a855f7"
          Icon={icons.Chart}
        />
        <StatCard
          label="Running Deals Count"
          value={stats.runningCount.toLocaleString("en-IN")}
          sub="Active live deals"
          color="#10b981"
          Icon={icons.Deal}
        />
      </div>

      {/* Search and Filters */}
      <div
        className="rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4"
        style={{ background: "var(--card-bg)", border: "1px solid var(--border)" }}
      >
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none" style={{ color: "var(--text-muted)" }}>
            <SearchIcon />
          </span>
          <input
            type="text"
            className="w-full pl-10 pr-4 py-2 text-sm rounded-xl outline-none transition-colors border"
            style={{
              background: "var(--surface)",
              borderColor: "var(--border)",
              color: "var(--text-primary)"
            }}
            placeholder={`Search ${categoryLabels[categoryType]} deals by name/ID...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Page Size & Status Filters */}
        <div className="flex items-center gap-3 flex-wrap self-start md:self-auto">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold" style={{ color: "var(--text-muted)" }}>Rows:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="text-xs px-2.5 py-1.5 rounded-xl border outline-none font-bold cursor-pointer transition-colors"
              style={{
                background: "var(--surface)",
                borderColor: "var(--border)",
                color: "var(--text-primary)"
              }}
            >
              {[5, 10, 20, 50, 100].map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            {[
              { id: "all", label: "All Status" },
              { id: "running", label: "Running" },
              { id: "closed", label: "Closed" }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className="px-4 py-1.5 rounded-xl text-xs font-bold transition-all border"
                style={{
                  background: statusFilter === tab.id ? "rgba(168,85,247,0.15)" : "transparent",
                  borderColor: statusFilter === tab.id ? "rgba(168,85,247,0.4)" : "var(--border)",
                  color: statusFilter === tab.id ? "#c084fc" : "var(--text-muted)"
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table Section */}
      <Section
        title={`Offline ${categoryLabels[categoryType]} Deals list`}
        subtitle={`Showing ${totalItems > 0 ? startIndex + 1 : 0} to ${endIndex} of ${totalItems} deals`}
      >
        <TableShell>
          <table className="w-full text-sm">
            <TableHead
              columns={[
                "Deal ID",
                "Deal Name",
                "Deal Value",
                "Invested Amount",
                "Remaining Value",
                "Interest Rate",
                "Status"
              ]}
            />
            <tbody>
              {paginatedDeals.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center" style={{ color: "var(--text-muted)" }}>
                    No deals found matching the search or filter criteria.
                  </td>
                </tr>
              ) : (
                paginatedDeals.map((deal, idx) => (
                  <tr
                    key={deal.dealId || deal.id}
                    style={{ borderBottom: idx === paginatedDeals.length - 1 ? "none" : "1px solid var(--border)" }}
                    className="transition-colors hover:bg-neutral-500/5"
                  >
                    <td className="py-3.5 px-4 font-mono font-bold" style={{ color: "var(--text-primary)" }}>
                      {deal.dealId || deal.id}
                    </td>
                    <td className="py-3.5 px-4 font-bold" style={{ color: "var(--text-primary)" }}>
                      {deal.dealName || "—"}
                    </td>
                    <td className="py-3.5 px-4 font-semibold font-mono" style={{ color: "var(--text-muted)" }}>
                      {formatINR(deal.dealValue || deal.dealAmount)}
                    </td>
                    <td className="py-3.5 px-4 font-semibold font-mono text-purple-500">
                      {formatINR(deal.totalParticipationAmount || deal.dealParticipationValue)}
                    </td>
                    <td className="py-3.5 px-4 font-semibold font-mono text-amber-500">
                      {formatINR(deal.remainingDealValue || deal.currentDealValue)}
                    </td>
                    <td className="py-3.5 px-4 font-semibold font-mono text-emerald-500">
                      {deal.rateofinterest ?? deal.monthlyInterest ?? 0}%
                    </td>
                    <td className="py-3.5 px-4 font-bold">
                      <span
                        className="px-2.5 py-1 rounded-full text-xs font-semibold"
                        style={{
                          background: deal.status === "Running" ? "rgba(16,185,129,0.12)" : "rgba(107,114,128,0.12)",
                          color: deal.status === "Running" ? "#10b981" : "#9ca3af"
                        }}
                      >
                        {deal.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </TableShell>

        {/* Pagination */}
        {totalItems > 0 && (
          <div
            className="rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 mt-4"
            style={{ background: "var(--card-bg)", border: "1px solid var(--border)" }}
          >
            <div className="text-xs font-semibold" style={{ color: "var(--text-muted)" }}>
              Showing <span style={{ color: "var(--text-primary)" }}>{startIndex + 1}</span> to{" "}
              <span style={{ color: "var(--text-primary)" }}>{endIndex}</span> of{" "}
              <span style={{ color: "var(--text-primary)" }}>{totalItems}</span> entries
            </div>

            <div className="flex items-center gap-1 flex-wrap">
              <button
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-all border disabled:opacity-40 disabled:cursor-not-allowed hover:bg-neutral-500/10"
                style={{
                  background: "var(--surface)",
                  borderColor: "var(--border)",
                  color: "var(--text-primary)"
                }}
              >
                &laquo;
              </button>

              <button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-all border disabled:opacity-40 disabled:cursor-not-allowed hover:bg-neutral-500/10"
                style={{
                  background: "var(--surface)",
                  borderColor: "var(--border)",
                  color: "var(--text-primary)"
                }}
              >
                &lsaquo;
              </button>

              {pageNumbers.map((p) => (
                <button
                  key={p}
                  onClick={() => setCurrentPage(p)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-all border hover:bg-neutral-500/10"
                  style={{
                    background: currentPage === p ? "rgba(168,85,247,0.18)" : "var(--surface)",
                    borderColor: currentPage === p ? "rgba(168,85,247,0.4)" : "var(--border)",
                    color: currentPage === p ? "#c084fc" : "var(--text-primary)"
                  }}
                >
                  {p}
                </button>
              ))}

              <button
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-all border disabled:opacity-40 disabled:cursor-not-allowed hover:bg-neutral-500/10"
                style={{
                  background: "var(--surface)",
                  borderColor: "var(--border)",
                  color: "var(--text-primary)"
                }}
              >
                &rsaquo;
              </button>

              <button
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-all border disabled:opacity-40 disabled:cursor-not-allowed hover:bg-neutral-500/10"
                style={{
                  background: "var(--surface)",
                  borderColor: "var(--border)",
                  color: "var(--text-primary)"
                }}
              >
                &raquo;
              </button>
            </div>
          </div>
        )}
      </Section>
    </div>
  );
}
