import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAdminDashboard } from "../../api/admin.js";
import { useAuth } from "../../context/AuthContext.jsx";
import ErrorState from "../../components/common/ErrorState.jsx";
import PageLoader from "../../components/common/PageLoader.jsx";

export default function AdminDashboardPage() {
  const { token } = useAuth();
  const [cards, setCards] = useState(null);
  const [error, setError] = useState(false);

  async function load() {
    setError(false);
    setCards(null);
    try {
      const response = await getAdminDashboard(token);
      setCards(response.data.cards);
    } catch {
      setError(true);
    }
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
        <h1>管理員儀表板</h1>
        <p className="helper-text">平台營運總覽</p>
      </div>

      <div className="stat-grid">
        {cards.map((card) =>
          card.key === "current_group_buys" ? (
            <div key={card.key} className="stat-card">
              <p className="stat-card-label">{card.label}</p>
              <p className="stat-card-value">{card.count}</p>
            </div>
          ) : (
            <Link key={card.key} to={card.target_url} className="stat-card">
              <p className="stat-card-label">{card.label}</p>
              <p className="stat-card-value">{card.count}</p>
            </Link>
          ),
        )}
      </div>
    </>
  );
}
