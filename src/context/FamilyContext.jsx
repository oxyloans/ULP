import { createContext, useContext, useState, useEffect } from 'react';
import { getFamilyMembers } from '../api/afterlogin-user';
import { getUserId } from '../api/client';

const FamilyContext = createContext(null);

export function FamilyProvider({ children }) {
  const [members, setMembers]                   = useState([]);
  const [membersLoading, setMembersLoading]     = useState(true);
  // null = Family Overview (only shown when family has 2+ members)
  // 'self' = logged-in user's own data (default when no family)
  const [selectedMemberId, setSelectedMemberId] = useState('self');

  useEffect(() => {
    getFamilyMembers()
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setMembers(data);
          // If there are approved family members (others besides self),
          // default to the primary/first approved member
          const approved = data.filter(m => m.status === 'Approved');
          if (approved.length > 0) {
            setSelectedMemberId(approved[0].id);
          } else {
            setSelectedMemberId('self');
          }
        } else {
          // No family data — show individual user view
          setSelectedMemberId('self');
        }
      })
      .catch(() => {
        setSelectedMemberId('self');
      })
      .finally(() => setMembersLoading(false));
  }, []);

  const approvedMembers = members.filter(m => m.status === 'Approved');
  // Has family = more than 1 approved member (others besides the user themselves)
  const hasFamily       = approvedMembers.length > 1;
  const selectedMember  = approvedMembers.find(m => m.id === selectedMemberId) ?? null;
  const userId          = getUserId();

  return (
    <FamilyContext.Provider value={{
      selectedMemberId, setSelectedMemberId,
      approvedMembers, selectedMember,
      membersLoading, hasFamily, userId,
    }}>
      {children}
    </FamilyContext.Provider>
  );
}

export const useFamily = () => useContext(FamilyContext);
