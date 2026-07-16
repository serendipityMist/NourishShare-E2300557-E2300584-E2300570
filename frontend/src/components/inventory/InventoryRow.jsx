import { Link } from 'react-router-dom';
import Badge from '../ui/Badge.jsx';
import { formatDate, getExpiryStatus } from '../../utils/dateUtils';

export default function InventoryRow({ item, onEdit, onDelete, onMarkUsed, onConvertToDonation }) {
  const status = getExpiryStatus(item.expiryDate);
  const statusLabel = { fresh: 'Fresh', expiring: 'Expiring', expired: 'Expired' }[status] || 'Fresh';

  return (
    <tr className="ledger-row hover:bg-surface-container-low transition-colors">
      <td className="px-lg py-md">
        <Link to={`/inventory/${item.id}`} className="flex items-center gap-md">
          <div className="w-12 h-12 rounded-lg bg-surface-container border border-outline-variant overflow-hidden shrink-0">
            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
          </div>
          <div>
            <p className="font-body-md font-semibold text-primary">{item.name}</p>
            <p className="font-label-sm text-on-surface-variant">
              {item.category} • {item.quantity} {item.unit}
            </p>
          </div>
        </Link>
      </td>
      <td className="px-lg py-md">
        <span className="bg-tertiary-fixed text-on-tertiary-fixed-variant px-sm py-unit rounded-md text-label-sm font-medium border border-tertiary-container/20">
          {item.storageLocation}
        </span>
      </td>
      <td className="px-lg py-md font-body-md">{item.quantity} {item.unit}</td>
      <td className="px-lg py-md font-body-md text-on-surface-variant">{formatDate(item.expiryDate)}</td>
      <td className="px-lg py-md">
        <Badge status={status}>{statusLabel}</Badge>
      </td>
      <td className="px-lg py-md text-right">
        <div className="flex items-center justify-end gap-xs text-on-surface-variant">
          <button
            title="Mark as used"
            className="p-xs hover:text-primary transition-colors"
            onClick={() => onMarkUsed(item)}
          >
            <span className="material-symbols-outlined text-[20px]">restaurant</span>
          </button>
          <button
            title="Convert to donation"
            className="p-xs hover:text-secondary transition-colors"
            onClick={() => onConvertToDonation(item)}
          >
            <span className="material-symbols-outlined text-[20px]">volunteer_activism</span>
          </button>
          <button title="Edit" className="p-xs hover:text-primary transition-colors" onClick={() => onEdit(item)}>
            <span className="material-symbols-outlined text-[20px]">edit</span>
          </button>
          <button title="Delete" className="p-xs hover:text-error transition-colors" onClick={() => onDelete(item)}>
            <span className="material-symbols-outlined text-[20px]">delete</span>
          </button>
        </div>
      </td>
    </tr>
  );
}
