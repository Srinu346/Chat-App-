interface ButtonProps {
  label?: string;
  onClick?: () => void;
  className?: string;
  icon?: React.ReactNode;
  variant?: "default" | "primary" | "danger";
}

export const Button: React.FC<ButtonProps> = ({ label, onClick, className, icon, variant = "default" }) => {
  const base = "flex items-center justify-center text-sm font-medium py-2 px-4 rounded-lg transition-all duration-200 cursor-pointer select-none";

  const variants = {
    default: "bg-white/[0.06] border border-white/[0.08] text-gray-300 hover:bg-white/[0.1] hover:text-white hover:border-white/[0.15]",
    primary: "bg-indigo-600 text-white hover:bg-indigo-500 shadow-md shadow-indigo-500/20",
    danger: "bg-transparent border border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300",
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${className || ""}`}
      onClick={() => {
        onClick && onClick();
      }}
    >
      {icon && <span className={`${label ? "mr-2" : ""}`}>{icon}</span>}
      {label}
    </button>
  );
};
