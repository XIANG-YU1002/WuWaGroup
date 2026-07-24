import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { getGroupBuyAnnouncements, getGroupBuyDetail } from "../api/groupBuys.js";
import { addFollowListItem } from "../api/followList.js";
import { ApiError } from "../api/client.js";
import MediaImage from "../components/common/MediaImage.jsx";
import Alert from "../components/common/Alert.jsx";
import Breadcrumb from "../components/common/Breadcrumb.jsx";
import Button from "../components/common/Button.jsx";
import ConfirmModal from "../components/common/ConfirmModal.jsx";
import ErrorState from "../components/common/ErrorState.jsx";
import PageLoader from "../components/common/PageLoader.jsx";
import StatusBadge from "../components/common/StatusBadge.jsx";
import { useAuth } from "../context/AuthContext.jsx";

const CONTACT_PLATFORM_LABELS = { facebook: "Facebook", discord: "Discord", line: "LINE" };
const PAYMENT_METHOD_LABELS = {
  bank_transfer: "銀行匯款",
  cash_on_delivery: "貨到付款／取貨付款",
  other: "其他",
};
const UNAVAILABLE_REASON_LABELS = {
  closed: "此開團已結單",
  expired: "此開團已截止",
  activity_ended: "此活動已結束",
  full: "此開團已額滿",
};

function formatDeadline(isoString) {
  return new Date(isoString).toLocaleString("zh-TW", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Taipei",
  });
}

function AddToFollowListPanel({ product, groupBuy }) {
  const { isAuthenticated, token, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // 管理員全程在後台作業，前台僅供瀏覽；不提供加入跟團清單，避免產生無用資料。
  if (user?.permissions?.is_admin) {
    return null;
  }

  const [quantity, setQuantity] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [conflict, setConflict] = useState(null);

  const maxQuantity = Math.max(product.available_quantity, 1);

  async function submit(replaceExisting) {
    setSubmitting(true);
    setFeedback(null);
    try {
      await addFollowListItem(
        {
          group_buy_product_id: product.group_buy_product_id,
          quantity,
          replace_existing: replaceExisting,
        },
        token,
      );
      setFeedback({ type: "success", message: "已加入跟團清單。" });
      setConflict(null);
    } catch (err) {
      if (err instanceof ApiError && err.code === "FOLLOW_LIST_GROUP_BUY_CONFLICT") {
        setConflict(true);
      } else if (err instanceof ApiError && err.code === "INSUFFICIENT_AVAILABLE_QUANTITY") {
        setFeedback({ type: "error", message: "目前可接受數量不足，請調整數量後再送出。" });
      } else {
        setFeedback({ type: "error", message: "加入跟團清單時發生錯誤，請稍後再試。" });
      }
    } finally {
      setSubmitting(false);
    }
  }

  function handleAddClick() {
    if (!isAuthenticated) {
      navigate("/login", {
        state: { redirectPath: location.pathname + location.search, message: "請先登入後使用跟團清單功能。" },
      });
      return;
    }
    submit(false);
  }

  return (
    <aside className="group-buy-card">
      <h2 className="section-title">加入跟團清單</h2>

      <div className="group-buy-card-row">
        {product.product.primary_image_url && (
          <MediaImage
            className="card-image card-image-square"
            style={{ width: "4.5rem", height: "4.5rem", flexShrink: 0, borderRadius: "var(--radius)" }}
            src={product.product.primary_image_url}
            alt={product.product.name}
          />
        )}
        <div>
          <p style={{ fontWeight: 600, margin: 0 }}>{product.product.name}</p>
        </div>
      </div>

      <dl className="detail-list">
        <dt>選擇團主</dt>
        <dd>{groupBuy.group_leader.display_name}</dd>
        <dt>單價</dt>
        <dd>NT$ {product.unit_price}</dd>
      </dl>

      {feedback && <Alert type={feedback.type}>{feedback.message}</Alert>}

      {product.is_available ? (
        <>
          <div className="group-buy-card-row">
            <div className="quantity-stepper">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                disabled={quantity <= 1}
                aria-label="減少數量"
              >
                -
              </button>
              <span>{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.min(maxQuantity, q + 1))}
                disabled={quantity >= maxQuantity}
                aria-label="增加數量"
              >
                +
              </button>
            </div>
            <span className="helper-text">剩餘 {product.available_quantity} 個</span>
          </div>
          <Button fullWidth onClick={handleAddClick} loading={submitting}>
            加入跟團清單
          </Button>
        </>
      ) : (
        <>
          <Button fullWidth disabled>
            目前不可跟團
          </Button>
          <p className="helper-text">
            {UNAVAILABLE_REASON_LABELS[groupBuy.effective_status] ?? "目前不可跟團"}
          </p>
        </>
      )}

      <p style={{ marginTop: "1rem" }}>
        <Link to={`/products/${product.product.id}`}>返回商品頁</Link>
      </p>

      {conflict && (
        <ConfirmModal
          title="替換跟團清單"
          message="目前跟團清單屬於其他開團，確定要清空並改為加入此開團的商品嗎？"
          confirmLabel="確定替換"
          onCancel={() => setConflict(null)}
          onConfirm={() => submit(true)}
          loading={submitting}
        />
      )}
    </aside>
  );
}

