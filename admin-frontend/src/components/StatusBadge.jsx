export default function StatusBadge({ status }) {
  return (
    <span className={`dh-status s-${status}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}