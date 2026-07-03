import React, { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { getUpdateNotice, saveUpdateNotice } from "../../service/apiService";
import "./UpdateNoticeManagement.css";

const defaultForm = {
  notice_key: "",
  is_enabled: true,
  title: "Update Available",
  message: "A new app update is available.",
  primary_label: "Update Now",
  play_store_url: "https://play.google.com/store/apps/details?id=com.semicoloninnovations.upstores",
  version_tag: "",
  start_at: "",
  end_at: "",
};

const toDateTimeLocal = (value) => {
  if (!value) return "";
  return value.replace(" ", "T").slice(0, 16);
};

const toApiDateTime = (value) => {
  if (!value) return "";
  return value.replace("T", " ") + ":00";
};

function UpdateNoticeManagement() {
  const [form, setForm] = useState(defaultForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadNotice = useCallback(async () => {
    setLoading(true);

    try {
      const res = await getUpdateNotice();

      if (res.success && res.data) {
        const notice = res.data;

        setForm({
          notice_key: notice.noticeKey || "",
          is_enabled: Boolean(notice.enabled),
          title: notice.title || defaultForm.title,
          message: notice.message || defaultForm.message,
          primary_label: notice.primaryLabel || defaultForm.primary_label,
          play_store_url: notice.playStoreUrl || defaultForm.play_store_url,
          version_tag: notice.versionTag || "",
          start_at: toDateTimeLocal(notice.startAt),
          end_at: toDateTimeLocal(notice.endAt),
        });
      } else {
        toast.error(res.message || "Failed to load update notice");
      }
    } catch {
      toast.error("Server error while loading update notice");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNotice();
  }, [loadNotice]);

  const handleChange = (event) => {
    const { name, value, checked, type } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.notice_key.trim()) {
      toast.error("Notice key is required");
      return;
    }

    setSaving(true);

    try {
      const payload = {
        notice_key: form.notice_key.trim(),
        is_enabled: form.is_enabled,
        title: form.title.trim(),
        message: form.message.trim(),
        primary_label: form.primary_label.trim() || "Update Now",
        play_store_url: form.play_store_url.trim(),
        version_tag: form.version_tag.trim(),
        start_at: toApiDateTime(form.start_at),
        end_at: toApiDateTime(form.end_at),
      };

      const res = await saveUpdateNotice(payload);

      if (res.success) {
        toast.success(res.message || "Update notice saved successfully");
        await loadNotice();
      } else {
        toast.error(res.message || "Failed to save update notice");
      }
    } catch {
      toast.error("Server error while saving update notice");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="update-notice-management">
      <div className="update-notice-management__header">
        <h2 className="update-notice-management__title">Update Notice</h2>
        <button
          type="button"
          className="update-notice-management__button update-notice-management__button--secondary"
          onClick={loadNotice}
          disabled={loading || saving}
        >
          Refresh
        </button>
      </div>

      <div className="update-notice-management__panel">
        {loading ? (
          <p className="update-notice-management__loading">Loading update notice...</p>
        ) : (
          <form className="update-notice-management__form" onSubmit={handleSubmit}>
            <label className="update-notice-management__toggle">
              <input
                type="checkbox"
                name="is_enabled"
                checked={form.is_enabled}
                onChange={handleChange}
              />
              <span>Enable update notice</span>
            </label>

            <div className="update-notice-management__grid">
              <label className="update-notice-management__field">
                <span>Notice Key</span>
                <input
                  type="text"
                  name="notice_key"
                  value={form.notice_key}
                  onChange={handleChange}
                  placeholder="2026-06-22-release-2"
                  required
                />
              </label>

              <label className="update-notice-management__field">
                <span>Version Tag</span>
                <input
                  type="text"
                  name="version_tag"
                  value={form.version_tag}
                  onChange={handleChange}
                  placeholder="1.0.0"
                />
              </label>
            </div>

            <label className="update-notice-management__field">
              <span>Title</span>
              <input
                type="text"
                name="title"
                value={form.title}
                onChange={handleChange}
                required
              />
            </label>

            <label className="update-notice-management__field">
              <span>Message</span>
              <textarea
                name="message"
                value={form.message}
                onChange={handleChange}
                required
              />
            </label>

            <div className="update-notice-management__grid">
              <label className="update-notice-management__field">
                <span>Button Label</span>
                <input
                  type="text"
                  name="primary_label"
                  value={form.primary_label}
                  onChange={handleChange}
                  placeholder="Update Now"
                />
              </label>

              <label className="update-notice-management__field">
                <span>Play Store URL</span>
                <input
                  type="url"
                  name="play_store_url"
                  value={form.play_store_url}
                  onChange={handleChange}
                  required
                />
              </label>
            </div>

            <div className="update-notice-management__grid">
              <label className="update-notice-management__field">
                <span>Start At</span>
                <input
                  type="datetime-local"
                  name="start_at"
                  value={form.start_at}
                  onChange={handleChange}
                />
              </label>

              <label className="update-notice-management__field">
                <span>End At</span>
                <input
                  type="datetime-local"
                  name="end_at"
                  value={form.end_at}
                  onChange={handleChange}
                />
              </label>
            </div>

            <div className="update-notice-management__actions">
              <button
                type="submit"
                className="update-notice-management__button update-notice-management__button--primary"
                disabled={saving}
              >
                {saving ? "Saving..." : "Save Update Notice"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default UpdateNoticeManagement;
