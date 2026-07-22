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

export default function Pagination({ page, totalPages, onPageChange }) {
  if (!totalPages || totalPages <= 1) {
    return null;
  }

  const handleChange = (nextPage) => {
    onPageChange(nextPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <nav className="pagination" aria-label="分頁">
      <button type="button" disabled={page <= 1} onClick={() => handleChange(page - 1)}>
        上一頁
      </button>
      {buildPageList(page, totalPages).map((item, index) =>
        item === "..." ? (
          <span key={`ellipsis-${index}`}>...</span>
        ) : (
          <button
            key={item}
            type="button"
            aria-current={item === page ? "page" : undefined}
            onClick={() => handleChange(item)}
          >
            {item}
          </button>
        ),
      )}
      <button type="button" disabled={page >= totalPages} onClick={() => handleChange(page + 1)}>
        下一頁
      </button>
    </nav>
  );
}
