import React, { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { RefreshCw, Building2, CreditCard, UserRound, Hash, MapPinned, Send, BadgeIndianRupee } from "lucide-react";
import { getCompanyBankDetails, saveCompanyBankDetails } from "../../service/apiService";
import "./PanCardManagement.css";

const defaultForm = {
  account_holder_name: "",
  account_number: "",
  ifsc: "",
  pan_card_number: "",
  gst: "",
  bank_name: "",
  branch_name: "",
  upi_id: "",
};

const normalizePan = (value) => String(value || "").toUpperCase().replace(/\s+/g, "");
const normalizeIfsc = (value) => String(value || "").toUpperCase().replace(/\s+/g, "");
const normalizeAccount = (value) => String(value || "").replace(/\D+/g, "");

function CompanyBankDetailsManagement() {
  const [form, setForm] = useState(defaultForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [recordId, setRecordId] = useState(null);

  const loadDetails = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getCompanyBankDetails();

      if (res.success) {
        const data = res.data || null;

        setRecordId(data?.id ?? null);
        setForm({
          account_holder_name: data?.account_holder_name || "",
          account_number: data?.account_number || "",
          ifsc: data?.ifsc || "",
          pan_card_number: data?.pan_card_number || "",
          gst: data?.gst || "",
          bank_name: data?.bank_name || "",
          branch_name: data?.branch_name || "",
          upi_id: data?.upi_id || "",
        });
      } else {
        toast.error(res.message || "Failed to load company bank details");
      }
    } catch {
      toast.error("Server error while loading company bank details");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDetails();
  }, [loadDetails]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]:
        name === "pan_card_number"
          ? normalizePan(value)
          : name === "ifsc"
            ? normalizeIfsc(value)
            : name === "account_number"
              ? normalizeAccount(value)
              : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.account_holder_name.trim()) {
      toast.error("Account holder name is required");
      return;
    }

    if (!form.account_number.trim()) {
      toast.error("Account number is required");
      return;
    }

    if (form.ifsc.trim().length !== 11) {
      toast.error("Valid IFSC is required");
      return;
    }

    if (form.pan_card_number.trim() && !/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(form.pan_card_number.trim())) {
      toast.error("Valid PAN card number is required");
      return;
    }

    if (form.gst.trim() && !/^[0-9A-Z]{15}$/.test(form.gst.trim())) {
      toast.error("Valid GST number is required");
      return;
    }

    setSaving(true);

    try {
      const res = await saveCompanyBankDetails({
        account_holder_name: form.account_holder_name.trim(),
        account_number: form.account_number.trim(),
        ifsc: form.ifsc.trim(),
        pan_card_number: form.pan_card_number.trim(),
        gst: form.gst.trim(),
        bank_name: form.bank_name.trim(),
        branch_name: form.branch_name.trim(),
        upi_id: form.upi_id.trim(),
      });

      if (res.success) {
        toast.success(res.message || "Company bank details saved successfully");
        await loadDetails();
      } else {
        toast.error(res.message || "Failed to save company bank details");
      }
    } catch {
      toast.error("Server error while saving company bank details");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="admin-pan-card-management">
      <div className="admin-pan-card-management__header">
        <div>
          <h2 className="admin-pan-card-management__title">Company Bank Details</h2>
          <p className="admin-pan-card-management__subtitle">
            Add, edit, or update the active company bank record used across the app.
          </p>
        </div>
        <button
          type="button"
          className="admin-pan-card-management__button admin-pan-card-management__button--secondary"
          onClick={loadDetails}
          disabled={loading || saving}
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      <div className="admin-pan-card-management__panel">
        {loading ? (
          <p className="admin-pan-card-management__loading">Loading company bank details...</p>
        ) : (
          <form className="admin-pan-card-management__form" onSubmit={handleSubmit}>
            <div className="admin-pan-card-management__summary">
              <div>
                <span>Record ID</span>
                <strong>{recordId || "New Record"}</strong>
              </div>
              <div>
                <span>Status</span>
                <strong>Active</strong>
              </div>
              <div>
                <span>Editable</span>
                <strong>Yes</strong>
              </div>
            </div>

            <div className="admin-pan-card-management__grid">
              <label className="admin-pan-card-management__field">
                <span><UserRound size={14} /> Account Holder Name</span>
                <div className="admin-pan-card-management__input-wrap">
                  <input
                    type="text"
                    name="account_holder_name"
                    value={form.account_holder_name}
                    onChange={handleChange}
                    placeholder="Enter account holder name"
                  />
                </div>
              </label>

              <label className="admin-pan-card-management__field">
                <span><Hash size={14} /> Account Number</span>
                <div className="admin-pan-card-management__input-wrap">
                  <input
                    type="text"
                    name="account_number"
                    value={form.account_number}
                    onChange={handleChange}
                    placeholder="Enter account number"
                  />
                </div>
              </label>

              <label className="admin-pan-card-management__field">
                <span><MapPinned size={14} /> IFSC</span>
                <div className="admin-pan-card-management__input-wrap">
                  <input
                    type="text"
                    name="ifsc"
                    value={form.ifsc}
                    onChange={handleChange}
                    placeholder="Enter IFSC code"
                    maxLength={11}
                  />
                </div>
              </label>

              <label className="admin-pan-card-management__field">
                <span><CreditCard size={14} /> PAN Card Number</span>
                <div className="admin-pan-card-management__input-wrap">
                  <input
                    type="text"
                    name="pan_card_number"
                    value={form.pan_card_number}
                    onChange={handleChange}
                    placeholder="ABCDE1234F"
                    maxLength={10}
                  />
                </div>
              </label>

              <label className="admin-pan-card-management__field">
                <span><BadgeIndianRupee size={14} /> GST Number</span>
                <div className="admin-pan-card-management__input-wrap">
                  <input
                    type="text"
                    name="gst"
                    value={form.gst}
                    onChange={handleChange}
                    placeholder="22AAAAA0000A1Z5"
                    maxLength={15}
                  />
                </div>
              </label>

              <label className="admin-pan-card-management__field">
                <span><Building2 size={14} /> Bank Name</span>
                <div className="admin-pan-card-management__input-wrap">
                  <input
                    type="text"
                    name="bank_name"
                    value={form.bank_name}
                    onChange={handleChange}
                    placeholder="Enter bank name"
                  />
                </div>
              </label>

              <label className="admin-pan-card-management__field admin-pan-card-management__field--full">
                <span><MapPinned size={14} /> Branch Name</span>
                <div className="admin-pan-card-management__input-wrap">
                  <input
                    type="text"
                    name="branch_name"
                    value={form.branch_name}
                    onChange={handleChange}
                    placeholder="Enter branch name"
                  />
                </div>
              </label>

              <label className="admin-pan-card-management__field admin-pan-card-management__field--full">
                <span><Send size={14} /> UPI ID</span>
                <div className="admin-pan-card-management__input-wrap">
                  <input
                    type="text"
                    name="upi_id"
                    value={form.upi_id}
                    onChange={handleChange}
                    placeholder="Enter UPI ID"
                  />
                </div>
              </label>
            </div>

            <p className="admin-pan-card-management__hint">
              PAN is optional, but if provided it must follow the standard format: ABCDE1234F. GST is optional, but if provided it must be 15 alphanumeric characters.
            </p>

            <div className="admin-pan-card-management__actions">
              <button
                type="button"
                className="admin-pan-card-management__button admin-pan-card-management__button--ghost"
                onClick={() => setForm(defaultForm)}
                disabled={saving}
              >
                Clear Form
              </button>
              <button
                type="submit"
                className="admin-pan-card-management__button admin-pan-card-management__button--primary"
                disabled={saving}
              >
                {saving ? "Saving..." : recordId ? "Update Company Details" : "Save Company Details"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default CompanyBankDetailsManagement;
