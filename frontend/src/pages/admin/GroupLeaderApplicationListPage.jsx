import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAdminApplications } from "../../api/adminGroupLeaderApplications.js";
import { useAuth } from "../../context/AuthContext.jsx";
import EmptyState from "../../components/common/EmptyState.jsx";
import ErrorState from "../../components/common/ErrorState.jsx";
import PageLoader from "../../components/common/PageLoader.jsx";
import Pagination from "../../components/common/Pagination.jsx";
import StatusBadge from "../../components/common/StatusBadge.jsx";

function formatDateTime(isoString) {
  return new Date(isoString).toLocaleString("zh-TW", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Taipei",
  });
}

export default function GroupLeaderApplicationListPage() {
  const { token } = useAuth();
  const [status, setStatus] = useState("pending");
  const [keyword, setKeyword] = useState("");
  const [keywordInput, setKeywordInput] = useState("");
  const [page, setPage] = useState(1);
  const [applications, setApplications] = useState(null);
  const [pagination, setPagination] = useState(null);
  const [error, setError] = useState(false);

  function load() {
    setError(false);
    setApplications(null);
    getAdminApplications(token, { status: status || undefined, keyword: keyword || undefined, page })
      .then((response) => {
        setApplications(response.data);
        setPagination(response.pagination);
      })
      .catch(() => setError(true));
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, keyword, page]);

  function handleSearchSubmit(event) {
    event.preventDefault();
    setPage(1);
    setKeyword(keywordInput.trim());
  }

  return (
    <>
      <div className="page-header">
        <h1>團主申請管理</h1>
      </div>

      <div className="group-buy-card-row" style={{ marginBottom: "1.5rem" }}>
        <form className="search-input" style={{ maxWidth: "320px" }} onSubmit={handleSearchSubmit}>
          <input
            type="search"
            placeholder="搜尋會員暱稱或 Email"
            value={keywordInput}
            onChange={(event) => setKeywordInput(event.target.value)}
          />
          <button type="submit">搜尋</button>
        </form>
        <select value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }}>
          <option value="pending">待審核</option>
          <option value="approved">已核准</option>
          <option value="rejected">已拒絕</option>
          <option value="">全部狀態</option>
        </select>
      </div>

      {error ? (
        <ErrorState onRetry={load} />
      ) : applications === null ? (
        <PageLoader />
      ) : applications.length === 0 ? (
        <EmptyState title="沒有符合的申請。" />
      ) : (
        <>
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>會員暱稱</th>
                  <th>Email</th>
                  <th>申請時間</th>
                  <th>狀態</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((application) => (
                  <tr key={application.id}>
                    <td>{application.user.nickname}</td>
                    <td>{application.user.email}</td>
                    <td>{formatDateTime(application.created_at)}</td>
                    <td>
                      <StatusBadge domain="application" value={application.status} />
                    </td>
                    <td>
                      <Link className="btn btn-secondary" to={`/admin/group-leader-applications/${application.id}`}>
                        查看審核
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination page={pagination.page} totalPages={pagination.total_pages} onPageChange={setPage} />
        </>
      )}
    </>
  );
}
