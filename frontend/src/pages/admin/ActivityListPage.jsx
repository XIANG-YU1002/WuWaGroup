import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { endAdminActivity, getAdminActivities, reopenAdminActivity } from "../../api/adminActivities.js";
import { resolveMediaUrl } from "../../api/client.js";
import { useAuth } from "../../context/AuthContext.jsx";
import Button from "../../components/common/Button.jsx";
import ConfirmModal from "../../components/common/ConfirmModal.jsx";
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

export default function ActivityListPage() {
  const { token } = useAuth();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState(searchParams.get("status") ?? "");
  const [keyword, setKeyword] = useState("");
  const [keywordInput, setKeywordInput] = useState("");
  const [page, setPage] = useState(1);
  const [activities, setActivities] = useState(null);
  const [pagination, setPagination] = useState(null);
  const [error, setError] = useState(false);
  const [endTarget, setEndTarget] = useState(null);
  const [busy, setBusy] = useState(false);

  function load() {
    setError(false);
    setActivities(null);
    getAdminActivities(token, { status: status || undefined, keyword: keyword || undefined, page })
      .then((response) => {
        setActivities(response.data);
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
    <>
      <div className="group-buy-card-row">
        <h1>活動管理</h1>
        <Link className="btn btn-primary" to="/admin/activities/new">
          + 新增活動
        </Link>
      </div>

      <div className="group-buy-card-row" style={{ margin: "1rem 0" }}>
        <form className="search-input" style={{ maxWidth: "320px" }} onSubmit={handleSearchSubmit}>
          <input
            type="search"
            placeholder="搜尋活動名稱"
            value={keywordInput}
            onChange={(event) => setKeywordInput(event.target.value)}
          />
          <button type="submit">搜尋</button>
        </form>
        <select
          value={status}
          onChange={(event) => {
            setStatus(event.target.value);
            setPage(1);
          }}
        >
          <option value="">全部狀態</option>
          <option value="open">進行中</option>
          <option value="ended">已結束</option>
        </select>
      </div>

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
                  <th>狀態</th>
                  <th>建立時間</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {activities.map((activity) => (
                  <tr key={activity.id}>
                    <td>
                      <img
                        src={resolveMediaUrl(activity.image_url)}
                        alt=""
                        style={{ width: "3.5rem", height: "2rem", objectFit: "cover", borderRadius: "var(--radius)" }}
                      />
                    </td>
                    <td>{activity.name}</td>
                    <td>
                      <StatusBadge domain="activity" value={activity.status} />
                    </td>
                    <td>{formatDateTime(activity.created_at)}</td>
                    <td>
                      <div className="group-buy-card-row" style={{ flexWrap: "nowrap" }}>
                        <Link className="btn btn-secondary" to={`/admin/activities/${activity.id}`}>
                          編輯
                        </Link>
                        <Link className="btn btn-secondary" to={`/activities/${activity.id}`}>
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
          <Pagination page={pagination.page} totalPages={pagination.total_pages} onPageChange={setPage} />
        </>
      )}

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
    </>
  );
}
