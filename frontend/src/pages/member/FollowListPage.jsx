import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  clearFollowList,
  getFollowList,
  removeFollowListItem,
  updateFollowListItemQuantity,
} from "../../api/followList.js";
import MediaImage from "../../components/common/MediaImage.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import Alert from "../../components/common/Alert.jsx";
import Button from "../../components/common/Button.jsx";
import ConfirmModal from "../../components/common/ConfirmModal.jsx";
import EmptyState from "../../components/common/EmptyState.jsx";
import ErrorState from "../../components/common/ErrorState.jsx";
import PageLoader from "../../components/common/PageLoader.jsx";

const PAYMENT_METHOD_LABELS = {
  bank_transfer: "銀行匯款",
  cash_on_delivery: "貨到付款／取貨付款",
  other: "其他",
};
const CONTACT_PLATFORM_LABELS = { facebook: "Facebook", discord: "Discord", line: "LINE" };

function formatDeadline(isoString) {
  return new Date(isoString).toLocaleString("zh-TW", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Taipei",
  });
}

export default function FollowListPage() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [followList, setFollowList] = useState(undefined);
  const [error, setError] = useState(false);
  const [busyItemId, setBusyItemId] = useState(null);
  const [confirmClear, setConfirmClear] = useState(false);
  const [clearing, setClearing] = useState(false);

  function load() {
    setError(false);
    setFollowList(undefined);
    getFollowList(token)
      .then((response) => setFollowList(response.data))
      .catch(() => setError(true));
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleQuantityChange(item, quantity) {
    if (quantity < 1) return;
    setBusyItemId(item.id);
    try {
      await updateFollowListItemQuantity(item.id, quantity, token);
      load();
    } finally {
      setBusyItemId(null);
    }
  }

  async function handleRemove(item) {
    setBusyItemId(item.id);
    try {
      await removeFollowListItem(item.id, token);
      load();
    } finally {
      setBusyItemId(null);
    }
  }

  async function handleClear() {
    setClearing(true);
    try {
      await clearFollowList(token);
      setConfirmClear(false);
      load();
    } finally {
      setClearing(false);
    }
  }

  if (error) {
    return <ErrorState onRetry={load} />;
  }

  if (followList === undefined) {
    return <PageLoader />;
  }

  if (followList === null || followList.items.length === 0) {
    return (
      <>
        <div className="page-header">
          <h1>跟團清單</h1>
        </div>
        <EmptyState
          title="您的跟團清單目前是空的。"
          description="瀏覽商品並加入跟團清單後，即可在此送出訂單。"
          action={
            <Link className="btn btn-primary" to="/">
              繼續挑選商品
            </Link>
          }
        />
      </>
    );
  }

  const { group_buy: groupBuy } = followList;

  return (
    <>
      <div className="page-header">
        <h1>跟團清單</h1>
        <p className="helper-text">確認你想跟團的商品與數量，送出後才會正式建立訂單。</p>
      </div>

      {!followList.is_submittable && followList.invalid_reasons.length > 0 && (
        <Alert type="error">{followList.invalid_reasons.join("；")}</Alert>
      )}

      <div className="checkout-layout">
        <div>
          <div className="group-buy-card">
            <div className="group-buy-card-row">
              <Link to={`/group-leaders/${groupBuy.group_leader.id}`}>
                {groupBuy.group_leader.display_name}
              </Link>
              <Link to={`/group-buys/${groupBuy.id}`}>查看團規</Link>
            </div>
            <dl className="detail-list">
              <dt>活動</dt>
              <dd>{groupBuy.activity.name}</dd>
              <dt>付款方式</dt>
              <dd>
                {PAYMENT_METHOD_LABELS[groupBuy.payment_method]}
                {groupBuy.payment_method_note ? `（${groupBuy.payment_method_note}）` : ""}
              </dd>
              <dt>是否二補</dt>
              <dd>{groupBuy.requires_second_payment ? "需要" : "不需要"}</dd>
              <dt>是否含滿贈</dt>
              <dd>{groupBuy.includes_full_gift ? "含滿贈" : "不含滿贈"}</dd>
              <dt>收單期限</dt>
              <dd>{formatDeadline(groupBuy.deadline_at)}</dd>
              <dt>聯絡方式</dt>
              <dd>
                {CONTACT_PLATFORM_LABELS[groupBuy.contact_platform]}：{groupBuy.contact_value}
              </dd>
            </dl>
          </div>

          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>商品</th>
                  <th>單價 (TWD)</th>
                  <th>數量</th>
                  <th>小計</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {followList.items.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div className="group-buy-card-row">
                        <MediaImage
                          src={item.product.primary_image_url}
                          alt={item.product.name}
                          style={{ width: "3rem", height: "3rem", objectFit: "cover", borderRadius: "var(--radius)" }}
                        />
                        <Link to={`/products/${item.product.id}`}>{item.product.name}</Link>
                      </div>
                    </td>
                    <td>NT$ {item.unit_price}</td>
                    <td>
                      <div className="quantity-stepper">
                        <button
                          type="button"
                          disabled={busyItemId === item.id || item.quantity <= 1}
                          onClick={() => handleQuantityChange(item, item.quantity - 1)}
                        >
                          -
                        </button>
                        <span>{item.quantity}</span>
                        <button
                          type="button"
                          disabled={busyItemId === item.id}
                          onClick={() => handleQuantityChange(item, item.quantity + 1)}
                        >
                          +
                        </button>
                      </div>
                    </td>
                    <td>NT$ {item.estimated_subtotal}</td>
                    <td>
                      <button
                        type="button"
                        className="btn btn-ghost"
                        disabled={busyItemId === item.id}
                        onClick={() => handleRemove(item)}
                      >
                        刪除
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="helper-text" style={{ marginTop: "0.75rem" }}>
            送出後才會正式建立訂單，商品總額不含二補、國際運費與國內運費。
          </p>

          <div className="group-buy-card-row" style={{ marginTop: "1rem" }}>
            <Button variant="secondary" onClick={() => setConfirmClear(true)}>
              清空跟團清單
            </Button>
            <Link className="btn btn-secondary" to="/">
              繼續挑選商品
            </Link>
          </div>
        </div>

        <aside className="group-buy-card">
          <h2 className="section-title">清單摘要</h2>
          <dl className="detail-list">
            <dt>商品項目</dt>
            <dd>{followList.items.length} 項</dd>
            <dt>商品總額</dt>
            <dd style={{ fontWeight: 700, color: "var(--color-primary)" }}>
              NT$ {followList.estimated_product_total}
            </dd>
          </dl>
          <Button
            fullWidth
            disabled={!followList.is_submittable}
            onClick={() => navigate("/orders/confirm")}
          >
            前往確認訂單
          </Button>
        </aside>
      </div>

      {confirmClear && (
        <ConfirmModal
          title="清空跟團清單"
          message="確定要清空目前的跟團清單嗎？此操作無法復原。"
          confirmLabel="確定清空"
          danger
          loading={clearing}
          onCancel={() => setConfirmClear(false)}
          onConfirm={handleClear}
        />
      )}
    </>
  );
}
