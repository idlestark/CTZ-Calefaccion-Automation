import "./avatarStyle.css";

type Props = {
  name: string;
};

function Avatar({ name }: Props) {
  const size = 100;
  const parts = name.trim().split(/\s+/);
  const initials = (parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "");
  return (
    <div
      className="avatar rounded-circle d-flex align-items-center justify-content-center text-white"
      style={{ width: size, height: size, fontSize: size * 0.4 }}
    >
      {initials.toUpperCase()}
    </div>
  );
}

export default Avatar;
