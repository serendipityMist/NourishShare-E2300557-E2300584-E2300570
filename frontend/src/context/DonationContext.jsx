import { createContext, useCallback, useEffect, useState } from 'react';
import { donationService } from '../services/donationService';
import { useAuth } from '../hooks/useAuth';

export const DonationContext = createContext(null);

function getCurrentUserId() {
  try {
    const stored = localStorage.getItem('saveplate_user');
    if (stored) {
      const user = JSON.parse(stored);
      return user._id || user.id;
    }
  } catch {
    // ignore
  }
  return null;
}

export function DonationProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [donations, setDonations] = useState([]);
  const [myDonations, setMyDonations] = useState([]);
  const [claimedDonations, setClaimedDonations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchDonations = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const response = await donationService.getAllDonations();
      const donationList = response.data?.data?.donations || [];
      const currentUserId = getCurrentUserId();

      const marked = donationList.map((d) => ({
        ...d,
        _isOwnDonation: d.donor?._id === currentUserId || d.donor === currentUserId,
      }));

      setDonations(marked);
    } catch (error) {
      if (error.response?.status === 401) {
        setLoading(false);
        return;
      }

      if (error.response?.status === 404) {
        setDonations([]);
      } else {
        setError(
          error.response?.data?.message || 'Failed to load donations'
        );
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchMyDonations = useCallback(async () => {
    try {
      const response = await donationService.getMyDonations();
      setMyDonations(response.data?.data?.donations || []);
    } catch (error) {
      if (error.response?.status === 404) {
        setMyDonations([]);
        return;
      }
      console.error('Failed to load my donations:', error);
    }
  }, []);

  const fetchClaimedDonations = useCallback(async () => {
    try {
      const response = await donationService.getMyClaimedDonations();
      setClaimedDonations(response.data?.data?.donations || []);
    } catch (error) {
      if (error.response?.status === 404) {
        setClaimedDonations([]);
        return;
      }
      console.error('Failed to load claimed donations:', error);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchDonations();
      fetchMyDonations();
      fetchClaimedDonations();
      return;
    }

    setDonations([]);
    setMyDonations([]);
    setClaimedDonations([]);
    setError('');
    setLoading(false);
  }, [isAuthenticated, fetchDonations, fetchMyDonations, fetchClaimedDonations]);

  async function createDonation(foodId, payload) {
    try {
      const response = await donationService.convertToDonation(foodId, payload);
      const newDonation = response.data?.data?.donation;

      if (newDonation) {
        const marked = { ...newDonation, _isOwnDonation: true };
        setDonations((prev) => [marked, ...prev]);
        setMyDonations((prev) => [marked, ...prev]);
        await fetchMyDonations();
      }

      return newDonation;
    } catch (error) {
      console.error('Failed to create donation:', error);
      throw new Error(
        error.response?.data?.message || 'Failed to create donation'
      );
    }
  }

  async function claimDonation(id) {
    try {
      const response = await donationService.claimDonation(id);
      const claimed = response.data?.data?.donation;

      setDonations((prev) => prev.filter((d) => d._id !== id && d.id !== id));

      if (claimed) {
        setClaimedDonations((prev) => {
          const exists = prev.some((d) => d._id === claimed._id);
          return exists ? prev : [claimed, ...prev];
        });
      } else {
        await fetchClaimedDonations();
      }

      return claimed;
    } catch (error) {
      console.error('Failed to claim donation:', error);
      throw new Error(
        error.response?.data?.message || 'Failed to claim donation'
      );
    }
  }

  function getDonationById(id) {
    return (
      donations.find((d) => d._id === id || d.id === id) ||
      myDonations.find((d) => d._id === id || d.id === id) ||
      claimedDonations.find((d) => d._id === id || d.id === id)
    );
  }

  async function updateDonation(id, payload) {
    const response = await donationService.editDonation(id, payload);
    const updated = response.data?.data?.donation;
    if (updated) {
      setMyDonations((prev) =>
        prev.map((d) => (d._id === id ? updated : d))
      );
      setDonations((prev) =>
        prev.map((d) => (d._id === id ? updated : d))
      );
    }
    return updated;
  }

  async function removeDonation(id) {
    await donationService.deleteDonation(id);
    setMyDonations((prev) => prev.filter((d) => d._id !== id && d.id !== id));
    setDonations((prev) => prev.filter((d) => d._id !== id && d.id !== id));
  }

  const value = {
    donations,
    myDonations,
    claimedDonations,
    loading,
    error,
    claimedCount: claimedDonations.length,
    createDonation,
    claimDonation,
    getDonationById,
    fetchDonations,
    fetchMyDonations,
    fetchClaimedDonations,
    updateDonation,
    removeDonation,
  };

  return (
    <DonationContext.Provider value={value}>
      {children}
    </DonationContext.Provider>
  );
}
