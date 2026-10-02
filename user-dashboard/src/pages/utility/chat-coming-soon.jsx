import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Card from "@/components/ui/Card";
import profileService from "@/services/profileService";

const ChatComingSoon = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);

const [status, setStatus] = useState({
    amount: 0,
    claimed_today: false,
    balance: 0,
    has_plan: true,
  });
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);
  const [message, setMessage] = useState("");

  // Fetch the daily login bonus status on mount.
  const fetchBonusStatus = async () => {
    try {
      const data = await profileService.getDailyBonusStatus();
      setStatus({
        amount: data.amount || 0,
        claimed_today: data.claimed_today || false,
        balance: data.balance || 0,
        has_plan: data.has_plan !== false,
      });
      setMessage("");
    } catch (err) {
      setStatus({
        amount: 0,
        claimed_today: false,
        balance: user?.balance || 0,
        has_plan: true,
      });
      setMessage(
        err?.response?.data?.message ||
          "Unable to load daily bonus status."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBonusStatus();
  }, []);

  const handleClaim = async () => {
    if (claiming || status.claimed_today) return;

    setClaiming(true);
    try {
      const data = await profileService.claimDailyLoginBonus();

      setStatus((prev) => ({
        ...prev,
        claimed_today: data.claimed_today,
        balance: data.balance,
      }));

      setMessage(data.message || "");

      // Reflect the updated balance in the Redux store so the header/profile
      // widget shows the new value immediately without a refetch.
      if (data.balance !== undefined && dispatch) {
        dispatch({
          type: "auth/updateUser",
          payload: { balance: data.balance },
        });
      }
    } catch (err) {
      setMessage(
        err?.response?.data?.message ||
          "Failed to claim daily bonus. Please try again."
      );
    } finally {
      setClaiming(false);
    }
  };

const { amount, claimed_today, balance, has_plan } = status;

  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <Card
        className="w-full max-w-lg mx-auto text-center"
        bodyClass="p-10"
      >
        <div className="mx-auto mb-6 h-20 w-20 rounded-full bg-primary-500/10 text-primary-500 flex items-center justify-center">
          <svg
            className="h-10 w-10"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 6v12m-3-6h6"
            />
          </svg>
        </div>

        <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider bg-amber-500/10 text-amber-600 dark:text-amber-400 px-3 py-1 rounded-full mb-4">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
          Daily Login Bonus
        </span>

{loading ? (
          <p className="text-sm text-slate-400">Loading bonus status…</p>
        ) : !has_plan ? (
          <>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-4">
              You are currently on the{" "}
              <span className="font-semibold text-slate-800 dark:text-white">
                Free Plan
              </span>
              . Free plan users cannot earn free points.
            </p>

            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-8">
              Upgrade your plan to start earning your daily login bonus of{" "}
              <span className="font-semibold text-primary-500">
                ${amount.toFixed(2)}
              </span>{" "}
              every day.
            </p>

            <div className="rounded-md bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 px-4 py-3 text-sm font-medium">
              <span className="font-semibold">Upgrade required:</span> Please
              upgrade your account plan to start earning free points.
            </div>
          </>
        ) : (
          <>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-4">
              Claim your daily bonus of{" "}
              <span className="font-semibold text-primary-500">${amount.toFixed(2)}</span>{" "}
              just for logging in and visiting the chat page.
            </p>

            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-8">
              Current balance:{" "}
              <span className="font-semibold text-slate-800 dark:text-white">
                ${balance.toFixed(2)}
              </span>
            </p>

            {message && (
              <div
                className={`mb-4 rounded-md px-4 py-2 text-sm ${
                  claimed_today
                    ? "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                    : "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                }`}
              >
                {message}
              </div>
            )}

            <button
              type="button"
              onClick={handleClaim}
              disabled={claiming || claimed_today}
              className={`btn btn-dark w-full inline-flex items-center justify-center gap-2 ${
                (claiming || claimed_today) && "pointer-events-none opacity-60"
              }`}
            >
              {claiming ? (
                <>
                  <svg
                    className="animate-spin h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Claiming…
                </>
              ) : claimed_today ? (
                "Claimed Today ✓"
              ) : (
                <>
                  <svg
                    className="h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 6v12m-3-6h6"
                    />
                  </svg>
                  Claim ${amount.toFixed(2)} Now
                </>
              )}
            </button>
          </>
        )}
      </Card>
    </div>
  );
};

export default ChatComingSoon;
