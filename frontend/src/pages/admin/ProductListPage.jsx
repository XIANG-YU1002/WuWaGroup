import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { getActivities } from "../../api/activities.js";
import { deactivateAdminProduct, getAdminProducts, reactivateAdminProduct } from "../../api/adminProducts.js";
import { resolveMediaUrl } from "../../api/client.js";
import { useAuth } from "../../context/AuthContext.jsx";
import Button from "../../components/common/Button.jsx";
import EmptyState from "../../components/common/EmptyState.jsx";
import ErrorState from "../../components/common/ErrorState.jsx";
import PageLoader from "../../components/common/PageLoader.jsx";
import Pagination from "../../components/common/Pagination.jsx";

export default function ProductListPage() {
  const { token } = useAuth();
  const [searchParams] = useSearchParams();
  const [activities, setActivities] = useState([]);
  const [activityId, setActivityId] = useState("");
  const [isActive, setIsActive] = useState(searchParams.get("is_active") ?? "");
  const [keyword, setKeyword] = useState("");
  const [keywordInput, setKeywordInput] = useState("");
  const [page, setPage] = useState(1);
  const [products, setProducts] = useState(null);
  const [pagination, setPagination] = useState(null);
  const [error, setError] = useState(false);
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    getActivities({ pageSize: 50 }).then((response) => setActivities(response.data));
  }, []);

  function load() {
    setError(false);
    setProducts(null);
    getAdminProducts(token, {
      activityId: activityId || undefined,
      isActive: isActive === "" ? undefined : isActive === "true",
      keyword: keyword || undefined,
      page,
    })
      .then((response) => {
        setProducts(response.data);
        setPagination(response.pagination);
      })
      .catch(() => setError(true));
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activityId, isActive, keyword, page]);

  function handleSearchSubmit(event) {
    event.preventDefault();
    setPage(1);
    setKeyword(keywordInput.trim());
  }

  async function handleToggleActive(product) {
    setBusyId(product.id);
    try {
      if (product.is_active) {
        await deactivateAdminProduct(product.id, token);
      } else {
        await reactivateAdminProduct(product.id, token);
      }
      load();
    } finally {
      setBusyId(null);
    }
  }

  return (
    <>
      <div className="group-buy-card-row">
        <h1>商品管理</h1>
        <Link className="btn btn-primary" to="/admin/products/new">
          + 新增商品
        </Link>
      </div>

      <div className="group-buy-card-row" style={{ margin: "1rem 0" }}>
        <form className="search-input" style={{ maxWidth: "320px" }} onSubmit={handleSearchSubmit}>
          <input
            type="search"
            placeholder="搜尋商品名稱"
            value={keywordInput}
            onChange={(event) => setKeywordInput(event.target.value)}
          />
          <button type="submit">搜尋</button>
        </form>
        <select value={activityId} onChange={(event) => { setActivityId(event.target.value); setPage(1); }}>
          <option value="">選擇活動</option>
          {activities.map((activity) => (
            <option key={activity.id} value={activity.id}>
              {activity.name}
            </option>
          ))}
        </select>
        <select value={isActive} onChange={(event) => { setIsActive(event.target.value); setPage(1); }}>
          <option value="">全部狀態</option>
          <option value="true">已上架</option>
          <option value="false">已下架</option>
        </select>
      </div>

      {error ? (
        <ErrorState onRetry={load} />
      ) : products === null ? (
        <PageLoader />
      ) : products.length === 0 ? (
        <EmptyState title="目前沒有商品。" />
      ) : (
        <>
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>商品圖片</th>
                  <th>商品名稱</th>
                  <th>所屬活動</th>
                  <th>官方價格</th>
                  <th>狀態</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id}>
                    <td>
                      <img
                        src={resolveMediaUrl(product.primary_image_url)}
                        alt=""
                        style={{ width: "3rem", height: "3rem", objectFit: "cover", borderRadius: "var(--radius)" }}
                      />
                    </td>
                    <td>{product.name}</td>
                    <td>{product.activity.name}</td>
                    <td>{product.official_price ?? "—"}</td>
                    <td>
                      <span className={`status-badge ${product.is_active ? "status-badge-success" : "status-badge-neutral"}`}>
                        {product.is_active ? "已上架" : "已下架"}
                      </span>
                    </td>
                    <td>
                      <div className="group-buy-card-row" style={{ flexWrap: "nowrap" }}>
                        <Link className="btn btn-secondary" to={`/admin/products/${product.id}`}>
                          編輯
                        </Link>
                        <Link className="btn btn-secondary" to={`/products/${product.id}`}>
                          查看詳情
                        </Link>
                        <Button
                          variant={product.is_active ? "danger" : "secondary"}
                          loading={busyId === product.id}
                          onClick={() => handleToggleActive(product)}
                        >
                          {product.is_active ? "下架" : "上架"}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination page={pagination.page} totalPages={pagination.total_pages} onPageChange={setPage} />
        </>
      )}
    </>
  );
}
