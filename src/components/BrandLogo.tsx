import { Link } from "react-router-dom";

const BrandLogo = ({ variant = "color" }: { variant?: "color" | "white" }) => {
  const isWhite = variant === "white";

  return (
    <Link to="/" className="flex items-center gap-3 group">
      {/* Lotus Icon */}
      <svg
        viewBox="0 0 48 48"
        className="w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M24 8C24 8 20 18 20 26C20 30 22 32 24 32C26 32 28 30 28 26C28 18 24 8 24 8Z"
          fill={isWhite ? "rgba(255,255,255,0.95)" : "hsl(288, 72%, 38%)"}
        />
        <path
          d="M18 12C18 12 10 20 10 27C10 31 13 33 16 31C19 29 20 24 18 12Z"
          fill={isWhite ? "rgba(255,255,255,0.8)" : "hsl(288, 65%, 45%)"}
        />
        <path
          d="M13 16C13 16 6 23 6 29C6 33 9 34 12 32C15 30 15 26 13 16Z"
          fill={isWhite ? "rgba(255,255,255,0.6)" : "hsl(288, 55%, 55%)"}
        />
        <path
          d="M30 12C30 12 38 20 38 27C38 31 35 33 32 31C29 29 28 24 30 12Z"
          fill={isWhite ? "rgba(255,255,255,0.8)" : "hsl(288, 65%, 45%)"}
        />
        <path
          d="M35 16C35 16 42 23 42 29C42 33 39 34 36 32C33 30 33 26 35 16Z"
          fill={isWhite ? "rgba(255,255,255,0.6)" : "hsl(288, 55%, 55%)"}
        />
        <path
          d="M24 32C24 32 22 36 18 40"
          stroke={isWhite ? "rgba(255,255,255,0.7)" : "hsl(288, 60%, 42%)"}
          strokeWidth="1.5"
          strokeLinecap="round"
          fill="none"
        />
      </svg>

      {/* Text */}
      <div className="flex flex-col leading-none">
        <span
          className={`font-serif text-xl sm:text-2xl font-bold italic tracking-wide ${
            isWhite ? "text-white" : "text-primary"
          }`}
        >
          Delphine Nforgwei
        </span>
        <span
          className={`text-[9px] sm:text-[10px] tracking-[0.25em] uppercase mt-1 ${
            isWhite ? "text-white/70" : "text-primary/60"
          }`}
        >
          Women · Family · Purpose
        </span>
      </div>
    </Link>
  );
};

export default BrandLogo;
