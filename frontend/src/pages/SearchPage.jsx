import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { searchCharacters, searchProducts } from "../api/search.js";
import ProductCard from "../components/product/ProductCard.jsx";
import EmptyState from "../components/common/EmptyState.jsx";
import ErrorState from "../components/common/ErrorState.jsx";
import PageLoader from "../components/common/PageLoader.jsx";
import Pagination from "../components/common/Pagination.jsx";

function SearchSection({ title, count, isLoading, isEmpty, isError, onRetry, children, pagination, onPageChange }) {
  return (
    <section className="section">
      <h2 className="section-title">
        {title}
        {count !== null ? `（${count}）` : ""}
      </h2>
      {isError ? (
        <ErrorState onRetry={onRetry} />
      ) : isLoading ? (
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

  const [products, setProducts] = useState(null);
  const [productPagination, setProductPagination] = useState(null);
  const [productPage, setProductPage] = useState(1);
  const [productsError, setProductsError] = useState(false);

  const [characters, setCharacters] = useState(null);
  const [characterPagination, setCharacterPagination] = useState(null);
  const [characterPage, setCharacterPage] = useState(1);
  const [charactersError, setCharactersError] = useState(false);

  useEffect(() => {
    setProductPage(1);
    setCharacterPage(1);
  }, [q, characterId]);

  function loadProducts() {
    setProductsError(false);
    setProducts(null);
    searchProducts(q, { characterId, page: productPage })
      .then((response) => {
        setProducts(response.data);
        setProductPagination(response.pagination);
      })
      .catch(() => setProductsError(true));
  }

  function loadCharacters() {
    setCharactersError(false);
    setCharacters(null);
    searchCharacters(q, { page: characterPage })
      .then((response) => {
        setCharacters(response.data);
        setCharacterPagination(response.pagination);
      })
      .catch(() => setCharactersError(true));
  }

  useEffect(() => {
    if (!q && !characterId) return;
    loadProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, characterId, productPage]);

  useEffect(() => {
    if (!q || characterId) return;
    loadCharacters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, characterId, characterPage]);

  if (!q && !characterId) {
    return <EmptyState title="請輸入搜尋文字。" />;
  }

  return (
    <>
      <div className="page-header">
        <h1>搜尋結果</h1>
        {q && <p>搜尋「{q}」</p>}
        {characterId && !q && (
          <p>
            角色搜尋結果 <Link to="/search">清除篩選</Link>
          </p>
        )}
      </div>

      <SearchSection
        title="商品"
        count={productPagination?.total_items ?? null}
        isLoading={products === null && !productsError}
        isEmpty={products?.length === 0}
        isError={productsError}
        onRetry={loadProducts}
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
          isLoading={characters === null && !charactersError}
          isEmpty={characters?.length === 0}
          isError={charactersError}
          onRetry={loadCharacters}
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
