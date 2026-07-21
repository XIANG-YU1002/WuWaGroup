import { Routes, Route } from "react-router-dom";

// 第一版頁面尚未建立（Stage 1 僅建立專案骨架與開發環境）。
// 之後各階段會依 03_UI_Wireframe_Specification 的 Route Overview 補上實際頁面。
function SkeletonPlaceholder() {
  return (
    <main style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>WuWaGroup</h1>
      <p>專案骨架已建立，頁面將於後續階段實作。</p>
    </main>
  );
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<SkeletonPlaceholder />} />
    </Routes>
  );
}
