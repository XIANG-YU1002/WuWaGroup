function buildPageList(current, total) {
  const pages = [];
  const windowSize = 1;
  for (let page = 1; page <= total; page += 1) {
    const withinWindow = Math.abs(page - current) <= windowSize;
    if (page === 1 || page === total || withinWindow) {
      pages.push(page);
    } else if (pages[pages.length - 1] !== "...") {
      pages.push("...");
    }
  }
  return pages;
}

/**
 * 列表頁底部區塊：左側顯示「第 X - Y 筆，共 Z 筆」、中間頁碼（上下頁＋頁數）、
 * 右側每頁顯示筆數選擇（預設 5 / 10 / 20）。一律顯示（即使只有一頁）。
 */
export default function ListFooter({
  pagination,
  onPageChange,
  pageSize,
  onPageSizeChange,
  pageSizeOptions = [5, 10, 20],
}) {
  const { page, page_size: apiPageSize, total_items: total, total_pages: totalPages } = pagination;
  const start = total === 0 ? 0 : (page - 1) * apiPageSize + 1;
  const end = Math.min(page * apiPageSize, total);
  const pages = totalPages > 0 ? buildPageList(page, totalPages) : [1];

  function go(next) {
    onPageChange(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="list-footer">
      <div className="list-footer-info">
        顯示 {start} - {end} 筆，共 {total} 筆
      </div>
      <nav className="pagination list-footer-pages" aria-label="分頁">
        <button type="button" disabled={page <= 1} onClick={() => go(page - 1)} aria-label="上一頁">
          ‹
        </button>
        {pages.map((item, index) =>
          item === "..." ? (
            <span key={`ellipsis-${index}`}>…</span>
          ) : (
            <button
              key={item}
              type="button"
              aria-current={item === page ? "page" : undefined}
              onClick={() => go(item)}
            >
              {item}
            </button>
          ),
        )}
        <button
          type="button"
          disabled={page >= totalPages || totalPages <= 1}
          onClick={() => go(page + 1)}
          aria-label="下一頁"
        >
          ›
        </button>
      </nav>
      <label className="page-size-select">
        每頁顯示
        <select value={pageSize} onChange={(event) => onPageSizeChange(Number(event.target.value))}>
          {pageSizeOptions.map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
        筆
      </label>
    </div>
  );
}
