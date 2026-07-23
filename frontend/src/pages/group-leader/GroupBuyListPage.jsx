import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getMyGroupBuys } from "../../api/groupLeaderGroupBuys.js";
import { useAuth } from "../../context/AuthContext.jsx";
import EmptyState from "../../components/common/EmptyState.jsx";
import ErrorState from "../../components/common/ErrorState.jsx";
import PageLoader from "../../components/common/PageLoader.jsx";
import Pagination from "../../components/common/Pagination.jsx";
import StatusBadge from "../../components/common/StatusBadge.jsx";

const TABS = [
  { value: undefined, label: "全部" },
  { value: "open", label: "進行中" },
  { value: "closed", label: "已結單" },
];

function formatDeadline(isoString) {
  return new Date(isoString).toLocaleString("zh-TW", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Taipei",
  });
}

export default function GroupBuyListPage() {
  const { token } = useAuth();
  const [status, setStatus] = useState(undefined);
  const [page, setPage] = useState(1);
  const [groupBuys, setGroupBuys] = useState(null);
  const [pagination, setPagination] = useState(null);
  const [error, setError] = useState(false);

  function load() {
    setError(false);
    setGroupBuys(null);
    getMyGroupBuys(token, { status, page })
      .then((response) => {
        setGroupBuys(response.data);
        setPagination(response.pagination);
      })
      .catch(() => setError(true));
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, page]);

  return (
    <>
      <div className="group-buy-card-row">
        <div>
          <h1>我的開團</h1>
          <p className="helper-text">管理目前進行中的開團與歷史開團紀錄。</p>
        </div>
        <Link className="btn btn-primary" to="/group-leader/group-buys/new">
          + 建立開團
        </Link>
      </div>

      <div className="group-buy-card-row" style={{ margin: "1.5rem 0" }}>
        {TABS.map((tab) => (
          <button
            key={tab.label}
            type="button"
            className={`btn ${status === tab.value ? "btn-primary" : "btn-secondary"}`}
            onClick={() => {
              setStatus(tab.value);
              setPage(1);
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {error ? (
        <ErrorState onRetry={load} />
      ) : groupBuys === null ? (
        <PageLoader />
      ) : groupBuys.length === 0 ? (
        <EmptyState title="目前沒有開團紀錄。" />
      ) : (
        <>
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>活動</th>
                  <th>收單時間</th>
                  <th>狀態</th>
                  <th>已有訂單</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {groupBuys.map((groupBuy) => (
                  <tr key={groupBuy.id}>
                    <td>{groupBuy.activity.name}</td>
                    <td>{formatDeadline(groupBuy.deadline_at)}</td>
                    <td>
                      <StatusBadge domain="groupBuyEffective" value={groupBuy.status === "open" ? "open" : "closed"} />
                    </td>
                    <td>{groupBuy.has_orders ? "是" : "否"}</td>
                    <td>
                      <div className="group-buy-card-row" style={{ flexWrap: "nowrap" }}>
                        <Link className="btn btn-secondary" to={`/group-buys/${groupBuy.id}`}>
                          查看
                        </Link>
                        <Link className="btn btn-secondary" to={`/group-leader/group-buys/${groupBuy.id}`}>
                          編輯
                        </Link>
                        <Link className="btn btn-secondary" to={`/group-leader/orders?group_buy_id=${groupBuy.id}`}>
                          查看訂單
                        </Link>
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
    </>
  );
}
