import { NavLink } from 'react-router-dom';

const NAV_ITEMS = [
  { to: '/', label: 'Home', icon: 'home', end: true },
  { to: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
  { to: '/inventory', label: 'Inventory', icon: 'inventory_2' },
  { to: '/donations', label: 'Donations', icon: 'volunteer_activism' },
  { to: '/meal-planner', label: 'Meal Planner', icon: 'calendar_month' },
  { to: '/notifications', label: 'Notifications', icon: 'notifications' },
  { to: '/settings', label: 'Settings', icon: 'settings' },
];

export default function Sidebar({ open = false, onClose }) {
  return (
    <>
      {open && (
        <div
          className="fixed inset-0 bg-inverse-surface/40 z-40 md:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={`h-screen w-64 fixed left-0 top-0 border-r border-outline-variant bg-surface flex flex-col py-lg px-md z-50 transition-transform duration-300 ${
          open ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="mb-xl px-sm flex items-center justify-between">
          <div>
            <h1 className="font-headline-md text-headline-md font-bold text-primary">SavePlate</h1>
            <p className="font-label-sm text-on-surface-variant opacity-70">Smart Food Waste Reduction</p>
          </div>
          <button className="md:hidden p-xs" onClick={onClose} aria-label="Close menu">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <nav className="flex-1 space-y-1">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-md px-md py-sm rounded-lg transition-colors group ${
                  isActive
                    ? 'text-primary font-bold border-r-4 border-primary bg-surface-container-high'
                    : 'text-on-surface-variant hover:bg-surface-container'
                }`
              }
            >
              <span className="material-symbols-outlined group-hover:scale-110 transition-transform">
                {item.icon}
              </span>
              <span className="font-label-md text-label-md">{item.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="mt-auto pt-lg border-t border-outline-variant">
          <NavLink
            to="/inventory?add=1"
            className="w-full bg-primary text-on-primary py-md px-lg rounded-full font-label-md flex items-center justify-center gap-sm active:scale-95 transition-transform sticker-shadow"
          >
            <span className="material-symbols-outlined">add</span>
            <span>Add Food Item</span>
          </NavLink>
        </div>
      </aside>
    </>
  );
}
