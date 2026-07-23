import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { getGroupLeaderOrders } from "../../api/groupLeaderOrders.js";
import { useAuth } from "../../context/AuthContext.jsx";
import EmptyState from "../../components/common/EmptyState.jsx";
import ErrorState from "../../components/common/ErrorState.jsx";
import PageLoader from "../../components/common/PageLoader.jsx";
import Pagination from "../../components/common/Pagination.jsx";
import StatusBadge from "../../components/common/StatusBadge.jsx";

const STATUS_TABS = [
  { value: undefined, label: "全部" },
  { value: "pending_confirmation", label: "待確認" },
  { value: "pending_payment", label: "待付款" },
  { value: "paid", label: "已付款" },
  { value: "shipped", label: "已出貨" },
  { value: "completed", label: "已完成" },
  { value: "rejected", label: "已拒絕" },
  { value: "cancelled", label: "已取消" },
];

function formatDateTime(isoString) {
  return new Date(isoString).toLocaleString("zh-TW", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Taipei",
  });
}

export default function OrderListPage() {
  const { token } = useAuth();
  const [searchParams] = useSearchParams();
  const groupBuyId = searchParams.get("group_buy_id") ?? undefined;
  const initialStatus = searchParams.get("status") ?? undefined;

  const [status, setStatus] = useState(initialStatus);
  const [keyword, setKeyword] = useState("");
  const [keywordInput, setKeywordInput] = useState("");
  const [page, setPage] = useState(1);
  const [orders, setOrders] = useState(null);
  const [pagination, setPagination] = useState(null);
  const [error, setError] = useState(false);

  function load() {
    setError(false);
    setOrders(null);
    getGroupLeaderOrders(token, { status, groupBuyId, keyword: keyword || undefined, page })
      .then((response) => {
        setOrders(response.data);
        setPagination(response.pagination);
      })
      .catch(() => setError(true));
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, groupBuyId, keyword, page]);

  function handleSearchSubmit(event) {
    event.preventDefault();
    setPage(1);
    setKeyword(keywordInput.trim());
  }

  return (
    <>
      <div className="page-header">
        <h1>訂單管理</h1>
        <p className="helper-text">查看與管理團購訂單狀態。</p>
        {groupBuyId && (
          <p className="helper-text">
            篩選中：僅顯示此開團的訂單 <Link to="/group-leader/orders">清除篩選</Link>
          </p>
        )}
      </div>

      <div className="group-buy-card-row" style={{ flexWrap: "wrap", marginBottom: "1rem" }}>
        {STATUS_TABS.map((tab) => (
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

      <form className="search-input" style={{ maxWidth: "360px", marginBottom: "1.5rem" }} onSubmit={handleSearchSubmit}>
        <input
          type="search"
          placeholder="搜尋訂單編號或會員名稱"
          value={keywordInput}
          onChange={(event) => setKeywordInput(event.target.value)}
        />
        <button type="submit">搜尋</button>
      </form>

      {error ? (
        <ErrorState onRetry={load} />
      ) : orders === null ? (
        <PageLoader />
      ) : orders.length === 0 ? (
        <EmptyState title="沒有符合的訂單。" />
      ) : (
        <>
          <p className="helper-text">共 {pagination.total_items} 筆訂單</p>
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>訂單編號</th>
                  <th>會員</th>
                  <th>活動</th>
                  <th>商品總額</th>
                  <th>訂單狀態</th>
                  <th>下單時間</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td>{order.order_number}</td>
                    <td>{order.member_nickname}</td>
                    <td>{order.activity_name}</td>
                    <td>NT$ {order.product_total_amount}</td>
                    <td>
                      <StatusBadge domain="order" value={order.status} />
                      {order.has_pending_cancellation && (
                        <span className="status-badge status-badge-danger" style={{ marginLeft: "0.35rem" }}>
                          取消申請中
                        </span>
                      )}
                    </td>
                    <td>{formatDateTime(order.created_at)}</td>
                    <td>
                      <Link className="btn btn-secondary" to={`/group-leader/orders/${order.id}`}>
                        查看詳情
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
