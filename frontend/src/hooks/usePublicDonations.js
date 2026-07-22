import { useEffect, useState } from 'react';
import { donationService } from '../services/donationService';

export function usePublicDonations(limit = 3) {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError('');
        const response = await donationService.getPublicDonations({ limit });
        if (!cancelled) {
          setDonations(response.data?.data?.donations || []);
        }
      } catch (err) {
        if (!cancelled) {
          setDonations([]);
          setError(
            err.response?.data?.message || 'Unable to load community listings'
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [limit]);

  return { donations, loading, error };
}
