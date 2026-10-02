import React, { useState, useRef, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setUser, updateUser } from "@/store/authSlice";
import { toast } from "react-toastify";
import Icon from "@/components/ui/Icon";
import Card from "@/components/ui/Card";
import Textinput from "@/components/ui/Textinput";
import Button from "@/components/ui/Button";

// import images
import ProfileImage from "@/assets/images/users/user-1.jpg";
import profileService from "@/services/profileService";

const Profile = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const fileInputRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);
const [editingUsername, setEditingUsername] = useState(false);
  const [usernameValue, setUsernameValue] = useState(user?.username || "");
const [imgError, setImgError] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [referrals, setReferrals] = useState([]);
  const [referralEarnings, setReferralEarnings] = useState(0);
  const [referralLoading, setReferralLoading] = useState(true);

  const referralLink = `${window.location.origin}/register?ref=${user?.Nex_id || ""}`;

  useEffect(() => {
    let mounted = true;
    profileService
      .getReferrals()
      .then((res) => {
        if (!mounted) return;
        setReferrals(res.referred_users || []);
        setReferralEarnings(res.total_referral_earnings || 0);
      })
      .catch(() => {})
      .finally(() => {
        if (mounted) setReferralLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      toast.success("Referral link copied to clipboard!");
    } catch (err) {
      toast.error("Failed to copy link");
    }
  };

  // Reset imgError whenever avatar source changes
  useEffect(() => {
    setImgError(false);
    setImgLoaded(false);
  }, [user?.avatar_url, avatarPreview]);

  // Cleanup blob URL on unmount
  useEffect(() => {
    return () => {
      if (avatarPreview && avatarPreview.startsWith("blob:")) {
        URL.revokeObjectURL(avatarPreview);
      }
    };
  }, [avatarPreview]);

  const handleUsernameUpdate = async () => {
    if (!usernameValue.trim()) {
      toast.error("Username cannot be empty");
      return;
    }

    try {
      setIsLoading(true);
      const response = await profileService.updateProfile({
        name: user?.name,
        username: usernameValue.trim(),
        phone: user?.phone || "",
      });

      dispatch(setUser({ ...user, username: response.user.username }));
      localStorage.setItem("user", JSON.stringify({ ...user, username: response.user.username }));
      setEditingUsername(false);
      toast.success("Username updated successfully");
    } catch (error) {
      const message = error?.response?.data?.message || error?.response?.data?.errors?.username?.[0] || "Failed to update username";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAvatarPreview(URL.createObjectURL(file));

    try {
      setAvatarUploading(true);
      const response = await profileService.updateAvatar(file);
      dispatch(updateUser({ avatar_url: response.user.avatar_url }));
      setAvatarPreview(response.user.avatar_url);
      toast.success("Profile picture updated successfully");
    } catch (error) {
      setAvatarPreview(null);
      const message = error?.response?.data?.message || error?.response?.data?.errors?.avatar?.[0] || "Failed to upload profile picture";
      toast.error(message);
    } finally {
      setAvatarUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div>
      <div className="space-y-5 profile-page">
        <div className="profiel-wrap px-[35px] pb-10 md:pt-[84px] pt-10 rounded-lg bg-white dark:bg-slate-800 relative z-1">
          <div className="bg-slate-900 dark:bg-slate-700 absolute left-0 top-0 md:h-1/2 h-[150px] w-full z-[-1] rounded-t-lg"></div>
          <div className="lg:flex lg:space-y-0 space-y-6 justify-between items-end">
            <div className="profile-box flex-none md:text-start text-center">
              <div className="md:flex items-end md:space-x-6 rtl:space-x-reverse">
                <div className="flex-none">
                  <div className="md:h-[186px] md:w-[186px] h-[140px] w-[140px] md:ml-0 md:mr-0 ml-auto mr-auto md:mb-0 mb-4 rounded-full ring-4 ring-slate-100 relative group cursor-pointer">
                    {!imgLoaded && !imgError && (
                      <div className="w-full h-full rounded-full bg-slate-200 dark:bg-slate-600 animate-pulse flex items-center justify-center">
                        <Icon icon="heroicons:user" className="text-3xl text-slate-400 dark:text-slate-500" />
                      </div>
                    )}
                    <img
                      src={imgError ? ProfileImage : (avatarPreview || user?.avatar_url || ProfileImage)}
                      alt=""
                      className={`w-full h-full object-cover rounded-full ${!imgLoaded ? 'hidden' : ''}`}
                      onLoad={() => setImgLoaded(true)}
                      onError={() => { setImgError(true); setImgLoaded(true); }}
                    />
                    <input type="file" ref={fileInputRef} onChange={handleAvatarChange} accept="image/jpeg,image/png,image/jpg,image/gif" className="hidden" />
                    <div onClick={handleAvatarClick} className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                      {avatarUploading ? (
                        <svg className="animate-pulse h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      ) : (
                        <Icon icon="heroicons:camera" className="text-white text-2xl" />
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex-1">
                  <div className="text-2xl font-medium text-slate-900 dark:text-slate-200 mb-[3px]">{user?.name || "User"}</div>
                  <div className="text-sm font-light text-slate-600 dark:text-slate-400">@{user?.username || "username"}</div>
                </div>
              </div>
            </div>
            <div className="profile-info-500 md:flex md:text-start text-center flex-1 max-w-[516px] md:space-y-0 space-y-4">
              <div className="flex-1">
                <div className="text-base text-slate-900 dark:text-slate-300 font-medium mb-1">${user?.balance?.toLocaleString() || "0"}</div>
                <div className="text-sm text-slate-600 font-light dark:text-slate-300">Total Balance</div>
              </div>
              <div className="flex-1">
                <div className="text-base text-slate-900 dark:text-slate-300 font-medium mb-1">{user?.Nex_id || "N/A"}</div>
                <div className="text-sm text-slate-600 font-light dark:text-slate-300">comfentity ID</div>
              </div>
<div className="flex-1">
                <div className="text-base text-slate-900 dark:text-slate-300 font-medium mb-1">{user?.level_label || "Free Plan"}</div>
                <div className="text-sm text-slate-600 font-light dark:text-slate-300">Account Level</div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-6">
          <div className="lg:col-span-4 col-span-12">
            <Card title="Info">
              <ul className="list space-y-8">
                <li className="flex space-x-3 rtl:space-x-reverse">
                  <div className="flex-none text-2xl text-slate-600 dark:text-slate-300"><Icon icon="heroicons:envelope" /></div>
                  <div className="flex-1">
                    <div className="uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]">EMAIL</div>
                    <a href={`mailto:${user?.email}`} className="text-base text-slate-600 dark:text-slate-50">{user?.email || "N/A"}</a>
                  </div>
                </li>
                <li className="flex space-x-3 rtl:space-x-reverse">
                  <div className="flex-none text-2xl text-slate-600 dark:text-slate-300"><Icon icon="heroicons:user" /></div>
                  <div className="flex-1">
                    <div className="uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]">USERNAME</div>
                    {editingUsername ? (
                      <div className="flex items-center gap-2 mt-1">
                        <Textinput value={usernameValue} onChange={(e) => setUsernameValue(e.target.value)} className="h-[36px] text-sm flex-1" placeholder="Enter username" />
                        <Button text="Save" className="btn btn-dark btn-sm" onClick={handleUsernameUpdate} isLoading={isLoading} />
                        <Button text="Cancel" className="btn btn-outline-dark btn-sm" onClick={() => { setEditingUsername(false); setUsernameValue(user?.username || ""); }} />
                      </div>
                    ) : (
                      <div className="text-base text-slate-600 dark:text-slate-50 cursor-pointer hover:text-slate-900 dark:hover:text-white flex items-center gap-2" onClick={() => setEditingUsername(true)}>
                        @{user?.username || "N/A"}
                        <Icon icon="heroicons:pencil-square" className="text-sm" />
                      </div>
                    )}
                  </div>
                </li>
                <li className="flex space-x-3 rtl:space-x-reverse">
                  <div className="flex-none text-2xl text-slate-600 dark:text-slate-300"><Icon icon="heroicons:phone-arrow-up-right" /></div>
                  <div className="flex-1">
                    <div className="uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]">PHONE</div>
                    <a href={`tel:${user?.phone}`} className="text-base text-slate-600 dark:text-slate-50">{user?.phone || "N/A"}</a>
                  </div>
                </li>
              </ul>
            </Card>
          </div>
<div className="lg:col-span-8 col-span-12">
            <Card title="Referral Program">
              <div className="referral-link-box mb-6 p-4 rounded-lg bg-slate-50 dark:bg-slate-700/50">
                <div className="uppercase text-xs text-slate-500 dark:text-slate-300 mb-2 leading-[12px]">YOUR REFERRAL LINK</div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 text-sm text-slate-600 dark:text-slate-300 break-all bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded px-3 py-2">
                    {referralLink}
                  </div>
                  <Button text="Copy" className="btn btn-dark btn-sm flex-none" onClick={handleCopyLink} />
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-3">
Earn <span className="font-semibold text-slate-800 dark:text-white">$0.20</span> for every friend who signs up using your link.
                </p>
              </div>

              <div className="flex justify-between mb-4">
                <div className="uppercase text-xs text-slate-500 dark:text-slate-300 leading-[12px]">PEOPLE REFERRED</div>
                <div className="text-sm text-slate-600 dark:text-slate-300">
                  Earnings:{" "}
                  <span className="font-semibold text-slate-800 dark:text-white">
                    ${Number(referralEarnings || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              {referralLoading ? (
                <div className="text-center py-8 text-sm text-slate-400">Loading referrals...</div>
              ) : referrals.length === 0 ? (
                <div className="text-center py-8 text-sm text-slate-400">
                  You haven't referred anyone yet. Share your link to start earning!
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="table-auto w-full text-left min-w-[480px]">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-600 text-xs uppercase text-slate-500 dark:text-slate-300">
                        <th className="py-2 pr-2">Name</th>
                        <th className="py-2 pr-2">Email</th>
                        <th className="py-2 pr-2">Nex ID</th>
                        <th className="py-2 pr-2">Joined</th>
                      </tr>
                    </thead>
                    <tbody>
                      {referrals.map((ref) => (
                        <tr key={ref.id} className="border-b border-slate-100 dark:border-slate-700 text-sm text-slate-600 dark:text-slate-300">
                          <td className="py-2 pr-2">{ref.name || "N/A"}</td>
                          <td className="py-2 pr-2">{ref.email || "N/A"}</td>
                          <td className="py-2 pr-2">{ref.Nex_id || "N/A"}</td>
                          <td className="py-2 pr-2">
                            {ref.created_at ? new Date(ref.created_at).toLocaleDateString() : "N/A"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
