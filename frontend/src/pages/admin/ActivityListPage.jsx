import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { endAdminActivity, getAdminActivities, reopenAdminActivity } from "../../api/adminActivities.js";
import MediaImage from "../../components/common/MediaImage.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import Button from "../../components/common/Button.jsx";
import ConfirmModal from "../../components/common/ConfirmModal.jsx";
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

export default function ActivityListPage() {
  const { token } = useAuth();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState(searchParams.get("status") ?? "");
  const [keyword, setKeyword] = useState("");
  const [keywordInput, setKeywordInput] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [activities, setActivities] = useState(null);
  const [pagination, setPagination] = useState(null);
  const [error, setError] = useState(false);
  const [endTarget, setEndTarget] = useState(null);
  const [busy, setBusy] = useState(false);

  function load() {
    setError(false);
    setActivities(null);
    getAdminActivities(token, { status: status || undefined, keyword: keyword || undefined, page, pageSize })
      .then((response) => {
        setActivities(response.data);
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

  async function handleEnd() {
    setBusy(true);
    try {
      await endAdminActivity(endTarget, token);
      setEndTarget(null);
      load();
    } finally {
      setBusy(false);
    }
  }

  async function handleReopen(activityId) {
    setBusy(true);
    try {
      await reopenAdminActivity(activityId, token);
      load();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="admin-page">
      <div className="page-header">
        <h1>活動管理</h1>
      </div>

      <div className="admin-toolbar">
        <form className="search-input admin-toolbar-search" onSubmit={handleSearchSubmit} role="search">
          <input
            type="search"
            placeholder="搜尋活動名稱"
            value={keywordInput}
            onChange={(event) => setKeywordInput(event.target.value)}
            aria-label="搜尋活動名稱"
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
          <option value="">全部狀態</option>
          <option value="open">進行中</option>
          <option value="ended">已結束</option>
        </select>
        <Link className="btn btn-primary admin-toolbar-action" to="/admin/activities/new">
          + 新增活動
        </Link>
      </div>

      <div className="admin-panel">
      {error ? (
        <ErrorState onRetry={load} />
      ) : activities === null ? (
        <PageLoader />
      ) : activities.length === 0 ? (
        <EmptyState title="目前沒有活動。" />
      ) : (
        <>
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>活動封面</th>
                  <th>活動名稱</th>
                  <th>商品數量</th>
                  <th>狀態</th>
                  <th>建立時間</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {activities.map((activity) => (
                  <tr key={activity.id}>
                    <td>
                      <MediaImage
                        src={activity.image_url}
                        alt=""
                        style={{ width: "5rem", height: "3rem", objectFit: "cover", borderRadius: "var(--radius)" }}
                      />
                    </td>
                    <td>{activity.name}</td>
                    <td>{activity.product_count ?? 0}</td>
                    <td>
                      <StatusBadge domain="activity" value={activity.status} />
                    </td>
                    <td>{formatDateTime(activity.created_at)}</td>
                    <td>
                      <div className="row-actions">
                        <Link className="btn btn-secondary" to={`/admin/activities/${activity.id}`}>
                          編輯
                        </Link>
                        <Link className="btn btn-secondary" to={`/admin/products?activity_id=${activity.id}`}>
                          查看商品
                        </Link>
                        {activity.status === "open" ? (
                          <Button variant="danger" onClick={() => setEndTarget(activity.id)}>
                            結束活動
                          </Button>
                        ) : (
                          <Button variant="secondary" loading={busy} onClick={() => handleReopen(activity.id)}>
                            重新開啟
                          </Button>
                        )}
                      </div>
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

      {endTarget && (
        <ConfirmModal
          title="結束活動"
          message="結束後將無法在此活動下建立新開團，既有開團不受影響。確定要結束此活動嗎？"
          confirmLabel="確定結束"
          danger
          loading={busy}
          onCancel={() => setEndTarget(null)}
          onConfirm={handleEnd}
        />
      )}
    </div>
  );
}
