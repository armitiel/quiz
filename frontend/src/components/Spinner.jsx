export default function Spinner({ label = 'Ładowanie...' }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 p-8">
      <div className="animate-spin rounded-full h-16 w-16 border-[6px] border-forest-100 border-t-forest-500"></div>
      <p className="text-ink text-lg font-medium">{label}</p>
    </div>
  );
}
