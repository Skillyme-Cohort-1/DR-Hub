export function Logo({ className = "" }) {
  return (
    <div className={`flex items-center ${className}`}>
      <span className="text-[28px] tracking-tight">
        <span style={{ fontWeight: 700, color: 'inherit' }}>The DR</span>
        <span style={{ fontWeight: 700, color: '#E87722' }}>hub</span>
      </span>
    </div>
  );
}