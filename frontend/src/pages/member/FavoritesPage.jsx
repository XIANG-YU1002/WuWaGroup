import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getFavoriteProducts, removeFavorite } from "../../api/favorites.js";
import { resolveMediaUrl } from "../../api/client.js";
import { useAuth } from "../../context/AuthContext.jsx";
import EmptyState from "../../components/common/EmptyState.jsx";
import ErrorState from "../../components/common/ErrorState.jsx";
import PageLoader from "../../components/common/PageLoader.jsx";
import Pagination from "../../components/common/Pagination.jsx";

export default function FavoritesPage() {
  const { token } = useAuth();
  const [page, setPage] = useState(1);
  const [items, setItems] = useState(null);
  const [pagination, setPagination] = useState(null);
  const [error, setError] = useState(false);
  const [removingId, setRemovingId] = useState(null);

  function load() {
    setError(false);
    setItems(null);
    getFavoriteProducts(token, { page })
      .then((response) => {
        setItems(response.data);
        setPagination(response.pagination);
      })
      .catch(() => setError(true));
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  async function handleRemove(productId) {
    setRemovingId(productId);
    try {
      await removeFavorite(productId, token);
      setItems((prev) => prev.filter((item) => item.product.id !== productId));
    } finally {
      setRemovingId(null);
    }
  }

  return (
    <>
      <div className="page-header">
        <h1>我的收藏</h1>
        <p className="helper-text">您收藏的商品清單，方便快速查看與日後比較。</p>
      </div>

      {error ? (
        <ErrorState onRetry={load} />
      ) : items === null ? (
        <PageLoader />
      ) : items.length === 0 ? (
        <EmptyState title="您還沒有收藏任何商品。" />
      ) : (
        <>
          <p className="helper-text">已收藏商品數量：{pagination.total_items} 項商品</p>
          <div className="grid">
            {items.map((item) => (
              <div key={item.favorite_id} className="card">
                <img
                  className="card-image card-image-square"
                  src={resolveMediaUrl(item.product.primary_image_url)}
                  alt={item.product.name}
                  loading="lazy"
                />
                <div className="card-body">
                  {!item.product.is_active && (
                    <span className="status-badge status-badge-neutral">商品已下架</span>
                  )}
                  <p className="helper-text" style={{ margin: 0 }}>{item.product.activity.name}</p>
                  <h3 className="card-title">{item.product.name}</h3>
                  <Link className="btn btn-secondary" to={`/products/${item.product.id}`}>
                    查看商品
                  </Link>
                  <button
                    type="button"
                    className="btn btn-ghost"
                    disabled={removingId === item.product.id}
                    onClick={() => handleRemove(item.product.id)}
                  >
                    取消收藏
                  </button>
                </div>
              </div>
            ))}
          </div>
          <Pagination page={pagination.page} totalPages={pagination.total_pages} onPageChange={setPage} />
        </>
      )}
    </>
  );
}
