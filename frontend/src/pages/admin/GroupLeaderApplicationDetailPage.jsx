import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  approveAdminApplication,
  getAdminApplicationDetail,
  rejectAdminApplication,
} from "../../api/adminGroupLeaderApplications.js";
import { useAuth } from "../../context/AuthContext.jsx";
import { ApiError } from "../../api/client.js";
import Alert from "../../components/common/Alert.jsx";
import Button from "../../components/common/Button.jsx";
import ErrorState from "../../components/common/ErrorState.jsx";
import PageLoader from "../../components/common/PageLoader.jsx";
import StatusBadge from "../../components/common/StatusBadge.jsx";

function formatDateTime(isoString) {
  return new Date(isoString).toLocaleString("zh-TW", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Taipei",
  });
}

export default function GroupLeaderApplicationDetailPage() {
  const { applicationId } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();

  const [application, setApplication] = useState(null);
  const [error, setError] = useState(false);
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState(null);

  function load() {
    setError(false);
    setApplication(null);
    getAdminApplicationDetail(applicationId, token)
      .then((response) => setApplication(response.data))
      .catch(() => setError(true));
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [applicationId]);

  async function handleApprove() {
    setBusy(true);
    setActionError(null);
    try {
      await approveAdminApplication(applicationId, token);
      navigate("/admin/group-leader-applications", { replace: true });
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : "審核時發生錯誤，請稍後再試。");
    } finally {
      setBusy(false);
    }
  }

  async function handleReject() {
    setBusy(true);
    setActionError(null);
    try {
      await rejectAdminApplication(applicationId, token);
      navigate("/admin/group-leader-applications", { replace: true });
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : "審核時發生錯誤，請稍後再試。");
    } finally {
      setBusy(false);
    }
  }

  if (error) {
    return <ErrorState onRetry={load} />;
  }

  if (!application) {
    return <PageLoader />;
  }

  const isPending = application.status === "pending";

  return (
    <>
      <div className="page-header">
        <h1>團主申請詳情</h1>
      </div>

      <div className="group-buy-card">
        <div className="group-buy-card-row">
          <div>
            <p style={{ margin: 0, fontWeight: 600 }}>{application.user.nickname}</p>
            <p className="helper-text" style={{ margin: 0 }}>{application.user.email}</p>
          </div>
          <StatusBadge domain="application" value={application.status} />
        </div>
        <dl className="detail-list">
          <dt>申請時間</dt>
          <dd>{formatDateTime(application.created_at)}</dd>
          {application.reviewed_at && (
            <>
              <dt>審核時間</dt>
              <dd>{formatDateTime(application.reviewed_at)}</dd>
            </>
          )}
        </dl>
      </div>

      {isPending && (
        <Alert type="info">通過後，會員需完成團主公開資料，才能公開團主頁與建立開團。</Alert>
      )}

      {actionError && <Alert type="error">{actionError}</Alert>}

      {isPending && (
        <div className="group-buy-card-row">
          <Button variant="danger" loading={busy} onClick={handleReject}>
            拒絕申請
          </Button>
          <Button loading={busy} onClick={handleApprove}>
            核准申請
          </Button>
        </div>
      )}

      <p style={{ marginTop: "1.5rem" }}>
        <Link to="/admin/group-leader-applications">← 返回團主申請列表</Link>
      </p>
    </>
  );
}
