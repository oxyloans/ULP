/**
 * ProfileContext
 * Fetches the user profile once on login and exposes KYC/completion flags
 * across the whole app — dashboard warning, participation gate, etc.
 */
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getUserProfile } from '../api/afterlogin-user';
import { useAuth } from './AuthContext';

const ProfileContext = createContext(null);

export function ProfileProvider({ children }) {
  const { user } = useAuth();

  const [profile,  setProfile]  = useState(null);
  const [loading,  setLoading]  = useState(false);
  const [fetched,  setFetched]  = useState(false);

  const fetchProfile = useCallback(() => {
    if (!user) return;
    setLoading(true);
    getUserProfile()
      .then(data => { if (data) setProfile(data); })
      .catch(() => {})
      .finally(() => { setLoading(false); setFetched(true); });
  }, [user?.userId]);

  // Fetch once when user logs in
  useEffect(() => {
    if (user && !fetched) fetchProfile();
    if (!user) { setProfile(null); setFetched(false); }
  }, [user?.userId]);

  // Derived flags
  const panVerified  = profile?.panVerified  === true;
  const bankVerified = profile?.bankVerified === true;
  const hasName      = !!(profile?.firstName?.trim());
  const hasAddress   = !!(profile?.address?.trim());
  const hasDob       = !!(profile?.dob?.trim());
  const mobileDigits = (profile?.mobileNumber ?? '').replace(/\D/g, '');
  const hasMobile    = mobileDigits.length >= 7 && mobileDigits.length <= 15;
  const isPersonalInfoComplete = hasName && hasDob && hasAddress && hasMobile;

  // Items that are incomplete
  const incomplete = [
    !isPersonalInfoComplete && { key: 'personal', label: 'Complete personal information', path: '/profile' },
    !panVerified  && { key: 'pan',     label: 'Verify your PAN card',        path: '/profile?tab=pan' },
    !bankVerified && { key: 'bank',    label: 'Link a bank account',         path: '/profile?tab=bank' },
  ].filter(Boolean);

  const isKycComplete = panVerified && bankVerified;

  return (
    <ProfileContext.Provider value={{
      profile, loading, fetched,
      panVerified, bankVerified, hasName, hasAddress, hasDob, hasMobile, isPersonalInfoComplete,
      incomplete, isKycComplete,
      refresh: fetchProfile,
    }}>
      {children}
    </ProfileContext.Provider>
  );
}

export const useProfile = () => useContext(ProfileContext);
