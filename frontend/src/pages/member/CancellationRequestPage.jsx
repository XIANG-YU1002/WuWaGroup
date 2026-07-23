import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { createCancellationRequest, getMyOrderDetail } from "../../api/orders.js";
import { useAuth } from "../../context/AuthContext.jsx";
import { ApiError } from "../../api/client.js";
import Alert from "../../components/common/Alert.jsx";
import Button from "../../components/common/Button.jsx";
import ErrorState from "../../components/common/ErrorState.jsx";
import PageLoader from "../../components/common/PageLoader.jsx";
import StatusBadge from "../../components/common/StatusBadge.jsx";

export default function CancellationRequestPage() {
  const { orderId } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [error, setError] = useState(false);
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  function load() {
    setError(false);
    setOrder(null);
    getMyOrderDetail(orderId, token)
      .then((response) => setOrder(response.data))
      .catch(() => setError(true));
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setSubmitError(null);
    try {
      await createCancellationRequest(orderId, reason.trim(), token);
      navigate(`/orders/${orderId}`, { replace: true });
    } catch (err) {
      setSubmitError(err instanceof ApiError ? err.message : "送出取消申請時發生錯誤，請稍後再試。");
    } finally {
      setSubmitting(false);
    }
  }

  if (error) {
    return <ErrorState onRetry={load} />;
  }

  if (!order) {
    return <PageLoader />;
  }

  return (
    <>
      <div className="page-header">
        <h1>申請取消訂單</h1>
        <p className="helper-text">取消申請送出後，訂單狀態不會立即變更，需等待團主處理。</p>
      </div>

      <div className="group-buy-card">
        <div className="group-buy-card-row">
          <span>訂單編號：{order.order_number}</span>
          <StatusBadge domain="order" value={order.status} />
        </div>
        {order.items.map((item) => (
          <div key={item.id} className="group-buy-card-row">
            <span>{item.product_name_snapshot}</span>
            <span>數量 {item.quantity}</span>
            <span>小計 NT$ {item.subtotal}</span>
          </div>
        ))}
        <p style={{ textAlign: "right", fontWeight: 700 }}>商品總額：NT$ {order.product_total_amount}</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-field">
          <label htmlFor="cancel-reason">取消原因（選填）</label>
          <textarea
            id="cancel-reason"
            rows={4}
            maxLength={300}
            placeholder="請輸入取消原因（選填，最多 300 字）"
            value={reason}
            onChange={(event) => setReason(event.target.value)}
          />
          <p className="helper-text" style={{ textAlign: "right" }}>{reason.length} / 300</p>
        </div>

        <Alert type="info">
          取消申請送出後，訂單狀態不會立即變更，需等待團主處理；若團主拒絕，且訂單仍符合申請條件，您可以再次提出申請。同一時間只能有一筆待處理的取消申請。
        </Alert>

        {submitError && <Alert type="error">{submitError}</Alert>}

        <div className="group-buy-card-row">
          <Link className="btn btn-secondary" to={`/orders/${orderId}`}>
            返回訂單詳情
          </Link>
          <Button type="submit" loading={submitting}>
            送出取消申請
          </Button>
        </div>
      </form>
    </>
  );
}
