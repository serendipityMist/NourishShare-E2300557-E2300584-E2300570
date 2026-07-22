export default function Avatar({
  src,
  name = 'User',
  size = 10,
  className = '',
}) {
  const fallbackUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=4f46e5&color=fff&bold=true`;

  const sizeClass = {
    8: 'w-8 h-8',
    10: 'w-10 h-10',
    11: 'w-11 h-11',
    12: 'w-12 h-12',
    14: 'w-14 h-14',
    16: 'w-16 h-16',
    20: 'w-20 h-20',
    24: 'w-24 h-24',
    28: 'w-28 h-28',
  }[size] || `w-${size} h-${size}`;

  const imgSrc = src && src.trim() ? src : fallbackUrl;

  function handleError(e) {
    e.target.src = fallbackUrl;
  }

  return (
    <img
      src={imgSrc}
      alt={name}
      onError={handleError}
      className={`${sizeClass} aspect-square rounded-full object-cover object-center border-2 border-primary bg-gray-100 ${className}`}
    />
  );
}

