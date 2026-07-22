import { Outlet } from "react-router-dom";
import Header from "../components/common/Header.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import PageLoader from "../components/common/PageLoader.jsx";

export default function MainLayout() {
  const { initializing } = useAuth();

  if (initializing) {
    return <PageLoader label="正在載入使用者資訊..." />;
  }

  return (
    <>
      <Header />
      <main className="container">
        <Outlet />
      </main>
    </>
  );
}
