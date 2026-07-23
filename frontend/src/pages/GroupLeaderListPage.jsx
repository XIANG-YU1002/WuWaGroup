import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { listGroupLeaders } from "../api/groupLeaders.js";
import { resolveMediaUrl } from "../api/client.js";
import EmptyState from "../components/common/EmptyState.jsx";
import ErrorState from "../components/common/ErrorState.jsx";
import PageLoader from "../components/common/PageLoader.jsx";
import Pagination from "../components/common/Pagination.jsx";

const CONTACT_LINKS = [
  { key: "facebook", label: "Facebook" },
  { key: "discord", label: "Discord" },
  { key: "line", label: "LINE" },
];

function formatDate(isoString) {
  return new Date(isoString).toLocaleDateString("zh-TW", { timeZone: "Asia/Taipei" });
}

export default function GroupLeaderListPage() {
  const [keyword, setKeyword] = useState("");
  const [keywordInput, setKeywordInput] = useState("");
  const [page, setPage] = useState(1);
  const [profiles, setProfiles] = useState(null);
  const [pagination, setPagination] = useState(null);
  const [error, setError] = useState(false);

  function load() {
    setError(false);
    setProfiles(null);
    listGroupLeaders({ keyword: keyword || undefined, page })
      .then((response) => {
        setProfiles(response.data);
        setPagination(response.pagination);
      })
      .catch(() => setError(true));
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keyword, page]);

  function handleSearchSubmit(event) {
    event.preventDefault();
    setPage(1);
    setKeyword(keywordInput.trim());
  }

  return (
    <>
      <div className="page-header">
        <h1>團主列表</h1>
        <p className="helper-text">瀏覽值得信賴的團主，安心參與鳴潮周邊團購。</p>
      </div>

      <form className="search-input" style={{ maxWidth: "480px", marginBottom: "1.5rem" }} onSubmit={handleSearchSubmit}>
        <input
          type="search"
          placeholder="搜尋團主名稱"
          value={keywordInput}
          onChange={(event) => setKeywordInput(event.target.value)}
          aria-label="搜尋團主名稱"
        />
        <button type="submit" aria-label="搜尋">
          搜尋
        </button>
      </form>

      {error ? (
        <ErrorState onRetry={load} />
      ) : profiles === null ? (
        <PageLoader />
      ) : profiles.length === 0 ? (
        <EmptyState title="沒有符合的團主。" />
      ) : (
        <>
          {profiles.map((profile) => (
            <div key={profile.id} className="group-buy-card">
              <div className="group-leader-banner-main" style={{ border: "none", padding: 0 }}>
                {profile.avatar_url ? (
                  <img className="card-image-square" src={resolveMediaUrl(profile.avatar_url)} alt="" style={{ width: "5rem", height: "5rem" }} />
                ) : (
                  <div
                    className="card-image-square avatar-circle"
                    style={{ width: "5rem", height: "5rem", fontSize: "1.5rem" }}
                    aria-hidden="true"
                  >
                    {profile.display_name?.[0] ?? "?"}
                  </div>
                )}
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: "0 0 0.3rem" }}>{profile.display_name}</h3>
                  {profile.introduction && (
                    <p className="helper-text" style={{ margin: "0 0 0.5rem" }}>
                      {profile.introduction}
                    </p>
                  )}
                  <div className="group-leader-stats" style={{ marginTop: 0, fontSize: "0.85rem" }}>
                    <span>成為團主時間 {formatDate(profile.created_at)}</span>
                    <span>目前開團數 {profile.statistics.group_buy_count}</span>
                    <span>完成訂單數 {profile.statistics.completed_order_count}</span>
                  </div>
                  <div className="group-leader-contacts">
                    {CONTACT_LINKS.filter((contact) => profile.public_contacts[contact.key]).map(
                      (contact) => (
                        <span key={contact.key} className="status-badge status-badge-neutral">
                          {contact.label}：{profile.public_contacts[contact.key]}
                        </span>
                      ),
                    )}
                  </div>
                </div>
                <Link className="btn btn-primary" to={`/group-leaders/${profile.id}`}>
                  查看團主頁
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
