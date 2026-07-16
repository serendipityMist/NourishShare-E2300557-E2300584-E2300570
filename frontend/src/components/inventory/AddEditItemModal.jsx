import { useEffect, useState } from 'react';
import Modal from '../ui/Modal.jsx';
import Input from '../ui/Input.jsx';
import Select from '../ui/Select.jsx';
import Button from '../ui/Button.jsx';
import { CATEGORIES, STORAGE_LOCATIONS, UNITS } from '../../data/mockData';
import { requiredFieldsFilled } from '../../utils/validators';

const EMPTY_FORM = {
  name: '',
  category: CATEGORIES[0],
  quantity: '',
  unit: UNITS[0],
  expiryDate: '',
  storageLocation: STORAGE_LOCATIONS[0],
  notes: '',
};

export default function AddEditItemModal({ open, onClose, onSave, initialItem }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState('');
  const isEditMode = Boolean(initialItem);

  useEffect(() => {
    if (open) {
      setForm(
        initialItem
          ? {
              name: initialItem.name,
              category: initialItem.category,
              quantity: initialItem.quantity,
              unit: initialItem.unit,
              expiryDate: initialItem.expiryDate,
              storageLocation: initialItem.storageLocation,
              notes: initialItem.notes || '',
            }
          : EMPTY_FORM
      );
      setError('');
    }
  }, [open, initialItem]);

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!requiredFieldsFilled({ name: form.name, quantity: form.quantity, expiryDate: form.expiryDate })) {
      setError('Please complete all required fields.');
      return;
    }
    onSave({ ...form, quantity: Number(form.quantity) });
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEditMode ? 'Edit Food Item' : 'Add Food Item'}
      subtitle={isEditMode ? 'Update details for this pantry item' : 'Log a new item to your digital pantry'}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} type="button">
            Cancel
          </Button>
          <Button icon="save" type="submit" form="item-form">
            {isEditMode ? 'Save Changes' : 'Save to Pantry'}
          </Button>
        </>
      }
    >
      <form id="item-form" className="p-lg space-y-lg" onSubmit={handleSubmit}>
        <div className="flex flex-col items-center justify-center p-xl border-2 border-dashed border-outline-variant rounded-xl bg-surface-container-lowest">
          <div className="w-14 h-14 bg-primary-fixed rounded-full flex items-center justify-center mb-sm">
            <span className="material-symbols-outlined text-primary text-2xl">add_a_photo</span>
          </div>
          <p className="font-label-md text-on-surface">Snap or upload a photo</p>
          <p className="text-label-sm text-on-surface-variant">Helps identify items at a glance (optional in this demo)</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
          <div className="md:col-span-2">
            <Input
              label="Item Name"
              placeholder="e.g. Organic Red Lentils"
              value={form.name}
              onChange={(e) => update('name', e.target.value)}
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
          <div className="flex gap-xs">
            <div className="w-2/3">
              <Input
                label="Quantity"
                type="number"
                min="0"
                placeholder="0"
                value={form.quantity}
                onChange={(e) => update('quantity', e.target.value)}
                required
              />
            </div>
            <div className="w-1/3">
              <Select label="Unit" value={form.unit} onChange={(e) => update('unit', e.target.value)}>
                {UNITS.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </Select>
            </div>
          </div>
          <Input
            label="Best Before / Expiry"
            type="date"
            value={form.expiryDate}
            onChange={(e) => update('expiryDate', e.target.value)}
            required
          />
          <Select
            label="Storage Location"
            value={form.storageLocation}
            onChange={(e) => update('storageLocation', e.target.value)}
          >
            {STORAGE_LOCATIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </Select>
          <div className="md:col-span-2">
            <label className="font-label-md text-label-md text-on-surface-variant block mb-xs">Notes</label>
            <textarea
              className="w-full bg-surface-container-low border-none border-b-2 border-outline-variant focus:border-primary focus:ring-0 px-md py-md text-body-md inner-stamped rounded-t-lg transition-all resize-none"
              placeholder="Add details like brand, open date, or cooking tips..."
              rows={3}
              value={form.notes}
              onChange={(e) => update('notes', e.target.value)}
            />
          </div>
        </div>

        {error && <p className="text-error text-label-sm">{error}</p>}

        <div className="p-md bg-tertiary-fixed/20 rounded-lg flex items-start gap-md border border-tertiary-fixed">
          <span className="material-symbols-outlined text-tertiary">info</span>
          <p className="text-label-sm text-on-tertiary-fixed-variant">
            Adding an expiry date helps us send you timely notifications before items go to waste.
          </p>
        </div>
      </form>
    </Modal>
  );
}
