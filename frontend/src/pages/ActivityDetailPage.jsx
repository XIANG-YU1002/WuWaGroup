import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getActivityDetail, getActivityProducts } from "../api/activities.js";
import Breadcrumb from "../components/common/Breadcrumb.jsx";
import EmptyState from "../components/common/EmptyState.jsx";
import ErrorState from "../components/common/ErrorState.jsx";
import PageLoader from "../components/common/PageLoader.jsx";
import StatusBadge from "../components/common/StatusBadge.jsx";
import ProductCard from "../components/product/ProductCard.jsx";
import { ApiError } from "../api/client.js";
import MediaImage from "../components/common/MediaImage.jsx";

export default function ActivityDetailPage() {
  const { activityId } = useParams();
  const [activity, setActivity] = useState(null);
  const [products, setProducts] = useState(null);
  const [error, setError] = useState(null);

  async function load() {
    setError(null);
    setActivity(null);
    setProducts(null);
    try {
      const [activityResponse, productsResponse] = await Promise.all([
        getActivityDetail(activityId),
        getActivityProducts(activityId),
      ]);
      setActivity(activityResponse.data);
      setProducts(productsResponse.data);
    } catch (err) {
      setError(err);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activityId]);

  if (error) {
    if (error instanceof ApiError && error.status === 404) {
      return <ErrorState title="找不到此活動" description="活動不存在或已被移除。" />;
    }
    return <ErrorState onRetry={load} />;
  }

  if (!activity || !products) {
    return <PageLoader />;
  }

  return (
    <>
      <Breadcrumb items={[{ label: "首頁", to: "/" }, { label: activity.name }]} />

      <div className="activity-detail-header">
        <MediaImage className="card-image" src={activity.image_url} alt={activity.name} />
        <div>
          <h1>{activity.name}</h1>
          <StatusBadge domain="activity" value={activity.status} />
          {activity.description && <p>{activity.description}</p>}
          {activity.status === "ended" && (
            <p className="helper-text">此活動已結束，目前無法建立新的開團。</p>
          )}
        </div>
      </div>

      <section className="section">
        <h2 className="section-title">活動商品</h2>
        {products.length === 0 ? (
          <EmptyState title="此活動目前沒有上架商品。" />
        ) : (
          <div className="grid">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
