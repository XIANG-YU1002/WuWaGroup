import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  getGroupLeaderAnnouncements,
  getGroupLeaderGroupBuys,
  getGroupLeaderProfile,
} from "../api/groupLeaders.js";
import { ApiError } from "../api/client.js";
import EmptyState from "../components/common/EmptyState.jsx";
import ErrorState from "../components/common/ErrorState.jsx";
import PageLoader from "../components/common/PageLoader.jsx";
import StatusBadge from "../components/common/StatusBadge.jsx";

export default function GroupLeaderProfilePage() {
  const { groupLeaderId } = useParams();
  const [profile, setProfile] = useState(null);
  const [groupBuys, setGroupBuys] = useState([]);
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
      setGroupBuys(groupBuysResponse.data);
      setAnnouncements(announcementsResponse.data);
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
      <div className="group-leader-header">
        {profile.avatar_url ? (
          <img className="card-image card-image-square" src={profile.avatar_url} alt="" />
        ) : (
          <div className="card-image card-image-square" aria-hidden="true" />
        )}
        <div>
          <h1>{profile.display_name}</h1>
          <p className="helper-text">
            成為團主時間：
            {new Date(profile.created_at).toLocaleDateString("zh-TW", { timeZone: "Asia/Taipei" })}
          </p>
          <p>開團次數：{profile.statistics.group_buy_count}</p>
          <p>完成訂單數：{profile.statistics.completed_order_count}</p>
        </div>
      </div>

      {profile.introduction && (
        <section className="section">
          <h2 className="section-title">團主介紹</h2>
          <div className="rules-text">{profile.introduction}</div>
        </section>
      )}

      <section className="section">
        <h2 className="section-title">公開聯絡方式</h2>
        <ul>
          {profile.public_contacts.facebook && <li>Facebook：{profile.public_contacts.facebook}</li>}
          {profile.public_contacts.discord && <li>Discord：{profile.public_contacts.discord}</li>}
          {profile.public_contacts.line && <li>LINE：{profile.public_contacts.line}</li>}
        </ul>
      </section>

      <section className="section">
        <h2 className="section-title">目前開團</h2>
        {groupBuys.length === 0 ? (
          <EmptyState title="目前沒有進行中的開團。" />
        ) : (
          groupBuys.map((groupBuy) => (
            <div key={groupBuy.id} className="group-buy-card">
              <div className="group-buy-card-row">
                <Link to={`/group-buys/${groupBuy.id}`}>{groupBuy.activity.name}</Link>
                <StatusBadge domain="groupBuyEffective" value={groupBuy.effective_status} />
              </div>
            </div>
          ))
        )}
      </section>

      {announcements.length > 0 && (
        <section className="section">
          <h2 className="section-title">最新公開公告</h2>
          {announcements.map((announcement) => (
            <div key={announcement.id} className="group-buy-card">
              <h3>{announcement.title}</h3>
              <div className="rules-text">{announcement.content}</div>
            </div>
          ))}
        </section>
      )}

      {profile.default_rules && (
        <section className="section">
          <h2 className="section-title">預設團規</h2>
          <div className="rules-text">{profile.default_rules}</div>
          <p className="helper-text">
            此為團主平常的開團習慣，各開團的正式團規仍以該開團詳情頁與訂單快照為準。
          </p>
        </section>
      )}
    </>
  );
}
