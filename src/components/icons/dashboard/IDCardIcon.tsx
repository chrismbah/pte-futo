interface IDCardIconProps {
  className?: string;
  color?: string;
}

export const IDCardIcon = ({ className, color = "currentColor" }: IDCardIconProps) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill={color}
      className={className}
    >
      <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zM4 6h16v2H4V6zm0 12v-6h16v6H4zm2-4h4v2H6v-2zm6 0h6v2h-6v-2zm-6-2h3v2H6v-2z" />
    </svg>
  );
};
