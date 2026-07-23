import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  createAdminActivity,
  getAdminActivityDetail,
  updateAdminActivity,
} from "../../api/adminActivities.js";
import { uploadImage } from "../../api/uploads.js";
import { useAuth } from "../../context/AuthContext.jsx";
import { ApiError } from "../../api/client.js";
import Alert from "../../components/common/Alert.jsx";
import Button from "../../components/common/Button.jsx";
import ErrorState from "../../components/common/ErrorState.jsx";
import FormField from "../../components/common/FormField.jsx";
import PageLoader from "../../components/common/PageLoader.jsx";

export default function ActivityFormPage() {
  const { activityId } = useParams();
  const isEdit = Boolean(activityId);
  const { token } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(isEdit);
  const [error, setError] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [hasFullGift, setHasFullGift] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const fileInputRef = useRef(null);

  function load() {
    setError(false);
    setLoading(true);
    getAdminActivityDetail(activityId, token)
      .then((response) => {
        const data = response.data;
        setName(data.name);
        setDescription(data.description ?? "");
        setImageUrl(data.image_url);
        setHasFullGift(data.has_full_gift);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    if (isEdit) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activityId]);

  async function handleImageChange(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const response = await uploadImage(file, "activity", token);
      setImageUrl(response.data.url);
    } catch {
      setSubmitError("圖片上傳失敗，請稍後再試。");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setSubmitError(null);
    try {
      if (isEdit) {
        await updateAdminActivity(
          activityId,
          { name, description: description || null, image_url: imageUrl, has_full_gift: hasFullGift },
          token,
        );
      } else {
        await createAdminActivity(
          { name, description: description || null, image_url: imageUrl, has_full_gift: hasFullGift },
          token,
        );
      }
      navigate("/admin/activities", { replace: true });
    } catch (err) {
      setSubmitError(err instanceof ApiError ? err.message : "儲存時發生錯誤，請稍後再試。");
    } finally {
      setSaving(false);
    }
  }

  if (error) {
    return <ErrorState onRetry={load} />;
  }

  if (loading) {
    return <PageLoader />;
  }

  return (
    <>
      <div className="page-header">
        <h1>{isEdit ? "活動編輯" : "活動新增"}</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <FormField label="活動名稱" htmlFor="activity-name" required>
          <input id="activity-name" value={name} onChange={(event) => setName(event.target.value)} required />
        </FormField>

        <FormField label="活動說明" htmlFor="activity-description">
          <textarea
            id="activity-description"
            rows={4}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />
        </FormField>

        <FormField label="活動封面圖片" htmlFor="activity-image" required>
          {imageUrl && (
            <img
              src={imageUrl}
              alt=""
              style={{ width: "100%", maxWidth: "320px", aspectRatio: "16/9", objectFit: "cover", borderRadius: "var(--radius)", marginBottom: "0.5rem" }}
            />
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={handleImageChange}
          />
          <Button type="button" variant="secondary" loading={uploading} onClick={() => fileInputRef.current?.click()}>
            {imageUrl ? "更換圖片" : "上傳圖片"}
          </Button>
        </FormField>

        <div className="form-field">
          <label>是否有滿贈</label>
          <label style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", marginRight: "1rem" }}>
            <input type="radio" checked={hasFullGift} onChange={() => setHasFullGift(true)} /> 有
          </label>
          <label style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
            <input type="radio" checked={!hasFullGift} onChange={() => setHasFullGift(false)} /> 無
          </label>
        </div>

        {submitError && <Alert type="error">{submitError}</Alert>}

        <Button type="submit" loading={saving} disabled={!imageUrl}>
          {isEdit ? "儲存活動" : "建立活動"}
        </Button>
      </form>
    </>
  );
}
