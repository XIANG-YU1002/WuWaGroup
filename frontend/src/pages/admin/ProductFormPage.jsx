import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getActivities } from "../../api/activities.js";
import { getCharacterSuggestions } from "../../api/adminCharacters.js";
import {
  addAdminProductImage,
  createAdminProduct,
  deleteAdminProductImage,
  getAdminProductDetail,
  reorderAdminProductImages,
  updateAdminProduct,
} from "../../api/adminProducts.js";
import { uploadImage } from "../../api/uploads.js";
import { useAuth } from "../../context/AuthContext.jsx";
import { ApiError } from "../../api/client.js";
import MediaImage from "../../components/common/MediaImage.jsx";
import Alert from "../../components/common/Alert.jsx";
import Button from "../../components/common/Button.jsx";
import ErrorState from "../../components/common/ErrorState.jsx";
import FormField from "../../components/common/FormField.jsx";
import PageLoader from "../../components/common/PageLoader.jsx";

export default function ProductFormPage() {
  const { productId } = useParams();
  const isEdit = Boolean(productId);
  const { token } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(isEdit);
  const [error, setError] = useState(false);

  const [activities, setActivities] = useState([]);
  const [activityId, setActivityId] = useState("");
  const [name, setName] = useState("");
  const [officialPrice, setOfficialPrice] = useState("");
  const [officialCurrency, setOfficialCurrency] = useState("TWD");
  const [primaryImageUrl, setPrimaryImageUrl] = useState("");
  const [selectedCharacters, setSelectedCharacters] = useState([]);
  const [characterQuery, setCharacterQuery] = useState("");
  const [characterSuggestions, setCharacterSuggestions] = useState([]);

  const [extraImages, setExtraImages] = useState([]);

  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const primaryFileInputRef = useRef(null);
  const extraFileInputRef = useRef(null);

  useEffect(() => {
    getActivities({ pageSize: 50 }).then((response) => setActivities(response.data));
  }, []);

  function load() {
    setError(false);
    setLoading(true);
    getAdminProductDetail(productId, token)
      .then((response) => {
        const data = response.data;
        setActivityId(data.activity.id);
        setName(data.name);
        setOfficialPrice(data.official_price ?? "");
        setOfficialCurrency(data.official_currency ?? "TWD");
        setPrimaryImageUrl(data.primary_image_url);
        setSelectedCharacters(data.characters.map((c) => ({ id: c.id, name: c.name })));
        setExtraImages(data.images);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    if (isEdit) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  useEffect(() => {
    if (!characterQuery.trim()) {
      setCharacterSuggestions([]);
      return;
    }
    getCharacterSuggestions(characterQuery.trim(), 10, token)
      .then((response) => setCharacterSuggestions(response.data))
      .catch(() => setCharacterSuggestions([]));
  }, [characterQuery, token]);

  function addCharacter(character) {
    if (selectedCharacters.some((c) => (c.id ?? c.new_name) === (character.id ?? character.new_name))) {
      return;
    }
    setSelectedCharacters((prev) => [...prev, character]);
    setCharacterQuery("");
    setCharacterSuggestions([]);
  }

  function removeCharacter(character) {
    setSelectedCharacters((prev) =>
      prev.filter((c) => (c.id ?? c.new_name) !== (character.id ?? character.new_name)),
    );
  }

  const hasExactSuggestionMatch = characterSuggestions.some(
    (suggestion) => suggestion.name.toLowerCase() === characterQuery.trim().toLowerCase(),
  );

  async function handlePrimaryImageChange(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const response = await uploadImage(file, "product", token);
      setPrimaryImageUrl(response.data.url);
    } catch {
      setSubmitError("圖片上傳失敗，請稍後再試。");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  }

  async function handleAddExtraImage(event) {
    const file = event.target.files?.[0];
    if (!file || !isEdit) return;
    setUploading(true);
    try {
      const uploadResponse = await uploadImage(file, "product", token);
      const addResponse = await addAdminProductImage(productId, uploadResponse.data.url, token);
      setExtraImages(addResponse.data.images);
    } catch (err) {
      setSubmitError(err instanceof ApiError ? err.message : "新增圖片時發生錯誤。");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  }

  async function handleDeleteExtraImage(imageId) {
    try {
      const response = await deleteAdminProductImage(productId, imageId, token);
      setExtraImages(response.data.images);
    } catch (err) {
      setSubmitError(err instanceof ApiError ? err.message : "刪除圖片時發生錯誤。");
    }
  }

  async function handleMoveImage(index, direction) {
    const newOrder = [...extraImages];
    const target = index + direction;
    if (target < 0 || target >= newOrder.length) return;
    [newOrder[index], newOrder[target]] = [newOrder[target], newOrder[index]];
    setExtraImages(newOrder);
    try {
      const response = await reorderAdminProductImages(
        productId,
        newOrder.map((image) => image.id),
        token,
      );
      setExtraImages(response.data.images);
    } catch (err) {
      setSubmitError(err instanceof ApiError ? err.message : "調整順序時發生錯誤。");
      load();
    }
  }

  function buildCharacterPayload() {
    return selectedCharacters.map((c) => (c.id ? { id: c.id } : { new_name: c.new_name }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setSubmitError(null);
    try {
      const payload = {
        name,
        official_price: officialPrice === "" ? null : officialPrice,
        official_currency: officialPrice === "" ? null : officialCurrency,
        primary_image_url: primaryImageUrl,
        characters: buildCharacterPayload(),
      };
      if (isEdit) {
        await updateAdminProduct(productId, payload, token);
        navigate("/admin/products", { replace: true });
      } else {
        const response = await createAdminProduct({ activity_id: activityId, ...payload }, token);
        navigate(`/admin/products/${response.data.id}`, { replace: true });
      }
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
        <h1>{isEdit ? "商品編輯" : "商品新增"}</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-two-col">
          <FormField label="活動選擇" htmlFor="product-activity" required>
            <select
              id="product-activity"
              value={activityId}
              disabled={isEdit}
              onChange={(event) => setActivityId(event.target.value)}
              required
            >
              <option value="">請選擇活動</option>
              {activities.map((activity) => (
                <option key={activity.id} value={activity.id}>
                  {activity.name}
                </option>
              ))}
            </select>
          </FormField>

          <FormField label="商品名稱" htmlFor="product-name" required>
            <input id="product-name" value={name} onChange={(event) => setName(event.target.value)} required />
          </FormField>
        </div>

        <FormField label="官方價格（選填）" htmlFor="product-price">
          <div className="price-currency-row">
            <input
              id="product-price"
              type="number"
              min="0"
              step="0.01"
              placeholder="請輸入金額"
              value={officialPrice}
              onChange={(event) => setOfficialPrice(event.target.value)}
            />
            <select
              className="price-currency-select"
              value={officialCurrency}
              onChange={(event) => setOfficialCurrency(event.target.value)}
              disabled={officialPrice === ""}
              aria-label="幣別"
            >
              <option value="TWD">TWD 新台幣</option>
              <option value="CNY">CNY 人民幣</option>
              <option value="JPY">JPY 日圓</option>
              <option value="KRW">KRW 韓元</option>
              <option value="USD">USD 美金</option>
            </select>
          </div>
          <p className="helper-text">選填官方定價；填入金額後可選擇幣別。</p>
        </FormField>

        <FormField label="主圖" htmlFor="product-primary-image" required>
          {primaryImageUrl && (
            <MediaImage
              src={primaryImageUrl}
              alt=""
              style={{ width: "8rem", height: "8rem", objectFit: "cover", borderRadius: "var(--radius)", marginBottom: "0.5rem" }}
            />
          )}
          <input
            ref={primaryFileInputRef}
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={handlePrimaryImageChange}
          />
          <Button type="button" variant="secondary" loading={uploading} onClick={() => primaryFileInputRef.current?.click()}>
            {primaryImageUrl ? "更換主圖" : "上傳主圖"}
          </Button>
        </FormField>

        {isEdit && (
          <FormField label="額外圖片" htmlFor="product-extra-images">
            <div className="group-buy-card-row">
              {extraImages.map((image, index) => (
                <div key={image.id} style={{ position: "relative" }}>
                  <MediaImage
                    src={image.image_url}
                    alt=""
                    style={{ width: "5rem", height: "5rem", objectFit: "cover", borderRadius: "var(--radius)" }}
                  />
                  <div className="group-buy-card-row" style={{ marginTop: "0.25rem" }}>
                    <button type="button" className="btn btn-ghost" disabled={index === 0} onClick={() => handleMoveImage(index, -1)}>
                      ↑
                    </button>
                    <button type="button" className="btn btn-ghost" disabled={index === extraImages.length - 1} onClick={() => handleMoveImage(index, 1)}>
                      ↓
                    </button>
                    <button type="button" className="btn btn-ghost" onClick={() => handleDeleteExtraImage(image.id)}>
                      刪除
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <input
              ref={extraFileInputRef}
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleAddExtraImage}
            />
            <Button type="button" variant="secondary" loading={uploading} onClick={() => extraFileInputRef.current?.click()}>
              + 上傳圖片
            </Button>
          </FormField>
        )}

        <FormField label="關聯角色" htmlFor="product-character-search">
          <div className="group-buy-card-row" style={{ marginBottom: "0.5rem" }}>
            {selectedCharacters.map((character) => (
              <span key={character.id ?? character.new_name} className="status-badge status-badge-info">
                {character.name ?? character.new_name}
                <button
                  type="button"
                  onClick={() => removeCharacter(character)}
                  style={{ marginLeft: "0.35rem", background: "none", border: "none", cursor: "pointer" }}
                >
                  ✕
                </button>
              </span>
            ))}
          </div>
          <input
            id="product-character-search"
            placeholder="搜尋或新增角色"
            value={characterQuery}
            onChange={(event) => setCharacterQuery(event.target.value)}
          />
          {characterQuery.trim() && (
            <div className="group-buy-card" style={{ marginTop: "0.4rem" }}>
              {characterSuggestions.map((suggestion) => (
                <div key={suggestion.id}>
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={() => addCharacter({ id: suggestion.id, name: suggestion.name })}
                  >
                    {suggestion.name}（關聯商品 {suggestion.related_product_count} 項）
                  </button>
                </div>
              ))}
              {!hasExactSuggestionMatch && (
                <button
                  type="button"
                  className="btn btn-link"
                  onClick={() => addCharacter({ new_name: characterQuery.trim(), name: characterQuery.trim() })}
                >
                  找不到想要的角色？新增角色「{characterQuery.trim()}」＋
                </button>
              )}
            </div>
          )}
        </FormField>

        {submitError && <Alert type="error">{submitError}</Alert>}

        <Button type="submit" loading={saving} disabled={!primaryImageUrl || !activityId}>
          {isEdit ? "儲存商品" : "建立商品"}
        </Button>
      </form>
    </>
  );
}
