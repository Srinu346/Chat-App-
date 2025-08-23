interface ButtonProps {
    label?: string;
    onClick?: () => void;
    onJoin?: () => void;
    className?: string;
    icon ?: React.ReactNode;
}
export const Button: React.FC<ButtonProps> = ({ label, onClick, onJoin, className, icon }) => {
  return (
    <button
      className={`flex items-center justify-center bg-[#222222] text-lg py-2 px-4 rounded-lg hover:bg-[#444444] transition duration-300 ${className}`}
      onClick={() => {
        onClick && onClick();
        onJoin && onJoin();
      }}
    >
      {icon && <span className={`${label ? "mr-2" : ""}`}>{icon}</span>}
      {label}
    </button>
  );
};
