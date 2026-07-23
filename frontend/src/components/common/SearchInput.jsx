import { useEffect, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { SearchIcon } from "./icons.jsx";

export default function SearchInput({ className = "" }) {
  const [value, setValue] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    if (location.pathname === "/search") {
      setValue(searchParams.get("q") ?? "");
    } else {
      setValue("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, searchParams]);

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
        placeholder="搜尋商品或角色"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        aria-label="全站搜尋"
      />
      <button type="submit" className="search-input-icon-btn" aria-label="搜尋">
        <SearchIcon className="icon-search" />
      </button>
    </form>
  );
}
