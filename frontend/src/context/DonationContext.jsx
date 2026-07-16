import { createContext, useState } from 'react';
import { INITIAL_DONATIONS } from '../data/mockData';

export const DonationContext = createContext(null);

let idCounter = 100;

export function DonationProvider({ children }) {
  const [donations, setDonations] = useState(INITIAL_DONATIONS);

  function createDonation(donation) {
    const newDonation = {
      id: `don-${idCounter++}`,
      status: 'available',
      donorName: 'You',
      donorRole: 'You (Verified Donor)',
      distanceKm: 0,
      image: donation.image || `https://picsum.photos/seed/donation${idCounter}/400/300`,
      ...donation,
    };
    setDonations((prev) => [newDonation, ...prev]);
    return newDonation;
  }

  function claimDonation(id) {
    setDonations((prev) => prev.map((d) => (d.id === id ? { ...d, status: 'claimed' } : d)));
  }

  function removeDonation(id) {
    setDonations((prev) => prev.filter((d) => d.id !== id));
  }

  function getDonationById(id) {
    return donations.find((d) => d.id === id);
  }

  const value = {
    donations,
    createDonation,
    claimDonation,
    removeDonation,
    getDonationById,
  };

  return <DonationContext.Provider value={value}>{children}</DonationContext.Provider>;
}