export default function GroupBuyDetailPage() {
  const { groupBuyId } = useParams();
  const [searchParams] = useSearchParams();
  const featuredProductId = searchParams.get("product");

  const [groupBuy, setGroupBuy] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [error, setError] = useState(null);

  async function load() {
    setError(null);
    setGroupBuy(null);
    try {
      const [detailResponse, announcementsResponse] = await Promise.all([
        getGroupBuyDetail(groupBuyId),
        getGroupBuyAnnouncements(groupBuyId),
      ]);
      setGroupBuy(detailResponse.data);
      setAnnouncements(announcementsResponse.data);
    } catch (err) {
      setError(err);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupBuyId]);

  if (error) {
    if (error instanceof ApiError && error.status === 404) {
      return <ErrorState title="找不到此開團" description="開團不存在或已被移除。" />;
    }
    return <ErrorState onRetry={load} />;
  }

  if (!groupBuy) {
    return <PageLoader />;
  }

  const featuredProduct =
    groupBuy.products.find((item) => item.group_buy_product_id === featuredProductId) ??
    groupBuy.products[0];

  return (
    <>
      <Breadcrumb
        items={[
          { label: "首頁", to: "/" },
          { label: groupBuy.activity.name, to: `/activities/${groupBuy.activity.id}` },
          { label: featuredProduct.product.name, to: `/products/${featuredProduct.product.id}` },
          { label: "開團詳情" },
        ]}
      />

      <div className="checkout-layout">
        <div>
          <h1>{featuredProduct.product.name}</h1>

          <Alert type={groupBuy.is_available ? "success" : "info"}>
            {groupBuy.is_available ? "此開團目前仍可接受訂單。" : "此開團目前已停止接受新的訂單。"}
          </Alert>

          <dl className="detail-list">
            <dt>活動</dt>
            <dd>
              <Link to={`/activities/${groupBuy.activity.id}`}>{groupBuy.activity.name}</Link>
            </dd>

            <dt>團主</dt>
            <dd>
              <Link to={`/group-leaders/${groupBuy.group_leader.id}`}>
                {groupBuy.group_leader.display_name}
              </Link>
            </dd>

            <dt>狀態</dt>
            <dd>
              <StatusBadge domain="groupBuyEffective" value={groupBuy.effective_status} />
            </dd>

            <dt>付款方式</dt>
            <dd>
              {PAYMENT_METHOD_LABELS[groupBuy.payment_method]}
              {groupBuy.payment_method_note ? `（${groupBuy.payment_method_note}）` : ""}
            </dd>

            <dt>是否需要二補</dt>
            <dd>{groupBuy.requires_second_payment ? "需要" : "不需要"}</dd>

            <dt>是否包含滿贈</dt>
            <dd>{groupBuy.includes_full_gift ? "包含" : "不包含"}</dd>

            <dt>收單期限</dt>
            <dd>{formatDeadline(groupBuy.deadline_at)}</dd>

            <dt>主要聯絡方式</dt>
            <dd>
              {CONTACT_PLATFORM_LABELS[groupBuy.contact_platform]}：{groupBuy.contact_value}
            </dd>
          </dl>
        </div>

        <AddToFollowListPanel product={featuredProduct} groupBuy={groupBuy} />
      </div>

      {groupBuy.products.length > 1 && (
        <section className="section">
          <h2 className="section-title">此開團包含的其他商品</h2>
          <ul>
            {groupBuy.products
              .filter((item) => item.group_buy_product_id !== featuredProduct.group_buy_product_id)
              .map((item) => (
                <li key={item.group_buy_product_id}>
                  <Link to={`/group-buys/${groupBuy.id}?product=${item.group_buy_product_id}`}>
                    {item.product.name}
                  </Link>{" "}
                  — NT$ {item.unit_price}（剩餘 {item.available_quantity} 個）
                </li>
              ))}
          </ul>
        </section>
      )}

      <section className="section">
        <h2 className="section-title">團規</h2>
        <div className="rules-text">{groupBuy.rules}</div>
      </section>

      {announcements.length > 0 && (
        <section className="section">
          <h2 className="section-title">開團公告</h2>
          {announcements.map((announcement) => (
            <div key={announcement.id} className="group-buy-card">
              <h3>{announcement.title}</h3>
              <div className="rules-text">{announcement.content}</div>
            </div>
          ))}
        </section>
      )}
    </>
  );
}
