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

export const STORAGE_LOCATIONS = ['Refrigerator', 'Freezer', 'Pantry'];

export const UNITS = ['KG', 'g', 'L', 'ml', 'Pieces', 'Packets', 'Boxes', 'Bottles', 'Cans'];

export const INITIAL_INVENTORY = [
  {
    _id: 'inv-1',
    name: 'Farmhouse Milk',
    category: 'Dairy & Eggs',
    quantity: { number: 1, units: 'L' },
    storageLocation: 'Refrigerator',
    expiryDate: addDays(2),
    description: '2L bottle, opened.',
    foodImage: img('milk'),
    status: 'Available',
  },
  {
    _id: 'inv-2',
    name: 'Vine Tomatoes',
    category: 'Fresh Produce',
    quantity: { number: 2, units: 'Packets' },
    storageLocation: 'Refrigerator',
    expiryDate: addDays(10),
    description: 'Crisper drawer.',
    foodImage: img('tomatoes'),
    status: 'Available',
  },
  {
    _id: 'inv-3',
    name: 'Basmati Rice',
    category: 'Grains & Legumes',
    quantity: { number: 1, units: 'KG' },
    storageLocation: 'Pantry',
    expiryDate: addDays(280),
    description: '5kg bag, dry goods unit.',
    foodImage: img('rice'),
    status: 'Available',
  },
  {
    _id: 'inv-4',
    name: 'Greek Yogurt',
    category: 'Dairy & Eggs',
    quantity: { number: 1, units: 'Pieces' },
    storageLocation: 'Refrigerator',
    expiryDate: addDays(-3),
    description: 'Shelf 1.',
    foodImage: img('yogurt'),
    status: 'Available',
  },
  {
    _id: 'inv-5',
    name: 'Organic Star Anise',
    category: 'Spices & Herbs',
    quantity: { number: 150, units: 'g' },
    storageLocation: 'Pantry',
    expiryDate: addDays(142),
    description: 'Sourced from Penang market. Keep airtight, away from sunlight.',
    foodImage: img('anise'),
    status: 'Available',
  },
  {
    _id: 'inv-6',
    name: "Bird's Eye Chilies",
    category: 'Fresh Produce',
    quantity: { number: 200, units: 'g' },
    storageLocation: 'Refrigerator',
    expiryDate: addDays(3),
    description: '',
    foodImage: img('chilies'),
    status: 'Available',
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
    status: 'available',
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
