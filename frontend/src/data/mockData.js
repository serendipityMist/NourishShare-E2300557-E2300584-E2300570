import artisanBreadImage from '../assets/Artisan Bread and Pastry.jpg';
import essentialPantryImage from '../assets/EssentialPantry.jpg';

// Simple placeholder image generator so the app runs without external image deps
const img = (seed, w = 400, h = 300) => `https://picsum.photos/seed/${seed}/${w}/${h}`;

export const CATEGORIES = [
  'Dairy & Eggs',
  'Fresh Produce',
  'Grains & Legumes',
  'Spices & Herbs',
  'Canned Goods',
  'Bakery',
];

export const STORAGE_LOCATIONS = ['Refrigerator', 'Freezer', 'Main Pantry', 'Countertop', 'Spice Rack'];

export const UNITS = ['kg', 'g', 'pcs', 'liters', 'bags', 'unit', 'pack'];

export const INITIAL_INVENTORY = [
  {
    id: 'inv-1',
    name: 'Farmhouse Milk',
    category: 'Dairy & Eggs',
    quantity: 1,
    unit: 'unit',
    storageLocation: 'Refrigerator',
    expiryDate: addDays(2),
    notes: '2L bottle, opened.',
    image: img('milk'),
    status: 'active', // 'active' | 'used' | 'donated'
  },
  {
    id: 'inv-2',
    name: 'Vine Tomatoes',
    category: 'Fresh Produce',
    quantity: 2,
    unit: 'pack',
    storageLocation: 'Refrigerator',
    expiryDate: addDays(10),
    notes: 'Crisper drawer.',
    image: img('tomatoes'),
    status: 'active',
  },
  {
    id: 'inv-3',
    name: 'Basmati Rice',
    category: 'Grains & Legumes',
    quantity: 1,
    unit: 'bags',
    storageLocation: 'Main Pantry',
    expiryDate: addDays(280),
    notes: '5kg bag, dry goods unit.',
    image: img('rice'),
    status: 'active',
  },
  {
    id: 'inv-4',
    name: 'Greek Yogurt',
    category: 'Dairy & Eggs',
    quantity: 1,
    unit: 'pcs',
    storageLocation: 'Refrigerator',
    expiryDate: addDays(-3),
    notes: 'Shelf 1.',
    image: img('yogurt'),
    status: 'active',
  },
  {
    id: 'inv-5',
    name: 'Organic Star Anise',
    category: 'Spices & Herbs',
    quantity: 150,
    unit: 'g',
    storageLocation: 'Spice Rack',
    expiryDate: addDays(142),
    notes: 'Sourced from Penang market. Keep airtight, away from sunlight.',
    image: img('anise'),
    status: 'active',
  },
  {
    id: 'inv-6',
    name: "Bird's Eye Chilies",
    category: 'Fresh Produce',
    quantity: 200,
    unit: 'g',
    storageLocation: 'Refrigerator',
    expiryDate: addDays(3),
    notes: '',
    image: img('chilies'),
    status: 'active',
  },
];

export const INITIAL_DONATIONS = [
  {
    id: 'don-1',
    itemName: 'Fresh Organic Produce Box',
    category: 'Fresh Produce',
    quantity: 'Approx. 4.5kg',
    expiryDate: addDays(2),
    pickupLocation: 'Laman Serai Residence, Tower B Lobby',
    pickupWindow: '6:00 PM – 9:00 PM',
    notes:
      'Harvested from my backyard garden this morning. Pesticide-free. Please bring your own reusable bag if possible.',
    donorName: 'Puan Siti Aminah',
    donorRole: 'Home Gardener • Kampung Baru',
    distanceKm: 0.8,
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80',
    status: 'available', // 'available' | 'claimed'
  },
  {
    id: 'don-2',
    itemName: 'Artisan Bread & Pastry',
    category: 'Bakery',
    quantity: '6 items',
    expiryDate: addDays(1),
    pickupLocation: 'Bangsar South',
    pickupWindow: 'All Day',
    notes: 'Verified pantry, freshly baked this morning.',
    donorName: 'Hana Bakery Collective',
    donorRole: 'Community Bakery',
    distanceKm: 1.2,
    image: artisanBreadImage,
    status: 'available',
  },
  {
    id: 'don-3',
    itemName: 'Local Fruit Basket',
    category: 'Fresh Produce',
    quantity: '3kg mixed fruit',
    expiryDate: addDays(4),
    pickupLocation: 'Taman Tun',
    pickupWindow: '5:00 PM - 8:00 PM',
    notes: 'Rambutan and mangoes from a home orchard.',
    donorName: 'Encik Wong',
    donorRole: 'Home Gardener',
    distanceKm: 2.5,
    image: img('fruit-basket'),
    status: 'claimed',
  },
  {
    id: 'don-4',
    itemName: 'Pantry Essentials',
    category: 'Grains & Legumes',
    quantity: 'Rice, lentils, canned beans',
    expiryDate: addDays(200),
    pickupLocation: 'KL City Center',
    pickupWindow: 'Until 10:00 PM',
    notes: 'Unopened staples, moving overseas and can\'t bring them.',
    donorName: 'Mei Ling',
    donorRole: 'Verified Donor',
    distanceKm: 0.4,
    image: essentialPantryImage,
    status: 'available',
  },
  {
    id: 'don-5',
    itemName: 'Home-cooked Curry',
    category: 'Cooked Meals',
    quantity: '4 servings',
    expiryDate: addDays(1),
    pickupLocation: 'Shah Alam',
    pickupWindow: 'Best by 8:00 PM',
    notes: 'Chicken curry, mild spice. Made too much for a gathering.',
    donorName: 'Aunty Rosnah',
    donorRole: 'Verified Donor',
    distanceKm: 3.1,
    image: img('curry'),
    status: 'available',
  },
];

function addDays(n) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}
