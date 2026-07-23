import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  getGroupLeaderAnnouncements,
  getGroupLeaderGroupBuys,
  getGroupLeaderProfile,
} from "../api/groupLeaders.js";
import { getGroupBuyDetail } from "../api/groupBuys.js";
import { ApiError } from "../api/client.js";
import EmptyState from "../components/common/EmptyState.jsx";
import ErrorState from "../components/common/ErrorState.jsx";
import PageLoader from "../components/common/PageLoader.jsx";

const CONTACT_LINKS = [
  { key: "facebook", label: "Facebook" },
  { key: "discord", label: "Discord" },
  { key: "line", label: "LINE" },
];

function formatDate(isoString) {
  return new Date(isoString).toLocaleDateString("zh-TW", { timeZone: "Asia/Taipei" });
}

function formatDeadline(isoString) {
  return new Date(isoString).toLocaleString("zh-TW", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "Asia/Taipei",
  });
}

export default function GroupLeaderProfilePage() {
  const { groupLeaderId } = useParams();
  const [profile, setProfile] = useState(null);
  const [productCards, setProductCards] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [error, setError] = useState(null);

  async function load() {
    setError(null);
    setProfile(null);
    try {
      const [profileResponse, groupBuysResponse, announcementsResponse] = await Promise.all([
        getGroupLeaderProfile(groupLeaderId),
        getGroupLeaderGroupBuys(groupLeaderId, { status: "open" }),
        getGroupLeaderAnnouncements(groupLeaderId),
      ]);
      setProfile(profileResponse.data);
      setAnnouncements(announcementsResponse.data);

      const details = await Promise.all(
        groupBuysResponse.data.map((groupBuy) =>
          getGroupBuyDetail(groupBuy.id).then((response) => ({ groupBuy, detail: response.data })),
        ),
      );
      const cards = details.flatMap(({ groupBuy, detail }) =>
        detail.products.map((item) => ({
          groupBuyId: groupBuy.id,
          groupBuyProductId: item.group_buy_product_id,
          activityName: groupBuy.activity.name,
          deadlineAt: groupBuy.deadline_at,
          product: item.product,
          unitPrice: item.unit_price,
          availableQuantity: item.available_quantity,
          isAvailable: item.is_available,
        })),
      );
      setProductCards(cards);
    } catch (err) {
      setError(err);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupLeaderId]);

  if (error) {
    if (error instanceof ApiError && error.status === 404) {
      return (
        <ErrorState
          title="找不到此團主公開頁"
          description="此團主公開資料尚未完成，或頁面不存在。"
        />
      );
    }
    return <ErrorState onRetry={load} />;
  }

  if (!profile) {
    return <PageLoader />;
  }

  return (
    <>
      <div className="group-leader-banner">
        <div className="group-leader-banner-main">
          {profile.avatar_url ? (
            <img className="card-image-square" src={profile.avatar_url} alt="" />
          ) : (
            <div className="card-image-square avatar-circle" style={{ fontSize: "2rem" }} aria-hidden="true">
              {profile.display_name?.[0] ?? "?"}
            </div>
          )}
          <div>
            <h1 style={{ margin: "0 0 0.4rem" }}>{profile.display_name}</h1>
            {profile.introduction && <p style={{ margin: 0 }}>{profile.introduction}</p>}

            <div className="group-leader-stats">
              <span>加入日期 {formatDate(profile.created_at)}</span>
              <span>開團數 {profile.statistics.group_buy_count}</span>
              <span>已完成訂單 {profile.statistics.completed_order_count}</span>
            </div>

            <div className="group-leader-contacts">
              {CONTACT_LINKS.filter((contact) => profile.public_contacts[contact.key]).map(
                (contact) => (
                  <span key={contact.key} className="btn btn-secondary">
                    {contact.label}：{profile.public_contacts[contact.key]}
                  </span>
                ),
              )}
            </div>
          </div>
        </div>

        {profile.default_rules && (
          <div className="group-leader-rules-card">
            <h2 className="section-title">預設團規</h2>
            <div className="rules-text">{profile.default_rules}</div>
            <p className="helper-text" style={{ marginTop: "0.75rem" }}>
              此為團主平常的開團習慣，各開團的正式團規仍以該開團詳情頁與訂單快照為準。
            </p>
          </div>
        )}
      </div>

      <section className="section">
        <h2 className="section-title">目前開團</h2>
        {productCards.length === 0 ? (
          <EmptyState title="目前沒有進行中的開團。" />
        ) : (
          <div className="grid">
            {productCards.map((card) => (
              <div key={card.groupBuyProductId} className="card">
                <img
                  className="card-image card-image-square"
                  src={card.product.primary_image_url}
                  alt={card.product.name}
                  loading="lazy"
                />
                <div className="card-body">
                  <span className="status-badge status-badge-info">{card.activityName}</span>
                  <h3 className="card-title">{card.product.name}</h3>
                  <p style={{ margin: 0, fontWeight: 700, color: "var(--color-primary)" }}>
                    NT$ {card.unitPrice}
                  </p>
                  <p className="helper-text" style={{ margin: 0 }}>
                    結團時間 {formatDeadline(card.deadlineAt)}
                  </p>
                  <Link
                    className="btn btn-secondary btn-full"
                    to={`/group-buys/${card.groupBuyId}?product=${card.groupBuyProductId}`}
                  >
                    {card.isAvailable ? "前往開團" : "查看開團"}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {announcements.length > 0 && (
        <section className="section">
          <h2 className="section-title">公開公告</h2>
          <div className="grid">
            {announcements.map((announcement) => (
              <div key={announcement.id} className="group-buy-card">
                <p className="helper-text" style={{ margin: "0 0 0.4rem" }}>
                  {formatDate(announcement.published_at)}
                </p>
                <h3 style={{ margin: "0 0 0.4rem" }}>{announcement.title}</h3>
                <div className="rules-text">{announcement.content}</div>
              </div>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
