import { useRef } from "react"
import { Link } from "react-router-dom"
import { useMagnetic } from "../lib/usePointerFx"

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
  const ref = useRef(null)
  useMagnetic(ref)

  const base =
    "group relative overflow-hidden isolate inline-flex items-center justify-center px-6 py-3 rounded-full font-bold text-sm shadow-[0px_6px_12px_0px_rgba(249,192,106,0.35)]"
  const styles =
    variant === "solid"
      ? "bg-[#f9c06a] text-[#1e1e1e]"
      : "bg-transparent border border-white/60 text-white"
  const state = disabled ? "opacity-50 pointer-events-none" : ""
  const classes = `${base} ${styles} ${state} ${className}`
  const content = (
    <>
      <span
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[#603809] translate-y-full rounded-[50%] group-hover:translate-y-0 group-hover:rounded-none transition-all duration-500 ease-[cubic-bezier(0.19,1,0.22,1)]"
      />
      <span className="relative transition-colors duration-300 group-hover:text-white">{children}</span>
    </>
  )
  if (to)
    return (
      <Link ref={ref} to={to} state={navigateState} onClick={onClick} className={classes}>
        {content}
      </Link>
    )
  return (
    <button ref={ref} type={type} disabled={disabled} onClick={onClick} className={classes}>
      {content}
    </button>
  )
}

export default Button
