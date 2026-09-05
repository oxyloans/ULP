import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getFamilyMembers, getFamilyMembersForOxyloans, setHeadOfFamily as apiSetHeadOfFamily, removeFamilyMember as apiRemoveFamilyMember } from '../api/afterlogin-user';
import { getUserId } from '../api/client';

const FamilyContext = createContext(null);

export function FamilyProvider({ children }) {
  const [members, setMembers]                   = useState([]);
  const [membersLoading, setMembersLoading]     = useState(true);
  // null = Family Overview (only shown when family has 2+ members)
  // 'self' = logged-in user's own data (default when no family)
  const [selectedMemberId, setSelectedMemberId] = useState('self');

  // ── OxyLoans-specific family state ────────────────────────────────────────
  // oxyloansMembers: members linked via the OxyLoans platform
  // headOfFamilyId:  the member currently designated as Head of Family
  const [oxyloansMembers, setOxyloansMembers]   = useState([]);
  const [oxyMembersLoading, setOxyMembersLoading] = useState(false);
  const [headOfFamilyId, setHeadOfFamilyId]     = useState(null);

  useEffect(() => {
    getFamilyMembers()
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setMembers(data);
          // Always open on the logged-in user's own view by default.
          // The user explicitly picks a family member from the switcher.
          setSelectedMemberId('self');
        } else {
          setSelectedMemberId('self');
        }
      })
      .catch(() => {
        setSelectedMemberId('self');
      })
      .finally(() => setMembersLoading(false));
  }, []);

  /**
   * Fetch OxyLoans-specific family members.
   * Called after the "Get OxyLoans Data" flow completes so the family member
   * dropdown in the OxyLoans section has fresh data.
   */
  const refreshOxyloansMembers = useCallback(async () => {
    setOxyMembersLoading(true);
    try {
      const data = await getFamilyMembersForOxyloans();
      if (Array.isArray(data)) {
        setOxyloansMembers(data);
        // Preserve any existing head-of-family flag from the server response
        const serverHead = data.find(m => m.isHeadOfFamily);
        if (serverHead) setHeadOfFamilyId(serverHead.id);
      }
    } catch {
      // silently fall through — UI shows empty state
    } finally {
      setOxyMembersLoading(false);
    }
  }, []);

  /**
   * Set a member as Head of Family (OxyLoans context).
   * Optimistically updates local state; rolls back on API failure.
   * Returns { success: boolean, error?: string }
   */
  const setHeadOfFamily = useCallback(async (memberId) => {
    const prev = headOfFamilyId;
    setHeadOfFamilyId(memberId);
    // also reflect isHeadOfFamily on the oxyloansMembers list
    setOxyloansMembers(list =>
      list.map(m => ({ ...m, isHeadOfFamily: m.id === memberId }))
    );
    try {
      await apiSetHeadOfFamily(memberId);
      return { success: true };
    } catch (err) {
      // roll back
      setHeadOfFamilyId(prev);
      setOxyloansMembers(list =>
        list.map(m => ({ ...m, isHeadOfFamily: m.id === prev }))
      );
      return { success: false, error: err.message ?? 'Failed to set Head of Family' };
    }
  }, [headOfFamilyId]);

  /**
   * Remove a family member (OxyLoans context).
   * Only the Head of Family (or the member themselves) should call this.
   * Returns { success: boolean, error?: string }
   */
  const removeOxyFamilyMember = useCallback(async (memberId) => {
    try {
      await apiRemoveFamilyMember(memberId);
      setOxyloansMembers(list => list.filter(m => m.id !== memberId));
      // If the removed member was the head, clear that designation
      if (headOfFamilyId === memberId) setHeadOfFamilyId(null);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message ?? 'Failed to remove member' };
    }
  }, [headOfFamilyId]);

  const approvedMembers = members.filter(m => m.status === 'Approved');
  // Has family = more than 1 approved member (others besides the user themselves)
  const hasFamily       = approvedMembers.length > 1;
  const selectedMember  = approvedMembers.find(m => m.id === selectedMemberId) ?? null;
  const userId          = getUserId();
  // selfMemberId = the id of the logged-in user's own slot in the family member list.
  // This is always approved[0] — the first record returned by the API is the account owner.
  // Used to distinguish "viewing my own data" vs "viewing a family member's data".
  const selfMemberId    = approvedMembers[0]?.id ?? null;

  // Derived: the full member object for the current Head of Family
  const headOfFamily = oxyloansMembers.find(m => m.id === headOfFamilyId) ?? null;

  return (
    <FamilyContext.Provider value={{
      // General family state
      selectedMemberId, setSelectedMemberId,
      approvedMembers, selectedMember,
      membersLoading, hasFamily, userId,
      selfMemberId,         // id of the logged-in user's own family-member record

      // OxyLoans-specific family state
      oxyloansMembers,
      oxyMembersLoading,
      headOfFamilyId,
      headOfFamily,
      refreshOxyloansMembers,
      setHeadOfFamily,
      removeOxyFamilyMember,
    }}>
      {children}
    </FamilyContext.Provider>
  );
}

export const useFamily = () => useContext(FamilyContext);
