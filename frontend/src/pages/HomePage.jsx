import { useEffect, useState } from "react";
import { getActivities } from "../api/activities.js";
import ActivityCard from "../components/activity/ActivityCard.jsx";
import EmptyState from "../components/common/EmptyState.jsx";
import ErrorState from "../components/common/ErrorState.jsx";
import PageLoader from "../components/common/PageLoader.jsx";

export default function HomePage() {
  const [openActivities, setOpenActivities] = useState(null);
  const [endedActivities, setEndedActivities] = useState(null);
  const [error, setError] = useState(false);

  async function loadActivities() {
    setError(false);
    setOpenActivities(null);
    setEndedActivities(null);
    try {
      const [openResponse, endedResponse] = await Promise.all([
        getActivities({ status: "open", pageSize: 20 }),
        getActivities({ status: "ended", pageSize: 20 }),
      ]);
      setOpenActivities(openResponse.data);
      setEndedActivities(endedResponse.data);
    } catch {
      setError(true);
    }
  }

  useEffect(() => {
    loadActivities();
  }, []);

  if (error) {
    return <ErrorState onRetry={loadActivities} />;
  }

  if (openActivities === null || endedActivities === null) {
    return <PageLoader />;
  }

  return (
    <>
      <div className="hero">
        <h1>EchoGather</h1>
        <p>鳴潮周邊團購平台</p>
      </div>

      <section className="section">
        <h2 className="section-title">目前活動</h2>
        {openActivities.length === 0 ? (
          <EmptyState title="目前沒有進行中的活動。" />
        ) : (
          <div className="grid">
            {openActivities.map((activity) => (
              <ActivityCard key={activity.id} activity={activity} />
            ))}
          </div>
        )}
      </section>

      <section className="section">
        <h2 className="section-title">已結束活動</h2>
        {endedActivities.length === 0 ? (
          <EmptyState title="目前沒有已結束活動。" />
        ) : (
          <div className="grid">
            {endedActivities.map((activity) => (
              <ActivityCard key={activity.id} activity={activity} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
