import { useEffect, useState } from 'react';
import Modal from '../ui/Modal.jsx';
import Input from '../ui/Input.jsx';
import Button from '../ui/Button.jsx';
import { requiredFieldsFilled } from '../../utils/validators';

const EMPTY_FORM = {
  pickUpLocation: '',
  availabilityTime: '',
};

export default function CreateDonationModal({
  open,
  onClose,
  onCreate,
  fromInventoryItem,
  initialValues,
  title = 'Create Donation Listing',
  submitLabel = 'Publish Listing',
}) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setForm({
        pickUpLocation: initialValues?.pickUpLocation || '',
        availabilityTime: initialValues?.availabilityTime || '',
      });
      setError('');
    }
  }, [open, fromInventoryItem, initialValues]);

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (
      !requiredFieldsFilled({
        pickUpLocation: form.pickUpLocation,
        availabilityTime: form.availabilityTime,
      })
    ) {
      setError('Please complete all required fields.');
      return;
    }
    onCreate(form);
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      subtitle={fromInventoryItem ? `Listing: ${fromInventoryItem.name}` : 'Share your surplus with the community'}
      footer={
        <>
          <Button variant="ghost" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button icon="publish" type="submit" form="donation-form">
            {submitLabel}
          </Button>
        </>
      }
    >
      <form id="donation-form" className="p-lg space-y-lg ledger-line" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-lg">
          <Input
            label="Pickup Location"
            placeholder="Street or landmark"
            value={form.pickUpLocation}
            onChange={(e) => update('pickUpLocation', e.target.value)}
            required
          />
          <Input
            label="Availability Time"
            placeholder="e.g., 5:00 PM - 8:00 PM"
            value={form.availabilityTime}
            onChange={(e) => update('availabilityTime', e.target.value)}
            required
          />
        </div>
        {error && <p className="text-error text-label-sm">{error}</p>}
        <div className="flex items-center gap-xs text-on-surface-variant">
          <span className="material-symbols-outlined text-[18px]">verified_user</span>
          <span className="font-label-sm text-label-sm">Community Safe Listing</span>
        </div>
      </form>
    </Modal>
  );
}
