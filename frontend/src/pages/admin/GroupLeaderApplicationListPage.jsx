import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAdminApplications } from "../../api/adminGroupLeaderApplications.js";
import { resolveMediaUrl } from "../../api/client.js";
import { useAuth } from "../../context/AuthContext.jsx";
import EmptyState from "../../components/common/EmptyState.jsx";
import ErrorState from "../../components/common/ErrorState.jsx";
import PageLoader from "../../components/common/PageLoader.jsx";
import ListFooter from "../../components/common/ListFooter.jsx";
import StatusBadge from "../../components/common/StatusBadge.jsx";
import { SearchIcon } from "../../components/common/icons.jsx";

function formatDateTime(isoString) {
  return new Date(isoString).toLocaleString("zh-TW", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Taipei",
  });
}

// 以申請 UUID 前 8 碼組成好讀的申請編號
function applicationCode(id) {
  return `#${id.replace(/-/g, "").slice(0, 8).toUpperCase()}`;
}

function contactSummary(user) {
  const items = [];
  if (user.line_contact) items.push(`LINE：${user.line_contact}`);
  if (user.facebook_contact) items.push(`FB：${user.facebook_contact}`);
  if (user.discord_contact) items.push(`Discord：${user.discord_contact}`);
  items.push(`Email：${user.email}`);
  return items;
}

export default function GroupLeaderApplicationListPage() {
  const { token } = useAuth();
  const [status, setStatus] = useState("pending");
  const [keyword, setKeyword] = useState("");
  const [keywordInput, setKeywordInput] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [applications, setApplications] = useState(null);
  const [pagination, setPagination] = useState(null);
  const [error, setError] = useState(false);

  function load() {
    setError(false);
    setApplications(null);
    getAdminApplications(token, { status: status || undefined, keyword: keyword || undefined, page, pageSize })
      .then((response) => {
        setApplications(response.data);
        setPagination(response.pagination);
      })
      .catch(() => setError(true));
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, keyword, page, pageSize]);

  function handleSearchSubmit(event) {
    event.preventDefault();
    setPage(1);
    setKeyword(keywordInput.trim());
  }

  return (
    <div className="admin-page">
      <div className="page-header">
        <h1>團主申請管理</h1>
      </div>

      <div className="admin-toolbar">
        <form className="search-input admin-toolbar-search" onSubmit={handleSearchSubmit} role="search">
          <input
            type="search"
            placeholder="搜尋會員暱稱或 Email"
            value={keywordInput}
            onChange={(event) => setKeywordInput(event.target.value)}
            aria-label="搜尋會員暱稱或 Email"
          />
          <button type="submit" className="search-input-icon-btn" aria-label="搜尋">
            <SearchIcon className="icon-search" />
          </button>
        </form>
        <select
          className="admin-toolbar-select"
          value={status}
          onChange={(event) => {
            setStatus(event.target.value);
            setPage(1);
          }}
          aria-label="狀態篩選"
        >
          <option value="pending">待審核</option>
          <option value="approved">已核准</option>
          <option value="rejected">已拒絕</option>
          <option value="">全部狀態</option>
        </select>
      </div>

      <div className="admin-panel">
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
                  <th>申請編號</th>
                  <th>會員暱稱</th>
                  <th>聯絡方式摘要</th>
                  <th>申請時間</th>
                  <th>狀態</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((application) => (
                  <tr key={application.id}>
                    <td>{applicationCode(application.id)}</td>
                    <td>
                      <span className="dash-applicant">
                        {application.user.avatar_url ? (
                          <img className="avatar-circle avatar-circle-sm" src={resolveMediaUrl(application.user.avatar_url)} alt="" />
                        ) : (
                          <span className="avatar-circle avatar-circle-sm" aria-hidden="true">
                            {application.user.nickname?.[0]?.toUpperCase() ?? "?"}
                          </span>
                        )}
                        {application.user.nickname}
                      </span>
                    </td>
                    <td>
                      <span className="contact-summary">
                        {contactSummary(application.user).map((line) => (
                          <span key={line}>{line}</span>
                        ))}
                      </span>
                    </td>
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
          <ListFooter
            pagination={pagination}
            onPageChange={setPage}
            pageSize={pageSize}
            onPageSizeChange={(n) => {
              setPageSize(n);
              setPage(1);
            }}
          />
        </>
      )}
      </div>
    </div>
  );
}
