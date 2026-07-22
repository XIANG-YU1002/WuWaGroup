import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function SearchInput({ initialValue = "", className = "" }) {
  const [value, setValue] = useState(initialValue);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.pathname !== "/search") {
      setValue("");
    }
  }, [location.pathname]);

  function handleSubmit(event) {
    event.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) {
      return;
    }
    navigate(`/search?q=${encodeURIComponent(trimmed)}`);
  }

  return (
    <form className={`search-input ${className}`} onSubmit={handleSubmit} role="search">
      <input
        type="search"
        placeholder="搜尋活動、商品或角色"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        aria-label="全站搜尋"
      />
      <button type="submit" aria-label="搜尋">
        搜尋
      </button>
    </form>
  );
}
