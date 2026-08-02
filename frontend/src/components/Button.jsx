import { Link } from "react-router-dom"

function Button({
  children,
  variant = "solid",
  className = "",
  to,
  type = "submit",
  disabled,
  onClick,
  navigateState,
}) {
  const base =
    "inline-flex items-center justify-center px-6 py-3 rounded-full font-bold text-sm transition-transform hover:scale-105 shadow-[0px_6px_12px_0px_rgba(249,192,106,0.35)]"
  const styles =
    variant === "solid"
      ? "bg-[#f9c06a] text-[#1e1e1e]"
      : "bg-transparent border border-white/60 text-white"
  const state = disabled ? "opacity-50 pointer-events-none" : ""
  const classes = `${base} ${styles} ${state} ${className}`
  if (to)
    return (
      <Link to={to} state={navigateState} onClick={onClick} className={classes}>
        {children}
      </Link>
    )
  return (
    <button type={type} disabled={disabled} onClick={onClick} className={classes}>
      {children}
    </button>
  )
}

export default Button
