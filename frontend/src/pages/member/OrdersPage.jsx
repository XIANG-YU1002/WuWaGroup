import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getMyOrders } from "../../api/orders.js";
import MediaImage from "../../components/common/MediaImage.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import EmptyState from "../../components/common/EmptyState.jsx";
import ErrorState from "../../components/common/ErrorState.jsx";
import PageLoader from "../../components/common/PageLoader.jsx";
import Pagination from "../../components/common/Pagination.jsx";
import StatusBadge from "../../components/common/StatusBadge.jsx";

const STATUS_TABS = [
  { value: undefined, label: "全部訂單" },
  { value: "pending_confirmation", label: "等待團主確認" },
  { value: "pending_payment", label: "等待付款" },
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

export default function OrdersPage() {
  const { token } = useAuth();
  const [status, setStatus] = useState(undefined);
  const [page, setPage] = useState(1);
  const [orders, setOrders] = useState(null);
  const [pagination, setPagination] = useState(null);
  const [error, setError] = useState(false);

  function load() {
    setError(false);
    setOrders(null);
    getMyOrders(token, { status, page })
      .then((response) => {
        setOrders(response.data);
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
      <div className="page-header">
        <h1>我的訂單</h1>
        <p className="helper-text">查看您所有的訂單狀態與詳細資訊。</p>
      </div>

      <div className="group-buy-card-row" style={{ flexWrap: "wrap", marginBottom: "1.5rem" }}>
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

      {error ? (
        <ErrorState onRetry={load} />
      ) : orders === null ? (
        <PageLoader />
      ) : orders.length === 0 ? (
        <EmptyState title="目前沒有符合的訂單。" />
      ) : (
        <>
          <p className="helper-text">共 {pagination.total_items} 筆訂單</p>
          {orders.map((order) => (
            <div key={order.id} className="group-buy-card">
              <div className="group-buy-card-row">
                <MediaImage
                  src={order.representative_image_url}
                  alt=""
                  style={{ width: "3.5rem", height: "3.5rem", objectFit: "cover", borderRadius: "var(--radius)" }}
                />
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontWeight: 600 }}>{order.order_number}</p>
                  <p className="helper-text" style={{ margin: 0 }}>
                    {order.activity_name} ／ {order.group_leader_name} ／ {order.item_summary}
                  </p>
                </div>
                <StatusBadge domain="order" value={order.status} />
                <p style={{ margin: 0, fontWeight: 700 }}>NT$ {order.product_total_amount}</p>
                <p className="helper-text" style={{ margin: 0 }}>{formatDateTime(order.created_at)}</p>
                <Link className="btn btn-secondary" to={`/orders/${order.id}`}>
                  查看詳情
                </Link>
              </div>
            </div>
          ))}
          <Pagination page={pagination.page} totalPages={pagination.total_pages} onPageChange={setPage} />
        </>
      )}
    </>
  );
}
