import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { searchActivities, searchCharacters, searchProducts } from "../api/search.js";
import ActivityCard from "../components/activity/ActivityCard.jsx";
import ProductCard from "../components/product/ProductCard.jsx";
import EmptyState from "../components/common/EmptyState.jsx";
import ErrorState from "../components/common/ErrorState.jsx";
import PageLoader from "../components/common/PageLoader.jsx";
import Pagination from "../components/common/Pagination.jsx";

function SearchSection({ title, count, isLoading, isEmpty, children, pagination, onPageChange }) {
  return (
    <section className="section">
      <h2 className="section-title">
        {title}
        {count !== null ? `（${count}）` : ""}
      </h2>
      {isLoading ? (
        <PageLoader />
      ) : isEmpty ? (
        <EmptyState title={`沒有符合的${title}結果。`} />
      ) : (
        <>
          {children}
          {pagination && (
            <Pagination
              page={pagination.page}
              totalPages={pagination.total_pages}
              onPageChange={onPageChange}
            />
          )}
        </>
      )}
    </section>
  );
}

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const q = searchParams.get("q") ?? "";
  const characterId = searchParams.get("character_id") ?? undefined;

  const [activities, setActivities] = useState(null);
  const [activityPagination, setActivityPagination] = useState(null);
  const [activityPage, setActivityPage] = useState(1);

  const [products, setProducts] = useState(null);
  const [productPagination, setProductPagination] = useState(null);
  const [productPage, setProductPage] = useState(1);

  const [characters, setCharacters] = useState(null);
  const [characterPagination, setCharacterPagination] = useState(null);
  const [characterPage, setCharacterPage] = useState(1);

  const [error, setError] = useState(false);

  useEffect(() => {
    setActivityPage(1);
    setProductPage(1);
    setCharacterPage(1);
  }, [q, characterId]);

  useEffect(() => {
    if (!q && !characterId) return;
    setError(false);
    setActivities(null);
    searchActivities(q, { page: activityPage })
      .then((response) => {
        setActivities(response.data);
        setActivityPagination(response.pagination);
      })
      .catch(() => setError(true));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, activityPage]);

  useEffect(() => {
    if (!q && !characterId) return;
    setError(false);
    setProducts(null);
    searchProducts(q, { characterId, page: productPage })
      .then((response) => {
        setProducts(response.data);
        setProductPagination(response.pagination);
      })
      .catch(() => setError(true));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, characterId, productPage]);

  useEffect(() => {
    if (!q) return;
    setError(false);
    setCharacters(null);
    searchCharacters(q, { page: characterPage })
      .then((response) => {
        setCharacters(response.data);
        setCharacterPagination(response.pagination);
      })
      .catch(() => setError(true));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, characterPage]);

  if (!q && !characterId) {
    return <EmptyState title="請輸入搜尋文字。" />;
  }

  return (
    <>
      <div className="page-header">
        <h1>搜尋結果</h1>
        {q && <p>搜尋「{q}」</p>}
      </div>

      {error && <ErrorState onRetry={() => window.location.reload()} />}

      {!characterId && (
        <SearchSection
          title="活動"
          count={activityPagination?.total_items ?? null}
          isLoading={activities === null}
          isEmpty={activities?.length === 0}
          pagination={activityPagination}
          onPageChange={setActivityPage}
        >
          <div className="grid">
            {activities?.map((activity) => (
              <ActivityCard key={activity.id} activity={activity} />
            ))}
          </div>
        </SearchSection>
      )}

      <SearchSection
        title="商品"
        count={productPagination?.total_items ?? null}
        isLoading={products === null}
        isEmpty={products?.length === 0}
        pagination={productPagination}
        onPageChange={setProductPage}
      >
        <div className="grid">
          {products?.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </SearchSection>

      {!characterId && (
        <SearchSection
          title="角色"
          count={characterPagination?.total_items ?? null}
          isLoading={characters === null}
          isEmpty={characters?.length === 0}
          pagination={characterPagination}
          onPageChange={setCharacterPage}
        >
          <ul>
            {characters?.map((character) => (
              <li key={character.id}>
                <Link to={`/search?character_id=${character.id}`}>{character.name}</Link>（關聯商品
                {character.related_product_count} 項）
              </li>
            ))}
          </ul>
        </SearchSection>
      )}
    </>
  );
}
