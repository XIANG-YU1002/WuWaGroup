import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getProductDetail, getProductGroupBuys } from "../api/products.js";
import { ApiError } from "../api/client.js";
import Breadcrumb from "../components/common/Breadcrumb.jsx";
import EmptyState from "../components/common/EmptyState.jsx";
import ErrorState from "../components/common/ErrorState.jsx";
import PageLoader from "../components/common/PageLoader.jsx";
import Pagination from "../components/common/Pagination.jsx";
import FavoriteButton from "../components/product/FavoriteButton.jsx";
import ProductGallery from "../components/product/ProductGallery.jsx";
import GroupBuyCard from "../components/group-buy/GroupBuyCard.jsx";
import { useAuth } from "../context/AuthContext.jsx";

const SORT_OPTIONS = [
  { value: "newest", label: "開團時間：新到舊" },
  { value: "price_asc", label: "價格：低到高" },
  { value: "price_desc", label: "價格：高到低" },
  { value: "deadline_asc", label: "截止時間：近到遠" },
  { value: "deadline_desc", label: "截止時間：遠到近" },
];

export default function ProductDetailPage() {
  const { productId } = useParams();
  const { token } = useAuth();

  const [product, setProduct] = useState(null);
  const [error, setError] = useState(null);

  const [groupBuys, setGroupBuys] = useState(null);
  const [pagination, setPagination] = useState(null);
  const [groupBuysError, setGroupBuysError] = useState(false);
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState("newest");
  const [availableOnly, setAvailableOnly] = useState(false);
  const [cashOnDeliveryOnly, setCashOnDeliveryOnly] = useState(false);

  async function loadProduct() {
    setError(null);
    setProduct(null);
    try {
      const response = await getProductDetail(productId, token);
      setProduct(response.data);
    } catch (err) {
      setError(err);
    }
  }

  async function loadGroupBuys() {
    setGroupBuysError(false);
    setGroupBuys(null);
    try {
      const response = await getProductGroupBuys(productId, {
        sort,
        availableOnly,
        cashOnDeliveryOnly,
        page,
        pageSize: 10,
      });
      setGroupBuys(response.data);
      setPagination(response.pagination);
    } catch {
      setGroupBuysError(true);
    }
  }

  useEffect(() => {
    loadProduct();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  useEffect(() => {
    loadGroupBuys();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId, sort, availableOnly, cashOnDeliveryOnly, page]);

  if (error) {
    if (error instanceof ApiError && error.status === 404) {
      return <ErrorState title="找不到此商品" description="商品不存在或已被移除。" />;
    }
    return <ErrorState onRetry={loadProduct} />;
  }

  if (!product) {
    return <PageLoader />;
  }

  const images = [product.primary_image_url, ...product.images.map((image) => image.image_url)];

  return (
    <>
      <Breadcrumb
        items={[
          { label: "首頁", to: "/" },
          { label: product.activity.name, to: `/activities/${product.activity.id}` },
          { label: product.name },
        ]}
      />

      <div className="product-detail-header">
        <ProductGallery images={images} alt={product.name} />

        <div>
          <h1>{product.name}</h1>
          <p>
            所屬活動：<a href={`/activities/${product.activity.id}`}>{product.activity.name}</a>
          </p>
          {product.characters.length > 0 && (
            <p>角色：{product.characters.map((character) => character.name).join("、")}</p>
          )}
          {product.official_price && (
            <p>
              官方價格：{product.official_currency} {product.official_price}
            </p>
          )}
          {!product.is_active && <p className="helper-text">此商品已下架。</p>}
          <FavoriteButton productId={product.id} initialFavorited={product.is_favorited} />
        </div>
      </div>

      <section className="section">
        <h2 className="section-title">開團比較</h2>

        <div className="group-buy-card-row">
          <label>
            排序：
            <select value={sort} onChange={(event) => { setSort(event.target.value); setPage(1); }}>
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            <input
              type="checkbox"
              checked={availableOnly}
              onChange={(event) => { setAvailableOnly(event.target.checked); setPage(1); }}
            />
            只顯示目前可跟團
          </label>
          <label>
            <input
              type="checkbox"
              checked={cashOnDeliveryOnly}
              onChange={(event) => { setCashOnDeliveryOnly(event.target.checked); setPage(1); }}
            />
            只顯示可取貨付款
          </label>
        </div>

        {groupBuysError ? (
          <ErrorState onRetry={loadGroupBuys} />
        ) : groupBuys === null ? (
          <PageLoader />
        ) : groupBuys.length === 0 ? (
          <EmptyState title="目前沒有符合條件的開團。" />
        ) : (
          <>
            {groupBuys.map((groupBuy) => (
              <GroupBuyCard key={groupBuy.group_buy_product_id} groupBuy={groupBuy} />
            ))}
            <Pagination
              page={pagination.page}
              totalPages={pagination.total_pages}
              onPageChange={setPage}
            />
          </>
        )}
      </section>
    </>
  );
}
