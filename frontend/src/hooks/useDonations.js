import { useContext } from 'react';
import { DonationContext } from '../context/DonationContext.jsx';

export function useDonations() {
  const ctx = useContext(DonationContext);
  if (!ctx) throw new Error('useDonations must be used within a DonationProvider');
  return ctx;
}
