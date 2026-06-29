import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { formatINR } from "../../../utils/currency";
import { getAdminViewDealsWiseInfo } from "../../../api/afterlogin-admin";
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

export default function OxyLoansRunningDeals() {
  const navigate = useNavigate();
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Search, filter, and pagination states
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all"); // "all" | "running" | "closed"
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);
        const data = await getAdminViewDealsWiseInfo();
        setDeals(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to fetch AdminViewDealsWiseInfo:", err);
        setError("Failed to load OxyLoans deals data. Please try again later.");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Reset page to 1 on search or filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterType]);

  // Compute stats based on ALL deals loaded
  const stats = useMemo(() => {
    let totalDealsCount = deals.length;
    let totalDealValue = 0;
    let totalParticipation = 0;
    let totalRunning = 0;
    let totalClosed = 0;

    deals.forEach((d) => {
      totalDealValue += Number(d.dealValue) || 0;
      totalParticipation += Number(d.totalParticipationAmount) || 0;
      totalRunning += Number(d.runningAmount) || 0;
      totalClosed += Number(d.closedAmount) || 0;
    });

    return {
      totalDealsCount,
      totalDealValue,
      totalParticipation,
      totalRunning,
      totalClosed,
    };
  }, [deals]);

  // Filter & search logic
  const filteredDeals = useMemo(() => {
    return deals.filter((deal) => {
      const nameMatch = (deal.dealName || "").toLowerCase().includes(searchTerm.toLowerCase());
      const idMatch = String(deal.dealId || "").includes(searchTerm);
      
      const matchesSearch = nameMatch || idMatch;

      if (!matchesSearch) return false;

      if (filterType === "running") {
        return (Number(deal.runningAmount) || 0) > 0;
      }
      if (filterType === "closed") {
        return (Number(deal.closedAmount) || 0) > 0 && (Number(deal.runningAmount) || 0) === 0;
      }
      return true;
    });
  }, [deals, searchTerm, filterType]);

  // Pagination calculations
  const totalItems = filteredDeals.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  
  // Guard current page range
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

  // Generate pagination buttons
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

  if (loading) {
    return (
      <div className="grid gap-7">
        <div className="rounded-2xl p-6" style={{ background: "var(--card-bg)", border: "1px solid var(--border)" }}>
          <div className="flex items-center justify-center py-8">
            <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
            <span className="ml-3 text-sm" style={{ color: "var(--text-muted)" }}>Loading deals data...</span>
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

  return (
    <div className="grid gap-7">
      {/* Header Area */}
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
              OxyLoans Deal Wise Information
            </h1>
          </div>
        </div>
      </div>

      {/* Aggregate Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Deals"
          value={stats.totalDealsCount.toLocaleString("en-IN")}
          sub="Total deals listed on OxyLoans"
          color="#6366f1"
          Icon={icons.Deal}
        />
        <StatCard
          label="Total Deal Value"
          value={formatINR(stats.totalDealValue)}
          sub="Accumulated cap/target value"
          color="#f59e0b"
          Icon={icons.Rupee}
        />
        <StatCard
          label="Participation Amount"
          value={formatINR(stats.totalParticipation)}
          sub="Total amount lenders participated"
          color="#a855f7"
          Icon={icons.Chart}
        />
        <StatCard
          label="Running Amount"
          value={formatINR(stats.totalRunning)}
          sub="Total live/running amount"
          color="#10b981"
          Icon={icons.Rupee}
        />
      </div>

      {/* Search and Filters */}
      <div
        className="rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4"
        style={{ background: "var(--card-bg)", border: "1px solid var(--border)" }}
      >
        {/* Search Bar */}
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
            placeholder="Search deals by name or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Filter Badges and Page Size Select */}
        <div className="flex items-center gap-3 flex-wrap self-start md:self-auto">
          {/* Page Size Dropdown */}
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

          {/* <div className="flex items-center gap-2">
            {[
              { id: "all", label: "All Deals" },
              { id: "running", label: "Running" },
              { id: "closed", label: "Closed" }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilterType(tab.id)}
                className="px-4 py-1.5 rounded-xl text-xs font-bold transition-all border"
                style={{
                  background: filterType === tab.id ? "rgba(168,85,247,0.15)" : "transparent",
                  borderColor: filterType === tab.id ? "rgba(168,85,247,0.4)" : "var(--border)",
                  color: filterType === tab.id ? "#c084fc" : "var(--text-muted)"
                }}
              >
                {tab.label}
              </button>
            ))}
          </div> */}
        </div>
      </div>

      {/* Table Section */}
      <Section
        title="OxyLoans Deals List"
        subtitle={`Showing ${totalItems > 0 ? startIndex + 1 : 0} to ${endIndex} of ${totalItems} deals`}
      >
        <TableShell>
          <table className="w-full text-sm">
            <TableHead
              columns={[
                "Deal ID",
                "Deal Name",
                "Deal Value",
                "Participation Amount",
                "Running Amount",
                "Closed Amount",
                "Lenders (Total / Active / Closed)"
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
                    key={deal.dealId}
                    style={{ borderBottom: idx === paginatedDeals.length - 1 ? "none" : "1px solid var(--border)" }}
                    className="transition-colors hover:bg-neutral-500/5"
                  >
                    <td className="py-3.5 px-4 font-mono font-bold" style={{ color: "var(--text-primary)" }}>
                      {deal.dealId}
                    </td>
                    <td className="py-3.5 px-4 font-bold" style={{ color: "var(--text-primary)" }}>
                      {deal.dealName || "—"}
                    </td>
                    <td className="py-3.5 px-4 font-semibold font-mono" style={{ color: "var(--text-muted)" }}>
                      {formatINR(deal.dealValue)}
                    </td>
                    <td className="py-3.5 px-4 font-semibold font-mono text-purple-500">
                      {formatINR(deal.totalParticipationAmount)}
                    </td>
                    <td className="py-3.5 px-4 font-black font-mono text-emerald-500">
                      {formatINR(deal.runningAmount)}
                    </td>
                    <td className="py-3.5 px-4 font-semibold font-mono text-neutral-400">
                      {formatINR(deal.closedAmount)}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-center">
                      <div className="flex items-center gap-1.5 justify-center">
                        <span className="px-2 py-0.5 rounded text-xs" style={{ background: "rgba(99,102,241,0.12)", color: "#818cf8" }} title="Total Lenders">
                          {deal.totalUsers ?? 0}
                        </span>
                        <span className="text-neutral-500 text-xs">/</span>
                        <span className="px-2 py-0.5 rounded text-xs" style={{ background: "rgba(16,185,129,0.12)", color: "#34d399" }} title="Active Lenders">
                          {deal.currentUsers ?? 0}
                        </span>
                        <span className="text-neutral-500 text-xs">/</span>
                        <span className="px-2 py-0.5 rounded text-xs" style={{ background: "rgba(239,68,68,0.12)", color: "#f87171" }} title="Closed Lenders">
                          {deal.closedUsers ?? 0}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </TableShell>

        {/* Pagination Controls */}
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
              {/* First Page Button */}
              <button
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-all border disabled:opacity-40 disabled:cursor-not-allowed hover:bg-neutral-500/10"
                style={{
                  background: "var(--surface)",
                  borderColor: "var(--border)",
                  color: "var(--text-primary)"
                }}
                title="First Page"
              >
                &laquo;
              </button>

              {/* Prev Page Button */}
              <button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-all border disabled:opacity-40 disabled:cursor-not-allowed hover:bg-neutral-500/10"
                style={{
                  background: "var(--surface)",
                  borderColor: "var(--border)",
                  color: "var(--text-primary)"
                }}
                title="Previous Page"
              >
                &lsaquo;
              </button>

              {/* Page Numbers */}
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

              {/* Next Page Button */}
              <button
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-all border disabled:opacity-40 disabled:cursor-not-allowed hover:bg-neutral-500/10"
                style={{
                  background: "var(--surface)",
                  borderColor: "var(--border)",
                  color: "var(--text-primary)"
                }}
                title="Next Page"
              >
                &rsaquo;
              </button>

              {/* Last Page Button */}
              <button
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-all border disabled:opacity-40 disabled:cursor-not-allowed hover:bg-neutral-500/10"
                style={{
                  background: "var(--surface)",
                  borderColor: "var(--border)",
                  color: "var(--text-primary)"
                }}
                title="Last Page"
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
