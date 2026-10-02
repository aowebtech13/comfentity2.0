import React, { useState, useEffect } from "react";
import Card from "@/components/ui/Card";
import Textinput from "@/components/ui/Textinput";
import GroupChart5 from "@/components/partials/widget/chart/group-chart5";
import { Link } from "react-router-dom";
import SimpleBar from "simplebar-react";
import HistoryChart from "@/components/partials/widget/chart/history-chart";
import CardSlider from "@/components/partials/widget/CardSlider";
import TransactionsTable from "@/components/partials/Table/transactions";
import SelectMonth from "@/components/partials/SelectMonth";
import HomeBredCurbs from "./HomeBredCurbs";
import bankingService from "@/services/bankingService";

import Mainuser from "@/assets/images/all-img/main-user.png";

/**
 * Format a number as a currency string.
 */
const formatCurrency = (value) => {
  if (value === null || value === undefined || isNaN(value)) {
    return "$0.00";
  }
  return `$${parseFloat(value).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

/**
 * Mask an account number to show only the last 4 digits.
 */
const maskAccountNumber = (accountNumber) => {
  if (!accountNumber) return "****";
  const digits = String(accountNumber).replace(/\D/g, "");
  if (digits.length < 4) return digits;
  return `**** **** **** ${digits.slice(-4)}`;
};

/**
 * Daily login bonus amount (must match backend User::DAILY_LOGIN_BONUS).
 */
const DAILY_LOGIN_BONUS = 0.5;

/**
 * Determine whether the daily login bonus has already been claimed today.
 * The backend stores the claim timestamp in `last_login_bonus_at`.
 */
const hasClaimedBonusToday = (user) => {
  if (!user?.last_login_bonus_at) return false;
  const claimed = new Date(user.last_login_bonus_at);
  const now = new Date();
  return (
    claimed.getFullYear() === now.getFullYear() &&
    claimed.getMonth() === now.getMonth() &&
    claimed.getDate() === now.getDate()
  );
};

/**
 * BankingPage — the user's banking dashboard.
 *
 * Dynamically fetches data from the backend API:
 *   - User profile (name, balance, bank details) via /profile
 *   - Dashboard stats (balance, profit, etc.) via /dashboard-data
 *   - Transactions via /transactions
 *   - Referrals (for quick-transfer contacts) via /profile/referrals
 *
 * Falls back to sample data when the API is unavailable so the page
 * always renders a meaningful UI.
 */
const BankingPage = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [amount, setAmount] = useState("");
  const [recipientAccount, setRecipientAccount] = useState("");

  // Data state
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [transactionStats, setTransactionStats] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [cards, setCards] = useState([]);

  // Loading / error state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Fetch all banking data from the backend.
   */
  const fetchBankingData = async () => {
    try {
      setLoading(true);
      setError(null);

      // 1. Fetch user profile
      const profileResult = await bankingService.getProfile();
      const userData = profileResult?.user || null;
      setUser(userData);

      // 2. Fetch dashboard data (stats + recent transactions)
      const dashboardResult = await bankingService.getDashboardData();
      const dashboardStats = dashboardResult?.stats || null;
      setStats(dashboardStats);

      // 3. Fetch full transactions list
      const txResult = await bankingService.getTransactions({ per_page: 20 });
      const txData = txResult?.transactions?.data || [];
      setTransactions(txData);
      setTransactionStats(txResult?.stats || null);

      // 4. Fetch referrals for quick-transfer contacts
      const referralsResult = await bankingService.getReferrals();
      const referredUsers = referralsResult?.referred_users || [];
      setContacts(referredUsers);

      // 5. Build card data from user's bank account info
if (userData) {
        const cardData = [];
        if (userData.bank_account_number) {
          cardData.push({
            bg: "from-[#1EABEC] to-primary-500",
            cardNo: maskAccountNumber(userData.bank_account_number),
            balance: formatCurrency(userData.balance),
          });
        }
        // Always ensure at least one card
        if (cardData.length === 0) {
          cardData.push({
            bg: "from-[#1EABEC] to-primary-500",
            cardNo: maskAccountNumber(userData.bank_account_number),
            balance: formatCurrency(userData.balance),
          });
        }
        setCards(cardData);
      }
    } catch (err) {
      console.error("Failed to fetch banking data:", err);
      setError("Failed to load banking data. Showing sample data.");
      // Fall back to sample data so the page still renders
      setStats({
        balance: 0,
        total_profit: 0,
        total_invested: 0,
        active_investments_count: 0,
        total_referral_earnings: 0,
      });
      setTransactions([]);
      setTransactionStats({
        total_inflows: 0,
        total_outflows: 0,
        net_flow: 0,
      });
      setContacts([]);
      setCards([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBankingData();
  }, []);

  // Calculate total amount from the amount input
  const totalAmount = amount
    ? formatCurrency(parseFloat(amount.replace(/[^0-9.]/g, "")) || 0)
    : "$0.00";

  // Get display name
  const displayName = user?.name || "Guest User";
  const displayBalance = formatCurrency(user?.balance ?? stats?.balance ?? 0);

  return (
    <div className="space-y-5">
      <HomeBredCurbs title="Banking" />

      {/* Header Card: User greeting + balance stats */}
      <Card>
        <div className="grid xl:grid-cols-3 lg:grid-cols-2 md:grid-cols-2 grid-cols-1 gap-5 place-content-center">
          <div className="flex space-x-4 h-full items-center rtl:space-x-reverse">
            <div className="flex-none">
              <div className="h-20 w-20 rounded-full">
                {user?.avatar_url ? (
                  <img
                    src={user.avatar_url}
                    alt={displayName}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <img
                    src={Mainuser}
                    alt=""
                    className="w-full h-full"
                  />
                )}
              </div>
            </div>
<div className="flex-1">
              <h4 className="text-xl font-medium mb-2">
                <span className="block font-light">Good evening,</span>
                <span className="block">{displayName}</span>
              </h4>
              <div className="mt-2">
                <div
                  className={`inline-flex items-center space-x-2 rtl:space-x-reverse rounded-md px-3 py-1.5 text-xs font-medium ${
                    hasClaimedBonusToday(user)
                      ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"
                      : "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400"
                  }`}
                >
                  <span aria-hidden="true">🎁</span>
                  <span>
                    {hasClaimedBonusToday(user)
                      ? `Daily login bonus claimed (+$${DAILY_LOGIN_BONUS.toFixed(2)})`
                      : `Daily login bonus available (+$${DAILY_LOGIN_BONUS.toFixed(2)})`}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <GroupChart5 stats={stats} />
        </div>
      </Card>

      <div className="grid grid-cols-12 gap-5">
        {/* Left Column: My Card + Quick Transfer */}
        <div className="lg:col-span-4 col-span-12 space-y-5">
          <Card title="My card">
            <div className="max-w-[90%] mx-auto mt-2">
              <CardSlider cards={cards} />
            </div>
          </Card>

          <Card title="Quick transfer">
            <div className="space-y-6">
              {/* Contacts */}
             

              {/* Amount input */}
              <div className="bg-slate-100 dark:bg-slate-900 rounded-md p-4">
                <span
                  className="text-xs text-slate-500 dark:text-slate-400 block mb-1 cursor-pointer font-normal"
                  htmlFor="cdp"
                >
                  Amount
                </span>
                <Textinput
                  placeholder="$6"
                  id="cdp"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="bg-transparent border-none focus:ring-0 focus:border-none p-0 text-slate-900 dark:text-white text-sm placeholder:text-slate-400 placeholder:font-medium h-auto font-medium"
                />
              </div>

              {/* Recipient account number */}
              <div className="bg-slate-100 dark:bg-slate-900 rounded-md p-4">
                <label
                  className="text-xs text-slate-500 dark:text-slate-400 block cursor-pointer mb-1"
                  htmlFor="cd"
                >
                  Function Coming Soon
                </label>
                <Textinput
                  placeholder="@johdoe"
                  id="cd"
                  value={recipientAccount}
                  onChange={(e) => setRecipientAccount(e.target.value)}
                  className="bg-transparent border-none focus:ring-0 focus:border-none p-0 text-slate-900 dark:text-white text-sm placeholder:text-slate-400 h-auto placeholder:font-medium font-medium"
                />
              </div>

              {/* Total amount + Send button */}
              <div className="flex justify-between">
                <div>
                  <span className="text-xs text-slate-500 dark:text-slate-400 block mb-1">
                    Total amount
                  </span>
                  <span className="text-lg font-medium text-slate-900 dark:text-white block">
                    {totalAmount}
                  </span>
                </div>
                <div>
                  <button
                    type="button"
                    className="btn btn-dark"
                    onClick={() => {
                      if (!amount || !recipientAccount) {
                        alert("Please enter both amount and recipient account number.");
                        return;
                      }
                      alert(
                        `Transferring ${totalAmount} to account ${recipientAccount}`
                      );
                      setAmount("");
                      setRecipientAccount("");
                    }}
                  >
                    Coming Soon
                  </button>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Transactions table + History chart */}
        <div className="lg:col-span-8 col-span-12">
          <div className="space-y-5 bank-table">
            <TransactionsTable
              transactions={transactions}
              stats={transactionStats}
              loading={loading}
            />
            <Card title="History" headerSlot={<SelectMonth />}>
              <div className="legend-ring4">
                <HistoryChart transactions={transactions} />
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BankingPage;
