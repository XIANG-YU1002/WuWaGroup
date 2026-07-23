import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getGroupLeaderDashboard } from "../../api/groupLeaderProfile.js";
import { useAuth } from "../../context/AuthContext.jsx";
import ErrorState from "../../components/common/ErrorState.jsx";
import PageLoader from "../../components/common/PageLoader.jsx";

export default function DashboardPage() {
  const { token } = useAuth();
  const [cards, setCards] = useState(null);
  const [error, setError] = useState(false);

  function load() {
    setError(false);
    setCards(null);
    getGroupLeaderDashboard(token)
      .then((response) => setCards(response.data.cards))
      .catch(() => setError(true));
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (error) {
    return <ErrorState onRetry={load} />;
  }

  if (!cards) {
    return <PageLoader />;
  }

  return (
    <>
      <div className="page-header">
        <h1>團主 Dashboard</h1>
      </div>

      <div className="stat-grid">
        {cards.map((card) => (
          <Link key={card.key} to={card.target_url} className="stat-card">
            <p className="stat-card-label">{card.label}</p>
            <p className="stat-card-value">{card.count}</p>
          </Link>
        ))}
      </div>

      <div className="group-buy-card-row" style={{ marginTop: "2rem" }}>
        <Link className="btn btn-primary" to="/group-leader/group-buys/new">
          建立開團
        </Link>
        <Link className="btn btn-secondary" to="/group-leader/group-buys">
          我的開團
        </Link>
        <Link className="btn btn-secondary" to="/group-leader/orders">
          訂單管理
        </Link>
        <Link className="btn btn-secondary" to="/group-leader/announcements">
          公告管理
        </Link>
      </div>
    </>
  );
}
