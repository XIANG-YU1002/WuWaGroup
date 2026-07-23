import { useEffect, useState } from "react";
import {
  createAdminAnnouncement,
  deleteAdminAnnouncement,
  getAdminAnnouncements,
  updateAdminAnnouncement,
} from "../../api/adminAnnouncements.js";
import { useAuth } from "../../context/AuthContext.jsx";
import { ApiError } from "../../api/client.js";
import Alert from "../../components/common/Alert.jsx";
import Button from "../../components/common/Button.jsx";
import ConfirmModal from "../../components/common/ConfirmModal.jsx";
import EmptyState from "../../components/common/EmptyState.jsx";
import ErrorState from "../../components/common/ErrorState.jsx";
import PageLoader from "../../components/common/PageLoader.jsx";
import Pagination from "../../components/common/Pagination.jsx";

function formatDateTime(isoString) {
  return new Date(isoString).toLocaleString("zh-TW", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Taipei",
  });
}

const EMPTY_FORM = { title: "", content: "" };

export default function AnnouncementListPage() {
  const { token } = useAuth();
  const [page, setPage] = useState(1);
  const [announcements, setAnnouncements] = useState(null);
  const [pagination, setPagination] = useState(null);
  const [error, setError] = useState(false);

  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  function load() {
    setError(false);
    setAnnouncements(null);
    getAdminAnnouncements(token, { page })
      .then((response) => {
        setAnnouncements(response.data);
        setPagination(response.pagination);
      })
      .catch(() => setError(true));
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  function openCreateForm() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setSubmitError(null);
    setShowForm(true);
  }

  function openEditForm(announcement) {
    setEditingId(announcement.id);
    setForm({ title: announcement.title, content: announcement.content });
    setSubmitError(null);
    setShowForm(true);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setSubmitError(null);
    try {
      if (editingId) {
        await updateAdminAnnouncement(editingId, form, token);
      } else {
        await createAdminAnnouncement(form, token);
      }
      setShowForm(false);
      load();
    } catch (err) {
      setSubmitError(err instanceof ApiError ? err.message : "發布公告時發生錯誤，請稍後再試。");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      await deleteAdminAnnouncement(deleteTarget, token);
      setDeleteTarget(null);
      load();
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <div className="group-buy-card-row">
        <div>
          <h1>平台公告管理</h1>
          <p className="helper-text">管理平台公告內容，系統將依全部會員發送站內通知。</p>
        </div>
        <Button onClick={openCreateForm}>+ 新增公告</Button>
      </div>

      <div className="two-col-section">
        <div>
          {error ? (
            <ErrorState onRetry={load} />
          ) : announcements === null ? (
            <PageLoader />
          ) : announcements.length === 0 ? (
            <EmptyState title="尚未發布任何平台公告。" />
          ) : (
            <>
              {announcements.map((announcement) => (
                <div key={announcement.id} className="group-buy-card">
                  <div className="group-buy-card-row">
                    <h3 style={{ margin: 0 }}>{announcement.title}</h3>
                    <span className="helper-text" style={{ marginLeft: "auto" }}>
                      {formatDateTime(announcement.published_at)}
                    </span>
                  </div>
                  <p>{announcement.content}</p>
                  <p className="helper-text">通知對象人數：{announcement.recipient_count}</p>
                  <div className="group-buy-card-row">
                    <Button variant="secondary" onClick={() => openEditForm(announcement)}>
                      編輯
                    </Button>
                    <Button variant="danger" onClick={() => setDeleteTarget(announcement.id)}>
                      刪除
                    </Button>
                  </div>
                </div>
              ))}
              <Pagination page={pagination.page} totalPages={pagination.total_pages} onPageChange={setPage} />
            </>
          )}
        </div>

        {showForm && (
          <div className="group-buy-card">
            <div className="group-buy-card-row">
              <h2 className="section-title" style={{ marginBottom: 0 }}>
                {editingId ? "編輯公告" : "新增公告"}
              </h2>
              <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)}>
                ✕
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-field">
                <label>公告標題</label>
                <input
                  maxLength={80}
                  value={form.title}
                  onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
                  required
                />
              </div>
              <div className="form-field">
                <label>公告內容</label>
                <textarea
                  rows={8}
                  maxLength={2000}
                  value={form.content}
                  onChange={(event) => setForm((prev) => ({ ...prev, content: event.target.value }))}
                  required
                />
              </div>
              <p className="helper-text">通知對象：全部已註冊會員。</p>

              {submitError && <Alert type="error">{submitError}</Alert>}

              <div className="group-buy-card-row">
                <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>
                  取消
                </Button>
                <Button type="submit" loading={submitting}>
                  {editingId ? "儲存變更" : "發布公告"}
                </Button>
              </div>
            </form>
          </div>
        )}
      </div>

      {deleteTarget && (
        <ConfirmModal
          title="刪除公告"
          message="確定要刪除此平台公告嗎？相關通知也會一併移除，此操作無法復原。"
          confirmLabel="確定刪除"
          danger
          loading={deleting}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
        />
      )}
    </>
  );
}
