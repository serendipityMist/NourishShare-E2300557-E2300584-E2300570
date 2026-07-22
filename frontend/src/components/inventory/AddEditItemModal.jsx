import { useEffect, useState } from 'react';
import Modal from '../ui/Modal.jsx';
import Input from '../ui/Input.jsx';
import Select from '../ui/Select.jsx';
import Button from '../ui/Button.jsx';
import { STORAGE_LOCATIONS, UNITS } from '../../data/mockData';
import { categoryService } from '../../services/categoryService';
import { requiredFieldsFilled } from '../../utils/validators';

const EMPTY_FORM = {
  name: '',
  category: '',
  number: '',
  units: '',
  expiryDate: '',
  storageLocation: '',
  description: '',
  foodImage: null,
};

export default function AddEditItemModal({
  open,
  onClose,
  onSave,
  initialItem,
}) {
  const [form, setForm] =
    useState(EMPTY_FORM);

  const [error, setError] =
    useState('');

  const [saving, setSaving] =
    useState(false);

  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);

  const isEditMode =
    Boolean(initialItem);

  // ==========================================
  // Fetch categories from backend API
  // ==========================================
  useEffect(() => {
    if (!open) return;

    async function loadCategories() {
      try {
        setCategoriesLoading(true);
        const response = await categoryService.getCategories();
        const cats = response.data?.data?.categories || [];
        setCategories(cats);
      } catch (err) {
        console.error('Failed to load categories:', err);
        // Fallback: use empty array - user can still submit with category field
        setCategories([]);
      } finally {
        setCategoriesLoading(false);
      }
    }

    loadCategories();
  }, [open]);

  // ==========================================
  // Load existing item when editing
  // ==========================================
  useEffect(() => {
    if (!open) return;

    if (initialItem) {
      const categoryValue =
        initialItem.categoryId ||
        initialItem.category?._id ||
        initialItem.category ||
        '';

      setForm({
        name: initialItem.name || '',

        category: categoryValue,

        number:
          initialItem.quantity?.number ??
          '',

        units:
          initialItem.quantity?.units ||
          '',

        expiryDate:
          initialItem.expiryDate
            ? initialItem.expiryDate.split('T')[0]
            : '',

        storageLocation:
          initialItem.storageLocation ||
          '',

        description:
          initialItem.description ||
          '',

        foodImage: null,
      });
    } else {
      setForm({
        ...EMPTY_FORM,
        units: UNITS[0] || '',
        storageLocation:
          STORAGE_LOCATIONS[0] || '',
      });
    }

    setError('');
  }, [open, initialItem]);

  // ==========================================
  // Update form
  // ==========================================
  function update(field, value) {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  // ==========================================
  // Submit
  // ==========================================
  async function handleSubmit(e) {
    e.preventDefault();

    if (
      !requiredFieldsFilled({
        name: form.name,
        quantity: form.number,
        expiryDate: form.expiryDate,
      })
    ) {
      setError(
        'Please complete all required fields.'
      );
      return;
    }

    if (
      Number(form.number) <= 0
    ) {
      setError(
        'Quantity must be greater than 0.'
      );
      return;
    }

    if (
      !isEditMode &&
      !form.foodImage
    ) {
      setError(
        'Please select a food image.'
      );
      return;
    }

    try {
      setSaving(true);
      setError('');

      const formData =
        new FormData();

      formData.append(
        'name',
        form.name
      );

      formData.append(
        'number',
        Number(form.number)
      );

      formData.append(
        'units',
        form.units
      );

      formData.append(
        'expiryDate',
        form.expiryDate
      );

      formData.append(
        'status',
        initialItem?.status ||
          'Available'
      );

      formData.append(
        'description',
        form.description
      );

      formData.append(
        'storageLocation',
        form.storageLocation
      );

      // Send category ObjectId from backend
      formData.append(
        'category',
        form.category
      );

      if (form.foodImage) {
        formData.append(
          'foodImage',
          form.foodImage
        );
      }

      await onSave(formData);

      onClose();
    } catch (error) {
      console.error(error);

      setError(
        error.message ||
          'Failed to save food item.'
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={
        isEditMode
          ? 'Edit Food Item'
          : 'Add Food Item'
      }
      subtitle={
        isEditMode
          ? 'Update details for this pantry item'
          : 'Log a new item to your digital pantry'
      }
      footer={
        <>
          <Button
            variant="ghost"
            onClick={onClose}
            type="button"
            disabled={saving}
          >
            Cancel
          </Button>

          <Button
            icon="save"
            type="submit"
            form="item-form"
            disabled={saving}
          >
            {saving
              ? 'Saving...'
              : isEditMode
                ? 'Save Changes'
                : 'Save to Pantry'}
          </Button>
        </>
      }
    >
      <form
        id="item-form"
        className="p-lg space-y-lg"
        onSubmit={handleSubmit}
      >
        {/* Food Image */}
        <div className="flex flex-col items-center justify-center p-xl border-2 border-dashed border-outline-variant rounded-xl bg-surface-container-lowest">
          <div className="w-14 h-14 bg-primary-fixed rounded-full flex items-center justify-center mb-sm">
            <span className="material-symbols-outlined text-primary text-2xl">
              add_a_photo
            </span>
          </div>

          <p className="font-label-md text-on-surface">
            Upload a photo
          </p>

          <p className="text-label-sm text-on-surface-variant mb-md">
            Food image is required when adding a new item
          </p>

          <input
            type="file"
            accept="image/*"
            onChange={(e) =>
              update(
                'foodImage',
                e.target.files?.[0] ||
                  null
              )
            }
            className="block w-full text-sm"
          />

          {isEditMode &&
            initialItem?.foodImage && (
              <img
                src={
                  initialItem.foodImage
                }
                alt={
                  initialItem.name
                }
                className="mt-md w-32 h-24 object-cover rounded-lg"
              />
            )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
          {/* Name */}
          <div className="md:col-span-2">
            <Input
              label="Item Name"
              placeholder="e.g. Organic Red Lentils"
              value={form.name}
              onChange={(e) =>
                update(
                  'name',
                  e.target.value
                )
              }
              required
            />
          </div>

          {/* Category - fetched from backend */}
          <Select
            label="Category"
            value={form.category}
            onChange={(e) =>
              update(
                'category',
                e.target.value
              )
            }
          >
            {categoriesLoading ? (
              <option value="">Loading...</option>
            ) : categories.length === 0 ? (
              <option value="">No categories available</option>
            ) : (
              categories.map((cat) => (
                <option
                  key={cat._id}
                  value={cat._id}
                >
                  {cat.name}
                </option>
              ))
            )}
          </Select>

          {/* Quantity */}
          <div className="flex gap-xs">
            <div className="w-2/3">
              <Input
                label="Quantity"
                type="number"
                min="0"
                step="0.01"
                placeholder="0"
                value={form.number}
                onChange={(e) =>
                  update(
                    'number',
                    e.target.value
                  )
                }
                required
              />
            </div>

            <div className="w-1/3">
              <Select
                label="Unit"
                value={form.units}
                onChange={(e) =>
                  update(
                    'units',
                    e.target.value
                  )
                }
              >
                {UNITS.map((unit) => (
                  <option
                    key={unit}
                    value={unit}
                  >
                    {unit}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          {/* Expiry */}
          <Input
            label="Best Before / Expiry"
            type="date"
            value={form.expiryDate}
            onChange={(e) =>
              update(
                'expiryDate',
                e.target.value
              )
            }
            required
          />

          {/* Storage */}
          <Select
            label="Storage Location"
            value={
              form.storageLocation
            }
            onChange={(e) =>
              update(
                'storageLocation',
                e.target.value
              )
            }
          >
            {STORAGE_LOCATIONS.map(
              (location) => (
                <option
                  key={location}
                  value={location}
                >
                  {location}
                </option>
              )
            )}
          </Select>

          {/* Description */}
          <div className="md:col-span-2">
            <label className="font-label-md text-label-md text-on-surface-variant block mb-xs">
              Description
            </label>

            <textarea
              className="w-full bg-surface-container-low border-none border-b-2 border-outline-variant focus:border-primary focus:ring-0 px-md py-md text-body-md inner-stamped rounded-t-lg transition-all resize-none"
              placeholder="Add details about this food item..."
              rows={3}
              value={
                form.description
              }
              onChange={(e) =>
                update(
                  'description',
                  e.target.value
                )
              }
            />
          </div>
        </div>

        {error && (
          <p className="text-error text-label-sm">
            {error}
          </p>
        )}

        <div className="p-md bg-tertiary-fixed/20 rounded-lg flex items-start gap-md border border-tertiary-fixed">
          <span className="material-symbols-outlined text-tertiary">
            info
          </span>

          <p className="text-label-sm text-on-tertiary-fixed-variant">
            Adding an expiry date helps us send timely notifications before items go to waste.
          </p>
        </div>
      </form>
    </Modal>
  );
}
