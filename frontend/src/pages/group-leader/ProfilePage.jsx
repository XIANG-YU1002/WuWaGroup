import { useEffect, useRef, useState } from "react";
import {
  getMyGroupLeaderProfile,
  updateMyDefaultRules,
  updateMyGroupLeaderProfile,
} from "../../api/groupLeaderProfile.js";
import { uploadImage } from "../../api/uploads.js";
import { getMyProfile, updateMyProfile } from "../../api/users.js";
import { useAuth } from "../../context/AuthContext.jsx";
import Alert from "../../components/common/Alert.jsx";
import Button from "../../components/common/Button.jsx";
import ErrorState from "../../components/common/ErrorState.jsx";
import FormField from "../../components/common/FormField.jsx";
import PageLoader from "../../components/common/PageLoader.jsx";

export default function ProfilePage() {
  const { token, refreshSession } = useAuth();
  const [profile, setProfile] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [error, setError] = useState(false);

  const [displayName, setDisplayName] = useState("");
  const [introduction, setIntroduction] = useState("");
  const [facebookUrl, setFacebookUrl] = useState("");
  const [discordContact, setDiscordContact] = useState("");
  const [lineContact, setLineContact] = useState("");
  const [defaultRules, setDefaultRules] = useState("");
  const [avatarUrl, setAvatarUrl] = useState(null);

  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savingRules, setSavingRules] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const fileInputRef = useRef(null);

  function load() {
    setError(false);
    setProfile(null);
    Promise.all([getMyGroupLeaderProfile(token), getMyProfile(token)])
      .then(([profileResponse, userResponse]) => {
        const data = profileResponse.data;
        setProfile(data);
        setUserProfile(userResponse.data);
        setDisplayName(data.display_name ?? "");
        setIntroduction(data.introduction ?? "");
        setFacebookUrl(data.facebook_url ?? "");
        setDiscordContact(data.discord_contact ?? "");
        setLineContact(data.line_contact ?? "");
        setDefaultRules(data.default_rules ?? "");
        setAvatarUrl(userResponse.data.avatar_url);
      })
      .catch(() => setError(true));
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleAvatarChange(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const uploadResponse = await uploadImage(file, "avatar", token);
      await updateMyProfile({ avatar_url: uploadResponse.data.url }, token);
      setAvatarUrl(uploadResponse.data.url);
    } catch {
      setFeedback({ type: "error", message: "頭像上傳失敗，請稍後再試。" });
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  }

  async function handleSaveProfile(event) {
    event.preventDefault();
    setSaving(true);
    setFeedback(null);
    try {
      await updateMyGroupLeaderProfile(
        {
          display_name: profile.display_name ? undefined : displayName,
          introduction,
          facebook_url: facebookUrl || null,
          discord_contact: discordContact || null,
          line_contact: lineContact || null,
        },
        token,
      );
      setFeedback({ type: "success", message: "團主資料已儲存。" });
      await refreshSession();
      load();
    } catch (err) {
      setFeedback({ type: "error", message: err.message ?? "儲存時發生錯誤，請稍後再試。" });
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveRules() {
    setSavingRules(true);
    setFeedback(null);
    try {
      await updateMyDefaultRules(defaultRules, token);
      setFeedback({ type: "success", message: "預設團規已更新。" });
    } catch (err) {
      setFeedback({ type: "error", message: err.message ?? "儲存時發生錯誤，請稍後再試。" });
    } finally {
      setSavingRules(false);
    }
  }

  if (error) {
    return <ErrorState onRetry={load} />;
  }

  if (!profile || !userProfile) {
    return <PageLoader />;
  }

  return (
    <>
      <div className="page-header">
        <h1>團主資料管理</h1>
        <p className="helper-text">完善您的公開資料，讓團員更了解您並信任您的開團服務。</p>
      </div>

      {feedback && <Alert type={feedback.type}>{feedback.message}</Alert>}

      {!profile.is_profile_complete && (
        <Alert type="error">
          尚未完成公開資料設定：請設定團主公開名稱並至少填寫一項公開聯絡方式，完成後才能開團、發布公告。
        </Alert>
      )}

      <div className="two-col-section">
        <div className="group-buy-card">
          <div className="group-buy-card-row" style={{ marginBottom: "1rem" }}>
            {avatarUrl ? (
              <img className="avatar-circle" style={{ width: "4.5rem", height: "4.5rem", fontSize: "1.5rem" }} src={avatarUrl} alt="" />
            ) : (
              <span className="avatar-circle" style={{ width: "4.5rem", height: "4.5rem", fontSize: "1.5rem" }} aria-hidden="true">
                {displayName?.[0] ?? "?"}
              </span>
            )}
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={handleAvatarChange}
              />
              <Button type="button" variant="secondary" loading={uploading} onClick={() => fileInputRef.current?.click()}>
                更換頭像
              </Button>
            </div>
          </div>

          <form onSubmit={handleSaveProfile}>
            <FormField label="團主公開名稱（設定後不可修改）" htmlFor="gl-display-name" required>
              <input
                id="gl-display-name"
                value={displayName}
                disabled={Boolean(profile.display_name)}
                onChange={(event) => setDisplayName(event.target.value)}
                required
              />
            </FormField>

            <FormField label="自我介紹" htmlFor="gl-intro">
              <textarea
                id="gl-intro"
                rows={4}
                maxLength={300}
                value={introduction}
                onChange={(event) => setIntroduction(event.target.value)}
              />
            </FormField>

            <FormField label="Facebook" htmlFor="gl-facebook">
              <input id="gl-facebook" value={facebookUrl} onChange={(event) => setFacebookUrl(event.target.value)} />
            </FormField>
            <FormField label="Discord" htmlFor="gl-discord">
              <input id="gl-discord" value={discordContact} onChange={(event) => setDiscordContact(event.target.value)} />
            </FormField>
            <FormField label="LINE" htmlFor="gl-line">
              <input id="gl-line" value={lineContact} onChange={(event) => setLineContact(event.target.value)} />
            </FormField>
            <p className="helper-text">請至少提供一種公開聯絡方式，方便團員與您聯繫。</p>

            <Button type="submit" fullWidth loading={saving}>
              儲存變更
            </Button>
          </form>
        </div>

        <div className="group-buy-card">
          <h2 className="section-title">預設團規</h2>
          <p className="helper-text">此內容將顯示於您的開團頁面，請清楚說明您的開團規則。</p>
          <textarea
            rows={12}
            maxLength={500}
            value={defaultRules}
            onChange={(event) => setDefaultRules(event.target.value)}
            style={{ width: "100%" }}
          />
          <p className="helper-text" style={{ textAlign: "right" }}>{defaultRules.length} / 500</p>
          <Button fullWidth loading={savingRules} onClick={handleSaveRules}>
            儲存預設團規
          </Button>
        </div>
      </div>
    </>
  );
}
