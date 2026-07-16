import { useEffect, useState } from 'react';
import Modal from '../ui/Modal.jsx';
import Input from '../ui/Input.jsx';
import Select from '../ui/Select.jsx';
import Button from '../ui/Button.jsx';
import { CATEGORIES } from '../../data/mockData';
import { requiredFieldsFilled } from '../../utils/validators';

const EMPTY_FORM = {
  itemName: '',
  category: CATEGORIES[0],
  quantity: '',
  expiryDate: '',
  pickupLocation: '',
  pickupWindow: '',
  notes: '',
};

export default function CreateDonationModal({ open, onClose, onCreate, fromInventoryItem }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setForm(
        fromInventoryItem
          ? {
              itemName: fromInventoryItem.name,
              category: fromInventoryItem.category,
              quantity: `${fromInventoryItem.quantity} ${fromInventoryItem.unit}`,
              expiryDate: fromInventoryItem.expiryDate,
              pickupLocation: '',
              pickupWindow: '',
              notes: fromInventoryItem.notes || '',
            }
          : EMPTY_FORM
      );
      setError('');
    }
  }, [open, fromInventoryItem]);

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (
      !requiredFieldsFilled({
        itemName: form.itemName,
        quantity: form.quantity,
        pickupLocation: form.pickupLocation,
        pickupWindow: form.pickupWindow,
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
      title="Create Donation Listing"
      subtitle={fromInventoryItem ? 'Pre-filled from your pantry item' : 'Share your surplus with the community'}
      footer={
        <>
          <Button variant="ghost" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button icon="publish" type="submit" form="donation-form">
            Publish Listing
          </Button>
        </>
      }
    >
      <form id="donation-form" className="p-lg space-y-lg ledger-line">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
          <div className="md:col-span-2">
            <Input
              label="Item Name"
              placeholder="e.g., Organic Jasmine Rice"
              value={form.itemName}
              onChange={(e) => update('itemName', e.target.value)}
              required
            />
          </div>
          <Select label="Category" value={form.category} onChange={(e) => update('category', e.target.value)}>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
          <Input
            label="Quantity"
            placeholder="e.g., 2kg / 3 packs"
            value={form.quantity}
            onChange={(e) => update('quantity', e.target.value)}
            required
          />
          <Input
            label="Best Before Date"
            type="date"
            value={form.expiryDate}
            onChange={(e) => update('expiryDate', e.target.value)}
          />
          <Input
            label="Pickup Location"
            placeholder="Street or landmark"
            value={form.pickupLocation}
            onChange={(e) => update('pickupLocation', e.target.value)}
            required
          />
          <div className="md:col-span-2">
            <Input
              label="Pickup Window"
              placeholder="e.g., 5:00 PM - 8:00 PM"
              value={form.pickupWindow}
              onChange={(e) => update('pickupWindow', e.target.value)}
              required
            />
          </div>
          <div className="md:col-span-2">
            <label className="font-label-md text-label-md text-on-surface-variant block mb-xs">Pantry Notes</label>
            <textarea
              className="w-full p-md border border-outline-variant bg-surface-container-low font-body-md focus:border-primary focus:ring-0 outline-none transition-all"
              placeholder="Any handling instructions or allergens?"
              rows={3}
              value={form.notes}
              onChange={(e) => update('notes', e.target.value)}
            />
          </div>
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
