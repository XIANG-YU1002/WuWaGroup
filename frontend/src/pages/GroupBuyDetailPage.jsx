import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getGroupBuyAnnouncements, getGroupBuyDetail } from "../api/groupBuys.js";
import { ApiError } from "../api/client.js";
import Alert from "../components/common/Alert.jsx";
import Breadcrumb from "../components/common/Breadcrumb.jsx";
import ErrorState from "../components/common/ErrorState.jsx";
import PageLoader from "../components/common/PageLoader.jsx";
import StatusBadge from "../components/common/StatusBadge.jsx";

const CONTACT_PLATFORM_LABELS = { facebook: "Facebook", discord: "Discord", line: "LINE" };
const PAYMENT_METHOD_LABELS = {
  bank_transfer: "銀行匯款",
  cash_on_delivery: "貨到付款／取貨付款",
  other: "其他",
};

function formatDeadline(isoString) {
  return new Date(isoString).toLocaleString("zh-TW", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Taipei",
  });
}

export default function GroupBuyDetailPage() {
  const { groupBuyId } = useParams();
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

  return (
    <>
      <Breadcrumb
        items={[
          { label: "首頁", to: "/" },
          { label: groupBuy.activity.name, to: `/activities/${groupBuy.activity.id}` },
          { label: "開團詳情" },
        ]}
      />

      <h1>開團詳情</h1>

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

      <section className="section">
        <h2 className="section-title">商品</h2>
        <ul>
          {groupBuy.products.map((item) => (
            <li key={item.group_buy_product_id}>
              <Link to={`/products/${item.product.id}`}>{item.product.name}</Link> — NT${" "}
              {item.unit_price}（剩餘 {item.available_quantity} 個，僅供參考，實際以正式送單為準）
            </li>
          ))}
        </ul>
      </section>

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

      <Link to={`/products/${groupBuy.products[0]?.product.id}`}>返回商品</Link>
    </>
  );
}
