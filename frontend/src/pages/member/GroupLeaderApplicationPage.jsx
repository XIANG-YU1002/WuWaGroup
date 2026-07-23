import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMyApplication, submitApplication } from "../../api/groupLeaderApplications.js";
import { getMyProfile } from "../../api/users.js";
import { useAuth } from "../../context/AuthContext.jsx";
import Alert from "../../components/common/Alert.jsx";
import Button from "../../components/common/Button.jsx";
import ErrorState from "../../components/common/ErrorState.jsx";
import PageLoader from "../../components/common/PageLoader.jsx";
import StatusBadge from "../../components/common/StatusBadge.jsx";

const STEPS = ["資格確認", "送出申請", "管理員審核", "完成團主資料", "開始開團"];

function stepIndexForStatus(status) {
  if (status === "pending") return 2;
  if (status === "approved") return 3;
  if (status === "rejected") return 2;
  return 0;
}

function StepIndicator({ activeIndex }) {
  return (
    <div className="group-buy-card-row" style={{ flexWrap: "nowrap", overflowX: "auto" }}>
      {STEPS.map((step, index) => (
        <span key={step} className="helper-text" style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
          <span
            className="status-badge"
            style={{
              borderRadius: "50%",
              width: "1.75rem",
              height: "1.75rem",
              justifyContent: "center",
              padding: 0,
              backgroundColor: index <= activeIndex ? "var(--color-primary)" : "#f0f0f7",
              color: index <= activeIndex ? "#fff" : "var(--color-text-muted)",
            }}
          >
            {index + 1}
          </span>
          {step}
        </span>
      ))}
    </div>
  );
}

export default function GroupLeaderApplicationPage() {
  const { token, refreshSession } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [application, setApplication] = useState(undefined);
  const [error, setError] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  function load() {
    setError(false);
    setProfile(null);
    setApplication(undefined);
    Promise.all([getMyProfile(token), getMyApplication(token)])
      .then(([profileResponse, applicationResponse]) => {
        setProfile(profileResponse.data);
        setApplication(applicationResponse.data);
      })
      .catch(() => setError(true));
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSubmit() {
    setSubmitting(true);
    setSubmitError(null);
    try {
      await submitApplication(token);
      await refreshSession();
      load();
    } catch (err) {
      setSubmitError(err.message ?? "送出申請時發生錯誤，請稍後再試。");
    } finally {
      setSubmitting(false);
    }
  }

  if (error) {
    return <ErrorState onRetry={load} />;
  }

  if (!profile || application === undefined) {
    return <PageLoader />;
  }

  const hasContact = Boolean(
    profile.facebook_contact || profile.discord_contact || profile.line_contact,
  );
  const hasPendingApplication = application?.status === "pending";
  const canSubmit = hasContact && !hasPendingApplication && (!application || application.can_reapply);

  if (application && (application.status === "pending" || application.status === "approved")) {
    return (
      <>
        <div className="page-header">
          <h1>團主申請狀態</h1>
          <p className="helper-text">查看您目前的申請進度與已提交資料。</p>
        </div>

        <div className="group-buy-card">
          <div className="group-buy-card-row">
            <h2 style={{ margin: 0 }}>
              {application.status === "approved" ? "申請已通過" : "申請已送出"}
            </h2>
            <StatusBadge domain="application" value={application.status} />
          </div>
          <p>
            {application.status === "approved"
              ? "恭喜！您的團主申請已通過審核，可以前往團主後台完成公開資料設定。"
              : "您的團主申請已成功送出，目前正在等待管理員審核。"}
          </p>
          <p className="helper-text">申請時間：{new Date(application.created_at).toLocaleString("zh-TW", { timeZone: "Asia/Taipei" })}</p>
        </div>

        <div className="section">
          <h2 className="section-title">申請進度</h2>
          <StepIndicator activeIndex={stepIndexForStatus(application.status)} />
        </div>

        {application.status === "approved" && (
          <Button onClick={() => navigate("/group-leader")}>前往團主後台</Button>
        )}
      </>
    );
  }

  return (
    <>
      <div className="page-header">
        <h1>申請成為團主</h1>
        <p className="helper-text">通過審核後，你將完成團主資料並取得團主資格，即可開團、管理團購與發布公告。</p>
      </div>

      {application?.status === "rejected" && (
        <Alert type="info">
          您上一次的申請未通過審核，可以重新送出申請。
        </Alert>
      )}

      <div className="group-buy-card">
        <h2 className="section-title">資格確認</h2>
        <ul>
          <li>已登入會員帳號 ✓</li>
          <li>{hasContact ? "已設定至少一項會員聯絡方式 ✓" : "尚未設定聯絡方式，請先至「個人資料」頁面補齊 ✗"}</li>
          <li>{hasPendingApplication ? "目前已有待審核中的團主申請 ✗" : "目前沒有待審核中的團主申請 ✓"}</li>
        </ul>
      </div>

      <div className="group-buy-card">
        <h2 className="section-title">申請確認</h2>
        <label style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <input type="checkbox" checked={agreed} onChange={(event) => setAgreed(event.target.checked)} />
          我已閱讀並同意團主申請說明與平台規範。
        </label>
      </div>

      {submitError && <Alert type="error">{submitError}</Alert>}

      <Button onClick={handleSubmit} loading={submitting} disabled={!agreed || !canSubmit}>
        送出團主申請
      </Button>
    </>
  );
}
