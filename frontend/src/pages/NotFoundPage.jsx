import { Link } from "react-router-dom";
import ErrorState from "../components/common/ErrorState.jsx";

export default function NotFoundPage() {
  return (
    <ErrorState title="找不到此頁面" description="找不到此頁面或資料已不存在。">
      <Link to="/">返回首頁</Link>
    </ErrorState>
  );
}
