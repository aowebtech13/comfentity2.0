import React, { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import Card from "@/components/ui/Card";
import Textinput from "@/components/ui/Textinput";
import Button from "@/components/ui/Button";
import Icon from "@/components/ui/Icon";
import HomeBredCurbs from "./HomeBredCurbs";
import depositService from "@/services/depositService";

/**
 * DepositPage — manual, crypto-only deposits.
 *
 * Flow:
 *   1. Load the published wallet(s) + limits from GET /deposit-info.
 *   2. The user copies the wallet address (or scans its QR code).
 *   3. They pay from their own wallet or exchange — nothing is paid here.
 *   4. They come back and upload a screenshot of the completed payment.
 *   5. An administrator verifies it and approves, which credits the balance.
 *
 * The uploaded screenshot is the proof of payment. A transaction hash is never
 * required; it is accepted only to let the reviewer cross-check faster.
 *
 * Nothing is auto-verified: the deposit stays "pending" until a human checks
 * the payment, so the copy makes that expectation explicit.
 */
const DepositPage = () => {
  const user = useSelector((state) => state.auth.user);

  const [info, setInfo] = useState(null);
  const [loadingInfo, setLoadingInfo] = useState(true);
  const [infoError, setInfoError] = useState(null);

  // Selected wallet (defaults to the first one the backend publishes).
  const [selectedNetwork, setSelectedNetwork] = useState("");

  // Proof-of-payment form state.
  const [amount, setAmount] = useState("");
  const [txHash, setTxHash] = useState("");
  const [note, setNote] = useState("");
  const [receipt, setReceipt] = useState(null);
  const [receiptPreview, setReceiptPreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  // Deposit history.
  const [deposits, setDeposits] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  const wallets = info?.wallets ?? [];
  const activeWallet =
    wallets.find((w) => w.id === selectedNetwork) ?? wallets[0] ?? null;

  // Proof requirements are published once for every wallet (config/deposit.php).
  // Defaults mirror the server: the receipt is the proof, the hash is optional.
  const requiresTxHash = info?.requires_tx_hash ?? false;
  const requiresReceipt = info?.requires_receipt ?? true;

  const loadDepositInfo = useCallback(async () => {
    try {
      setLoadingInfo(true);
      setInfoError(null);
      const data = await depositService.getDepositInfo();
      setInfo(data);
      if (data?.wallets?.length) {
        setSelectedNetwork((current) => current || data.wallets[0].id);
      }
    } catch (err) {
      setInfoError(
        err?.response?.data?.message ||
          "Failed to load deposit details. Please refresh the page."
      );
    } finally {
      setLoadingInfo(false);
    }
  }, []);

  const loadDeposits = useCallback(async () => {
    try {
      const data = await depositService.getDeposits();
      setDeposits(Array.isArray(data) ? data : []);
    } catch (err) {
      // History is non-critical — the form still works without it.
      setDeposits([]);
    } finally {
      setLoadingHistory(false);
    }
  }, []);

  useEffect(() => {
    loadDepositInfo();
    loadDeposits();
  }, [loadDepositInfo, loadDeposits]);

  // Release the object URL when the preview is replaced/unmounted.
  useEffect(() => {
    return () => {
      if (receiptPreview) URL.revokeObjectURL(receiptPreview);
    };
  }, [receiptPreview]);

  const copyAddress = async () => {
    if (!activeWallet?.address) return;
    try {
      await navigator.clipboard.writeText(activeWallet.address);
      toast.success("Deposit address copied to clipboard");
    } catch (err) {
      toast.error("Could not copy the address. Please copy it manually.");
    }
  };

  const handleReceiptChange = (e) => {
    const file = e.target.files?.[0] ?? null;
    setFieldErrors((prev) => ({ ...prev, receipt: null }));

    if (receiptPreview) URL.revokeObjectURL(receiptPreview);
    setReceipt(file);
    setReceiptPreview(file ? URL.createObjectURL(file) : null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!activeWallet) {
      toast.error("No deposit wallet is available right now.");
      return;
    }

    const amountNum = parseFloat(amount);
    if (!amount || isNaN(amountNum) || amountNum <= 0) {
      toast.error("Please enter the amount you sent.");
      return;
    }
    if (info?.min_amount && amountNum < info.min_amount) {
      toast.error(`Minimum deposit is $${info.min_amount}.`);
      return;
    }
    if (info?.max_amount && amountNum > info.max_amount) {
      toast.error(`Maximum deposit is $${info.max_amount}.`);
      return;
    }
    if (requiresTxHash && !txHash.trim()) {
      toast.error("Please paste the transaction hash of your payment.");
      return;
    }
    if (requiresReceipt && !receipt) {
      toast.error(
        "Please upload a screenshot of your completed payment so we can verify it."
      );
      return;
    }

    try {
      setSubmitting(true);
      setFieldErrors({});

      const payload = new FormData();
      payload.append("amount", String(amountNum));
      payload.append("crypto_network", activeWallet.id);
      payload.append("crypto_address", activeWallet.address);
      // Optional on receipt-only networks, so it is only sent when present.
      if (txHash.trim()) payload.append("crypto_tx_hash", txHash.trim());
      if (note.trim()) payload.append("description", note.trim());
      if (receipt) payload.append("receipt", receipt);

      const response = await depositService.createDeposit(payload);

      toast.success(
        response?.message ||
          "Deposit proof submitted. An administrator will verify it shortly."
      );

      setAmount("");
      setTxHash("");
      setNote("");
      setReceipt(null);
      setReceiptPreview(null);
      if (receiptPreview) URL.revokeObjectURL(receiptPreview);

      await loadDeposits();
    } catch (error) {
      const errors = error?.response?.data?.errors ?? {};
      setFieldErrors({
        amount: errors.amount?.[0],
        crypto_tx_hash: errors.crypto_tx_hash?.[0],
        crypto_address: errors.crypto_address?.[0],
        receipt: errors.receipt?.[0],
      });

      toast.error(
        error?.response?.data?.message ||
          error?.response?.data?.errors?.crypto_tx_hash?.[0] ||
          error?.response?.data?.errors?.amount?.[0] ||
          "Failed to submit your deposit proof"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const STATUS_STYLES = {
    pending: "bg-[#FFFAF1] text-[#FA916B] dark:bg-slate-700 dark:text-slate-300",
    completed: "bg-[#E6FFFA] text-[#50C793] dark:bg-slate-700 dark:text-slate-300",
    cancelled: "bg-[#FFEEED] text-[#F1595C] dark:bg-slate-700 dark:text-slate-300",
  };

  const balance = user?.balance || 0;

  return (
    <div className="space-y-5">
      <HomeBredCurbs title="Deposit" />

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
                  $
                  {balance.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </div>
              </div>
              <div className="h-14 w-14 rounded-full bg-primary-500/10 flex items-center justify-center text-primary-500 text-2xl">
                <Icon icon="heroicons-outline:cash" />
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700 text-xs text-slate-500 dark:text-slate-400">
              {info ? (
                <>
                  Minimum deposit:{" "}
                  <span className="font-medium text-slate-700 dark:text-slate-200">
                    ${info.min_amount}
                  </span>
                  {info.max_amount ? (
                    <>
                      {" "}
                      &middot; Maximum:{" "}
                      <span className="font-medium text-slate-700 dark:text-slate-200">
                        ${info.max_amount}
                      </span>
                    </>
                  ) : null}
                </>
              ) : (
                "Loading deposit limits..."
              )}
            </div>
          </Card>
        </div>

        <div className="lg:col-span-8 col-span-12">
          <Card
            title="How deposits work"
            subtitle="Payments are verified manually by our finance team"
            bodyClass="p-6"
          >
            <ol className="space-y-4 text-sm text-slate-600 dark:text-slate-300">
              <li className="flex gap-3">
                <span className="flex-none w-6 h-6 rounded-full bg-primary-500/10 text-primary-500 flex items-center justify-center text-xs font-bold">
                  1
                </span>
                <span>
                  Copy the wallet address below, or scan its QR code. Only send
                  the exact network shown — funds sent on another network cannot
                  be recovered.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="flex-none w-6 h-6 rounded-full bg-primary-500/10 text-primary-500 flex items-center justify-center text-xs font-bold">
                  2
                </span>
                <span>
                  Pay from your own wallet or exchange. This happens outside our
                  website, so keep the confirmation or receipt it gives you.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="flex-none w-6 h-6 rounded-full bg-primary-500/10 text-primary-500 flex items-center justify-center text-xs font-bold">
                  3
                </span>
                <span>
                  Come back here and upload that screenshot with the amount you
                  sent. An administrator verifies it and your balance is
                  credited.
                </span>
              </li>
            </ol>
            <div className="mt-5 p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-sm">
              <Icon icon="heroicons:information-circle" className="inline-block mr-2" />
              Deposits are not automatic. Your balance is only updated after a
              human reviewer checks your payment screenshot, so please allow
              some time for verification.
            </div>
          </Card>
        </div>
      </div>

      {/* Wallet + proof submission */}
      <div className="grid grid-cols-12 gap-5">
        {/* Wallet */}
        <div className="lg:col-span-5 col-span-12">
          <Card title="Deposit Wallet" bodyClass="p-6">
            {loadingInfo ? (
              <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                Loading wallet...
              </div>
            ) : infoError ? (
              <div className="text-center py-8">
                <div className="text-danger-500 text-sm mb-4">{infoError}</div>
                <Button
                  text="Retry"
                  className="btn btn-outline-dark"
                  onClick={loadDepositInfo}
                />
              </div>
            ) : !activeWallet ? (
              <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                No deposit wallet is available right now. Please contact
                support.
              </div>
            ) : (
              <div className="space-y-5">
                {wallets.length > 1 && (
                  <div>
                    <label className="block capitalize form-label mb-2">
                      Network
                    </label>
                    <select
                      value={activeWallet.id}
                      onChange={(e) => setSelectedNetwork(e.target.value)}
                      className="form-control py-2 h-[48px] w-full"
                    >
                      {wallets.map((w) => (
                        <option key={w.id} value={w.id}>
                          {w.label} ({w.network})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="flex flex-col items-center text-center">
                  {activeWallet.qr_url && (
                    <div className="p-3 bg-white border border-slate-200 rounded-2xl">
                      <img
                        src={activeWallet.qr_url}
                        alt={`${activeWallet.label} deposit address QR code`}
                        className="w-[200px] h-[200px]"
                      />
                    </div>
                  )}

                  <span className="mt-4 text-xs uppercase tracking-widest text-slate-400 font-bold">
                    {activeWallet.symbol} &middot; {activeWallet.network} network
                  </span>

                  <div className="mt-2 w-full px-4 py-3 bg-slate-100 dark:bg-slate-900 rounded-xl break-all">
                    <code className="text-sm text-slate-700 dark:text-slate-200">
                      {activeWallet.address}
                    </code>
                  </div>

                  <button
                    type="button"
                    onClick={copyAddress}
                    className="btn btn-dark mt-4 inline-flex items-center gap-2"
                  >
                    <Icon icon="heroicons-outline:clipboard-document" />
                    Copy Address
                  </button>
                </div>

                {activeWallet.instructions && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-700 pt-4">
                    {activeWallet.instructions}
                  </p>
                )}
              </div>
            )}
          </Card>
        </div>

        {/* Proof of payment */}
        <div className="lg:col-span-7 col-span-12">
          <Card
            title="Submit Proof of Payment"
            subtitle="Required so an administrator can verify your deposit"
            bodyClass="p-6"
          >
            <form onSubmit={handleSubmit} className="space-y-4">
              <Textinput
                label={`Amount Sent (USD)${info?.min_amount ? ` — min $${info.min_amount}` : ""}`}
                type="number"
                step="0.01"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="h-[48px]"
                error={fieldErrors.amount}
              />

              <Textinput
                label={`Transaction Hash (TxID)${requiresTxHash ? "" : " — optional"}`}
                value={txHash}
                onChange={(e) => setTxHash(e.target.value)}
                placeholder="Paste the transaction hash of your payment"
                className="h-[48px]"
                error={fieldErrors.crypto_tx_hash}
                description="Optional — we verify your deposit from the payment screenshot. Add the hash only if you have it handy; it lets our reviewer cross-check the payment faster."
              />

              <div>
                <label className="block capitalize form-label mb-2">
                  Payment Screenshot{" "}
                  <span className="text-slate-400">
                    {requiresReceipt ? "(required)" : "(optional)"}
                  </span>
                </label>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/gif"
                  required={requiresReceipt}
                  onChange={handleReceiptChange}
                  className="form-control py-2 h-[48px] w-full"
                />
                {fieldErrors.receipt && (
                  <div className="text-danger-500 block text-sm mt-2">
                    {fieldErrors.receipt.message || fieldErrors.receipt}
                  </div>
                )}
                {receiptPreview && (
                  <div className="mt-3 flex items-center gap-3">
                    <img
                      src={receiptPreview}
                      alt="Payment screenshot preview"
                      className="w-20 h-20 object-cover rounded-lg border border-slate-200"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        URL.revokeObjectURL(receiptPreview);
                        setReceipt(null);
                        setReceiptPreview(null);
                      }}
                      className="text-xs text-danger-500 font-bold uppercase tracking-widest"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>

              <div>
                <label className="block capitalize form-label mb-2">
                  Note <span className="text-slate-400">(optional)</span>
                </label>
                <textarea
                  rows={3}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Anything the reviewer should know about this payment"
                  className="form-control py-2 w-full"
                />
              </div>

              <Button
                type="submit"
                text="Submit Deposit Proof"
                className="btn btn-dark block min-w-[200px] text-center"
                isLoading={submitting}
                disabled={loadingInfo || !activeWallet}
              />
            </form>
          </Card>
        </div>
      </div>

      {/* Deposit history */}
      <Card title="Deposit History" bodyClass="p-6">
        {loadingHistory ? (
          <div className="text-center py-8 text-slate-500 dark:text-slate-400">
            Loading...
          </div>
        ) : deposits.length === 0 ? (
          <div className="text-center py-8 text-slate-500 dark:text-slate-400">
            No deposits yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100 dark:divide-slate-700">
              <thead>
                <tr className="text-left text-xs uppercase text-slate-500 dark:text-slate-400">
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Network</th>
                  <th className="px-4 py-3">Tx Hash</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {deposits.map((d) => (
                  <tr key={d.id} className="text-sm">
                    <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">
                      $
                      {Number(d.amount).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                      {d.crypto_network || d.method || "—"}
                    </td>
                    <td className="px-4 py-3 text-slate-500 dark:text-slate-400 font-mono text-xs break-all max-w-[220px]">
                      {d.crypto_tx_hash || "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block px-2 py-1 rounded text-xs font-medium capitalize ${
                          STATUS_STYLES[d.status] ||
                          "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {d.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500 dark:text-slate-400">
                      {d.created_at
                        ? new Date(d.created_at).toLocaleDateString()
                        : "—"}
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

export default DepositPage;
