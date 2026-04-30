export default function Avatar({ initials, color, size = 28 }) {
  return (
    <div
      className="dh-cav"
      style={{ background: color, width: size, height: size, fontSize: size * 0.38 }}
    >
      {initials}
    </div>
  );
}