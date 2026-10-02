import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "react-toastify";
import Card from "@/components/ui/Card";
import Textinput from "@/components/ui/Textinput";
import Button from "@/components/ui/Button";
import Icon from "@/components/ui/Icon";
import HomeBredCurbs from "./HomeBredCurbs";
import withdrawalService from "@/services/withdrawalService";
import profileService from "@/services/profileService";
import { setUser } from "@/store/authSlice";

const downloadInvoice = async (id) => {
  try {
    const blob = await withdrawalService.downloadInvoice(id);

    // If the server returned an error, the blob will contain a JSON body
    // rather than a PDF. Detect and surface the real message.
    const contentType = blob?.type || "";
    if (contentType.includes("application/json")) {
      const text = await blob.text();
      const data = JSON.parse(text);
      throw new Error(data?.message || "Failed to download invoice.");
    }

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `withdrawal-invoice-${id}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.parentNode.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (err) {
    const message =
      err?.response?.data?.message ||
      err?.message ||
      "Failed to download invoice.";
    toast.error(message);
  }
};

const WITHDRAWAL_MIN = 5;

const BANKS = [
  "Intesa Sanpaolo",
  "UniCredit",
  "Banco BPM",
  "BPER Banca",
  "Fineco",
  "Deutsche Bank",
  "Chase Bank",
];

const STATUS_STYLES = {
  pending: "bg-[#FFFAF1] text-[#FA916B] dark:bg-slate-700 dark:text-slate-300",
  approved: "bg-[#E6FFFA] text-[#50C793] dark:bg-slate-700 dark:text-slate-300",
  rejected: "bg-[#FFEEED] text-[#F1595C] dark:bg-slate-700 dark:text-slate-300",
};

const STATUS_LABELS = {
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
};

const Withdraw = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);

  // Bank details form state
  const [bankName, setBankName] = useState("");
  const [accountHolder, setAccountHolder] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
const [accountType, setAccountType] = useState("checking");

  // Withdrawal form state
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("bank_transfer");

  // History + loading state
  const [withdrawals, setWithdrawals] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [savingBank, setSavingBank] = useState(false);

  // Check whether the user has fully saved bank details
  const hasBankDetails = !!(
    user?.bank_name &&
    user?.bank_account_holder &&
    user?.bank_account_number
  );

  // Pre-fill bank details from the authenticated user's profile
  useEffect(() => {
    if (user) {
      setBankName(user.bank_name || "");
      setAccountHolder(user.bank_account_holder || "");
setAccountNumber(user.bank_account_number || "");
      setAccountType(user.account_type || "checking");
    }
  }, [user]);

  // Fetch withdrawal history on mount
  useEffect(() => {
    const load = async () => {
      try {
        const data = await withdrawalService.getWithdrawals();
        setWithdrawals(Array.isArray(data) ? data : []);
      } catch (err) {
        toast.error("Failed to load withdrawal history");
      } finally {
        setLoadingHistory(false);
      }
    };
    load();
  }, []);

  const handleSaveBankDetails = async (e) => {
    e.preventDefault();
    if (!bankName.trim() || !accountHolder.trim() || !accountNumber.trim()) {
      toast.error("Please fill in bank name, account holder, and account number.");
      return;
    }
    try {
      setSavingBank(true);
      const response = await profileService.updateWithdrawalDetails({
        bank_name: bankName.trim(),
        bank_account_holder: accountHolder.trim(),
bank_account_number: accountNumber.trim(),
        account_type: accountType,
      });
      dispatch(setUser({ ...user, ...response.user }));
      localStorage.setItem("user", JSON.stringify({ ...user, ...response.user }));
      toast.success("Bank details saved successfully");
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.errors?.bank_account_number?.[0] ||
        "Failed to save bank details";
      toast.error(message);
    } finally {
      setSavingBank(false);
    }
  };

  const handleSubmitWithdrawal = async (e) => {
    e.preventDefault();

    // Enforce that bank details must be saved first
    if (!hasBankDetails) {
      toast.error("Please save your account details first before requesting a withdrawal.");
      return;
    }

    const amountNum = parseFloat(amount);
    if (!amount || isNaN(amountNum) || amountNum < WITHDRAWAL_MIN) {
      toast.error(`Minimum withdrawal is $${WITHDRAWAL_MIN}.`);
      return;
    }
    if (amountNum > (user?.balance || 0)) {
      toast.error("Insufficient balance.");
      return;
    }

    try {
      setSubmitting(true);
      // The withdrawal details (bank info) are pulled automatically from the
      // user's saved profile by the backend, so we no longer send a free-text
      // details field.
      const response = await withdrawalService.createWithdrawal({
        amount: amountNum,
        method,
      });
      toast.success(response.message || "Withdrawal request submitted successfully.");
      setAmount("");
      // Refresh the user balance and the history list
      if (response.user) {
        dispatch(setUser({ ...user, ...response.user }));
        localStorage.setItem("user", JSON.stringify({ ...user, ...response.user }));
      }
      const data = await withdrawalService.getWithdrawals();
      setWithdrawals(Array.isArray(data) ? data : []);
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.errors?.amount?.[0] ||
        "Failed to submit withdrawal request";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const balance = user?.balance || 0;

  return (
    <div className="space-y-5">
      <HomeBredCurbs title="Withdraw" />

      {/* Balance summary */}
      <div className="grid grid-cols-12 gap-5">
        <div className="lg:col-span-4 col-span-12">
          <Card bodyClass="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-slate-500 dark:text-slate-300 font-light">
                  Available Balance
                </div>
                <div className="text-3xl font-semibold text-slate-900 dark:text-white mt-1">
                  ${balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>
              <div className="h-14 w-14 rounded-full bg-primary-500/10 flex items-center justify-center text-primary-500 text-2xl">
                <Icon icon="heroicons-outline:cash" />
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700 text-xs text-slate-500 dark:text-slate-400">
              Minimum withdrawal: <span className="font-medium text-slate-700 dark:text-slate-200">${WITHDRAWAL_MIN}</span>
            </div>
          </Card>
        </div>

        {/* Step 2: Request a Withdrawal — gated until bank details are saved */}
        <div className="lg:col-span-8 col-span-12">
          <Card
            title="Request a Withdrawal"
            subtitle={
              hasBankDetails
                ? "Your account details are saved. You can now request a withdrawal."
                : "Save your account details first to enable withdrawals."
            }
            bodyClass="p-6"
          >
            {!hasBankDetails && (
              <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-sm">
                <Icon icon="heroicons:information-circle" className="inline-block mr-2" />
                Please fill in and save your bank details below before requesting a withdrawal.
              </div>
            )}

            <form onSubmit={handleSubmitWithdrawal} className="space-y-4">
              <div className="grid md:grid-cols-2 col-span-1 gap-4">
                <Textinput
                  label="Amount (USD)"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter amount"
                  className="h-[48px]"
                  description={`Minimum $${WITHDRAWAL_MIN}`}
                  disabled={!hasBankDetails}
                />
                <div>
                  <label className="block capitalize form-label mb-2">Withdrawal Method</label>
                  <select
                    value={method}
                    onChange={(e) => setMethod(e.target.value)}
                    className="form-control py-2 h-[48px]"
                    disabled={!hasBankDetails}
                  >
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="crypto">Cryptocurrency</option>
                  </select>
                </div>
              </div>

              <Button
                type="submit"
                text="Submit Withdrawal"
                className="btn btn-dark block min-w-[180px] text-center"
                isLoading={submitting}
                disabled={!hasBankDetails}
              />
            </form>
          </Card>
        </div>
      </div>

      {/* Step 1: Account / Bank Details — must be saved first */}
      <Card
        title="Account Details"
        subtitle="Used for Bank Transfer withdrawals"
        bodyClass="p-6"
      >
        <form onSubmit={handleSaveBankDetails} className="space-y-4">
          <div className="grid md:grid-cols-2 col-span-1 gap-4">
            <div className="w-full">
              <label className="block capitalize form-label mb-2">Bank Name</label>
              <select
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                className="form-control py-2 h-[48px] w-full"
              >
                <option value="" disabled>
                  e.g. Chase Bank
                </option>
                {BANKS.map((bank) => (
                  <option key={bank} value={bank}>
                    {bank}
                  </option>
                ))}
              </select>
            </div>
            <Textinput
              label="Account Holder"
              value={accountHolder}
              onChange={(e) => setAccountHolder(e.target.value)}
              placeholder="Account Name"
              className="h-[48px]"
            />
<Textinput
              label="Account Number"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              placeholder="Account number"
              className="h-[48px]"
            />
          </div>

          <div className="w-full">
            <label className="block capitalize form-label mb-2">Account Type</label>
            <select
              value={accountType}
              onChange={(e) => setAccountType(e.target.value)}
              className="form-control py-2 h-[48px] w-full"
            >
              <option value="checking">Checking</option>
              <option value="savings">Savings</option>
            </select>
          </div>

          <Button
            type="submit"
            text="Save Account Details"
            className="btn btn-outline-dark block min-w-[180px] text-center"
            isLoading={savingBank}
          />
        </form>
      </Card>

      {/* Withdrawal history */}
      <Card title="Withdrawal History" bodyClass="p-6">
        {loadingHistory ? (
          <div className="text-center py-8 text-slate-500 dark:text-slate-400">Loading...</div>
        ) : withdrawals.length === 0 ? (
          <div className="text-center py-8 text-slate-500 dark:text-slate-400">
            No withdrawals yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100 dark:divide-slate-700">
              <thead>
                <tr className="text-left text-xs uppercase text-slate-500 dark:text-slate-400">
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Method</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3 text-right">Invoice</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {withdrawals.map((w) => (
                  <tr key={w.id} className="text-sm">
                    <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">
                      ${Number(w.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300 capitalize">
                      {(w.method || "bank_transfer").replace(/_/g, " ")}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-1 rounded text-xs font-medium capitalize ${STATUS_STYLES[w.status] || "bg-slate-100 text-slate-600"}`}>
                        {STATUS_LABELS[w.status] || w.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500 dark:text-slate-400">
                      {w.created_at ? new Date(w.created_at).toLocaleDateString() : "—"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => downloadInvoice(w.id)}
                        className="inline-flex items-center gap-1 text-xs font-medium text-primary-500 hover:text-primary-600 transition-colors"
                        title="Download Invoice"
                      >
                        <Icon icon="heroicons-outline:document-arrow-down" className="text-base" />
                        <span>Download</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};

export default Withdraw;
