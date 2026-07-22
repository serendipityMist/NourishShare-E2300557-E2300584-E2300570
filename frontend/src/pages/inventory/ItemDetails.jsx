
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';

import AppLayout from '../../components/layout/AppLayout.jsx';
import Button from '../../components/ui/Button.jsx';
import Badge from '../../components/ui/Badge.jsx';
import Modal from '../../components/ui/Modal.jsx';
import Select from '../../components/ui/Select.jsx';
import AddEditItemModal from '../../components/inventory/AddEditItemModal.jsx';
import ConfirmDeleteModal from '../../components/inventory/ConfirmDeleteModal.jsx';
import CreateDonationModal from '../../components/donations/CreateDonationModal.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';

import { foodService } from '../../services/foodService';
import { donationService } from '../../services/donationService';
import { mealPlanService } from '../../services/mealPlanService';
import { useNotifications } from '../../hooks/useNotifications';

import {
  daysUntil,
  formatDate,
  getExpiryStatus,
} from '../../utils/dateUtils';

export default function ItemDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const { showToast } = useNotifications();

  const MEAL_DAYS = [
    'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
  ];
  const MEAL_TYPES = ['Breakfast', 'Lunch', 'Dinner'];

  // =====================================================
  // State
  // =====================================================

  const [item, setItem] = useState(null);

  const [loading, setLoading] = useState(true);

  const [editOpen, setEditOpen] = useState(false);

  const [deleteOpen, setDeleteOpen] = useState(false);

  const [donateOpen, setDonateOpen] = useState(false);

  const [planMealOpen, setPlanMealOpen] = useState(false);

  const [planForm, setPlanForm] = useState({
    day: 'Monday',
    mealType: 'Dinner',
  });

  const [actionLoading, setActionLoading] = useState(false);

  // =====================================================
  // Fetch Food Details
  // =====================================================

  useEffect(() => {
    if (id) {
      fetchFoodDetails();
    }
  }, [id]);

  useEffect(() => {
    if (searchParams.get('donate') === '1' && item?.status === 'Available') {
      setDonateOpen(true);
    }
  }, [searchParams, item]);

  async function fetchFoodDetails() {
    try {
      setLoading(true);

      const response = await foodService.getFoodDetails(id);

      console.log(
        'Food Details API Response:',
        response.data
      );

      /*
        Expected backend response:

        {
          statusCode: 200,
          data: {
            food: {
              _id,
              name,
              quantity: {
                number,
                units
              },
              expiryDate,
              status,
              description,
              storageLocation,
              foodImage,
              category
            }
          },
          message: "Food data fetched successfully"
        }
      */

      const food = response.data?.data?.food;

      if (!food) {
        throw new Error('Food item not found');
      }

      setItem(food);

    } catch (error) {
      console.error(
        'Error fetching food details:',
        error
      );

      showToast(
        error.response?.data?.message ||
          'Unable to load food details',
        'error'
      );

      setItem(null);

    } finally {
      setLoading(false);
    }
  }

  // =====================================================
  // Mark Food as Used
  // =====================================================

  async function handleMarkAsUsed() {
    if (!item) return;

    try {
      setActionLoading(true);

      const response =
        await foodService.markFoodAsUsed(item._id);

      console.log(
        'Mark As Used Response:',
        response.data
      );

      // Update UI immediately
      setItem((previousItem) => ({
        ...previousItem,
        status: 'Used',
      }));

      showToast(
        `${item.name} marked as used`,
        'success'
      );

    } catch (error) {
      console.error(
        'Error marking food as used:',
        error
      );

      showToast(
        error.response?.data?.message ||
          'Unable to mark food as used',
        'error'
      );

    } finally {
      setActionLoading(false);
    }
  }

  // =====================================================
  // Edit Food Item
  // =====================================================

  async function handleUpdateFood(formData) {
    if (!item) return;

    try {
      setActionLoading(true);

      /*
        AddEditItemModal should send:

        {
          name,
          number,
          units,
          expiryDate,
          status,
          description,
          storageLocation,
          category,
          foodImage
        }
      */

      const response =
        await foodService.editFoodItem(
          item._id,
          formData
        );

      console.log(
        'Edit Food Response:',
        response.data
      );

      const updatedFood =
        response.data?.data?.food;

      if (updatedFood) {
        setItem(updatedFood);
      } else {
        // Fetch latest data if backend
        // does not return updated food
        await fetchFoodDetails();
      }

      setEditOpen(false);

      showToast(
        'Food item updated successfully',
        'success'
      );

    } catch (error) {
      console.error(
        'Error updating food:',
        error
      );

      showToast(
        error.response?.data?.message ||
          'Unable to update food item',
        'error'
      );

    } finally {
      setActionLoading(false);
    }
  }

  // =====================================================
  // Delete Food Item
  // =====================================================

  async function handleDeleteFood() {
    if (!item) return;

    try {
      setActionLoading(true);

      await foodService.deleteFoodItem(
        item._id
      );

      showToast(
        `${item.name} removed from pantry`,
        'success'
      );

      setDeleteOpen(false);

      navigate('/inventory');

    } catch (error) {
      console.error(
        'Error deleting food:',
        error
      );

      showToast(
        error.response?.data?.message ||
          'Unable to delete food item',
        'error'
      );

    } finally {
      setActionLoading(false);
    }
  }

  // =====================================================
  // Convert Food to Donation
  // =====================================================

  async function handleCreateDonation(
    donationData
  ) {
    if (!item) return;

    try {
      setActionLoading(true);

      /*
        donationData should contain:

        {
          pickUpLocation,
          availabilityTime
        }
      */

      const response =
        await donationService.convertToDonation(
          item._id,
          donationData
        );

      console.log(
        'Convert To Donation Response:',
        response.data
      );

      setDonateOpen(false);

      showToast(
        'Food item successfully listed for donation',
        'success'
      );

      navigate('/donations');

    } catch (error) {
      console.error(
        'Error converting food to donation:',
        error
      );

      showToast(
        error.response?.data?.message ||
          'Unable to create donation',
        'error'
      );

    } finally {
      setActionLoading(false);
    }
  }

  async function handlePlanForMeal() {
    if (!item) return;

    try {
      setActionLoading(true);

      await mealPlanService.addMealPlanEntry({
        foodId: item._id,
        day: planForm.day,
        mealType: planForm.mealType,
        mealName: item.name,
      });

      setPlanMealOpen(false);
      showToast(`${item.name} added to your meal plan`, 'success');
      navigate('/meal-planner');
    } catch (error) {
      showToast(
        error.response?.data?.message || 'Unable to add item to meal plan',
        'error'
      );
    } finally {
      setActionLoading(false);
    }
  }

  // =====================================================
  // Loading Screen
  // =====================================================

  if (loading) {
    return (
      <AppLayout title="Item Details">

        <div className="flex items-center justify-center min-h-[400px]">

          <div className="text-center">

            <span className="material-symbols-outlined text-5xl text-primary animate-spin">
              progress_activity
            </span>

            <p className="mt-md text-on-surface-variant font-body-md">
              Loading food details...
            </p>

          </div>

        </div>

      </AppLayout>
    );
  }

  // =====================================================
  // Item Not Found
  // =====================================================

  if (!item) {
    return (
      <AppLayout title="Item Details">

        <EmptyState
          icon="search_off"
          title="Item not found"
          message="This pantry item may have been removed or does not exist."
          action={
            <Link to="/inventory">
              <Button>
                Back to Inventory
              </Button>
            </Link>
          }
        />

      </AppLayout>
    );
  }

  // =====================================================
  // Backend Data Mapping
  // =====================================================

  const categoryName =
    typeof item.category === 'object'
      ? item.category?.name
      : item.category;

  const quantityNumber =
    item.quantity?.number ?? 0;

  const quantityUnit =
    item.quantity?.units ?? '';

  const image =
    item.foodImage ||
    'https://via.placeholder.com/800x600?text=No+Food+Image';

  const status =
    getExpiryStatus(item.expiryDate);

  const days =
    daysUntil(item.expiryDate);

  // =====================================================
  // Page UI
  // =====================================================

  return (
    <AppLayout title="Item Details">

      {/* ================================================
          Back Button
      ================================================= */}

      <div className="flex items-center gap-sm mb-lg">

        <Link
          to="/inventory"
          className="material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors"
        >
          arrow_back
        </Link>

        <Link
          to="/inventory"
          className="font-label-md text-primary"
        >
          Back to Inventory
        </Link>

      </div>


      {/* ================================================
          Item Header
      ================================================= */}

      <div className="flex flex-col md:flex-row justify-between md:items-end gap-md mb-xl">

        <div>

          <div className="flex items-center gap-sm mb-xs">

            <span className="bg-primary-fixed text-on-primary-fixed-variant px-sm py-xs text-[10px] uppercase font-bold tracking-widest rounded-sm border border-outline-variant">

              {item.status === 'Used'
                ? 'Used'
                : item.status === 'Donated'
                ? 'Donated'
                : 'Pantry Essential'}

            </span>

            <span className="text-on-surface-variant font-label-md">
              {categoryName || 'Uncategorized'}
            </span>

          </div>


          <h2 className="font-headline-xl text-headline-xl text-primary">
            {item.name}
          </h2>


          <p className="text-on-surface-variant font-body-md flex items-center gap-xs">

            <span className="material-symbols-outlined text-sm">
              location_on
            </span>

            {item.storageLocation}

          </p>

        </div>


        {/* ============================================
            Action Buttons
        ============================================= */}

        <div className="flex gap-md flex-wrap">

          {item.status === 'Available' && (
            <Button
              variant="outline"
              icon="calendar_month"
              onClick={() => setPlanMealOpen(true)}
              disabled={actionLoading}
            >
              Plan for Meal
            </Button>
          )}

          {/* Mark Used */}

          {item.status === 'Available' && (
            <Button
              variant="outline"
              icon="restaurant"
              onClick={handleMarkAsUsed}
              disabled={actionLoading}
            >
              Mark as Used
            </Button>
          )}


          {/* Edit */}

          <Button
            variant="outline"
            icon="edit"
            onClick={() =>
              setEditOpen(true)
            }
            disabled={actionLoading}
          >
            Edit
          </Button>


          {/* Donation */}

          {item.status === 'Available' && (
            <Button
              icon="volunteer_activism"
              onClick={() =>
                setDonateOpen(true)
              }
              disabled={actionLoading}
            >
              List for Donation
            </Button>
          )}

        </div>

      </div>


      {/* ================================================
          Main Content
      ================================================= */}

      <div className="grid grid-cols-12 gap-xl mb-xl">


        {/* ==============================================
            Food Image
        =============================================== */}

        <div className="col-span-12 lg:col-span-7">

          <div className="aspect-[4/3] rounded-xl overflow-hidden bg-surface-container relative">

            <img
              src={image}
              alt={item.name}
              className="w-full h-full object-cover"
            />


            {/* Description */}

            {item.description && (
              <div className="absolute bottom-md left-md bg-surface/90 backdrop-blur-sm p-md rounded-lg border border-outline-variant shadow-sm max-w-xs">

                <p className="text-on-surface-variant font-label-sm uppercase tracking-tighter mb-xs">
                  Description
                </p>

                <p className="text-body-md leading-snug">
                  {item.description}
                </p>

              </div>
            )}

          </div>

        </div>


        {/* ==============================================
            Food Information
        =============================================== */}

        <div className="col-span-12 lg:col-span-5 flex flex-col gap-lg">


          {/* Expiry Status */}

          <div className="bg-surface-container-low p-lg border border-outline-variant relative overflow-hidden">

            <div className="flex justify-between items-center mb-md relative z-10">

              <h3 className="font-label-md text-on-surface-variant">
                EXPIRY STATUS
              </h3>

              <Badge status={status}>

                {days < 0
                  ? `Expired ${Math.abs(days)}d ago`
                  : days === 0
                  ? 'Expires today'
                  : `${days} days left`}

              </Badge>

            </div>


            {/* Expiry Progress */}

            <div className="h-3 w-full bg-surface-variant rounded-full overflow-hidden relative z-10">

              <div
                className={`h-full rounded-full ${
                  status === 'expired'
                    ? 'bg-error'
                    : status === 'expiring'
                    ? 'bg-secondary'
                    : 'bg-primary'
                }`}
                style={{
                  width: `${Math.max(
                    5,
                    Math.min(
                      100,
                      100 - (days ?? 0)
                    )
                  )}%`,
                }}
              />

            </div>


            <div className="flex justify-between mt-sm text-on-surface-variant font-label-sm relative z-10">

              <span>
                Expires: {formatDate(item.expiryDate)}
              </span>

            </div>

          </div>


          {/* Quantity and Category */}

          <div className="grid grid-cols-2 gap-md">


            {/* Quantity */}

            <div className="p-md border border-outline-variant bg-surface">

              <p className="font-label-sm text-on-surface-variant uppercase tracking-widest mb-xs">
                Quantity
              </p>

              <p className="font-headline-md text-on-surface">

                {quantityNumber} {quantityUnit}

              </p>

            </div>


            {/* Category */}

            <div className="p-md border border-outline-variant bg-surface">

              <p className="font-label-sm text-on-surface-variant uppercase tracking-widest mb-xs">
                Category
              </p>

              <p className="font-headline-md text-on-surface">

                {categoryName || 'N/A'}

              </p>

            </div>

          </div>


          {/* Food Status */}

          <div className="p-md border border-outline-variant bg-surface">

            <p className="font-label-sm text-on-surface-variant uppercase tracking-widest mb-xs">
              Food Status
            </p>

            <p className="font-headline-md text-on-surface">

              {item.status}

            </p>

          </div>

        </div>

      </div>


      {/* ================================================
          Delete Button
      ================================================= */}

      <div className="mt-xl pt-lg border-t border-outline-variant flex justify-end">

        <button
          className="flex items-center gap-xs px-md py-sm text-error font-bold text-label-md hover:bg-error-container/20 transition-colors rounded-lg"
          onClick={() =>
            setDeleteOpen(true)
          }
          disabled={actionLoading}
        >

          <span className="material-symbols-outlined">
            delete
          </span>

          Remove from Pantry

        </button>

      </div>


      {/* ================================================
          Edit Modal
      ================================================= */}

      <AddEditItemModal
        open={editOpen}
        onClose={() =>
          setEditOpen(false)
        }
        onSave={handleUpdateFood}
        initialItem={{
          _id: item._id,

          name: item.name,

          category: categoryName,
          categoryId: item.category?._id || null,

          quantity: {
            number: quantityNumber,
            units: quantityUnit,
          },

          description:
            item.description || '',

          expiryDate:
            item.expiryDate
              ? item.expiryDate.split('T')[0]
              : '',

          storageLocation:
            item.storageLocation,

          foodImage:
            item.foodImage,

          status:
            item.status,
        }}
      />


      {/* ================================================
          Delete Modal
      ================================================= */}

      <ConfirmDeleteModal
        open={deleteOpen}
        onClose={() =>
          setDeleteOpen(false)
        }
        onConfirm={
          handleDeleteFood
        }
        itemName={
          item.name
        }
      />


      {/* ================================================
          Donation Modal
      ================================================= */}

      <CreateDonationModal
        open={donateOpen}
        onClose={() =>
          setDonateOpen(false)
        }
        onCreate={
          handleCreateDonation
        }
        fromInventoryItem={{
          _id: item._id,

          name: item.name,

          image: item.foodImage,

          foodImage: item.foodImage,

          category: categoryName,

          quantity: quantityNumber,

          unit: quantityUnit,

          expiryDate: item.expiryDate,

          description:
            item.description,

          storageLocation:
            item.storageLocation,
        }}
      />

      <Modal
        open={planMealOpen}
        onClose={() => setPlanMealOpen(false)}
        title="Plan for Meal"
        subtitle={`Add ${item.name} to your weekly meal plan`}
        footer={
          <>
            <Button variant="ghost" onClick={() => setPlanMealOpen(false)}>
              Cancel
            </Button>
            <Button icon="calendar_month" onClick={handlePlanForMeal} disabled={actionLoading}>
              Add to Meal Plan
            </Button>
          </>
        }
      >
        <div className="p-lg space-y-lg">
          <div>
            <label className="font-label-md block mb-sm">Day</label>
            <Select
              value={planForm.day}
              onChange={(e) => setPlanForm({ ...planForm, day: e.target.value })}
            >
              {MEAL_DAYS.map((day) => (
                <option key={day} value={day}>{day}</option>
              ))}
            </Select>
          </div>
          <div>
            <label className="font-label-md block mb-sm">Meal Type</label>
            <Select
              value={planForm.mealType}
              onChange={(e) => setPlanForm({ ...planForm, mealType: e.target.value })}
            >
              {MEAL_TYPES.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </Select>
          </div>
        </div>
      </Modal>

    </AppLayout>
  );
}

