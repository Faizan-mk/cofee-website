import { useState } from "react"
import { NavLink, Link, useLocation } from "react-router-dom"
import Button from "./Button"
import { useAuth } from "../context/auth"

const firstNameFromString = (name) => name.trim().split(/\s+/)[0]

const firstName = (user) => {
  const full = user?.user_metadata?.full_name
  if (full && full.trim()) return firstNameFromString(full)
  const base = (user?.email || "").split("@")[0]
  return base.split(/[.\-_+]/)[0]
}

const capitalize = (s) =>
  s.charAt(0).toUpperCase() + s.slice(1)

const links = [
  { label: "Home", to: "/" },
  { label: "Menu", to: "/menu" },
  { label: "About Us", to: "/about" },
  { label: "Contact Us", to: "/contact" },
]

function NavBar() {
  const [open, setOpen] = useState(false)
  const { pathname } = useLocation()
  const { user, signOut } = useAuth()
  const home = pathname === "/"

  const brandClass = `font-script text-2xl sm:text-3xl md:text-4xl ${
    home ? "text-white" : "text-[#603809]"
  }`
  const desktopLinkClass = `transition-colors ${
    home
      ? "text-white hover:text-[#f9c06a]"
      : "text-[#1e1e1e] hover:text-[#f9c06a]"
  }`
  const activeDesktop = "text-[#f9c06a]"

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 ${
        home
          ? ""
          : "bg-[#fffefc]/95 backdrop-blur border-b border-[#f9c06a]/40 shadow-[0_2px_20px_0px_rgba(96,56,9,0.08)]"
      }`}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between px-5 sm:px-6 md:px-10 py-5 md:py-6">
        <Link to="/" className={brandClass}>
          Bean Scene
        </Link>

        <div className="hidden lg:flex items-center gap-8 xl:gap-10 text-sm font-medium">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === "/"}
              className={({ isActive }) =>
                `${desktopLinkClass} ${isActive ? activeDesktop : ""}`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </div>

        <div className="hidden lg:flex items-center gap-6">
          {user ? (
            <>
              <span
                className={`text-sm font-medium ${
                  home ? "text-white/90" : "text-[#603809]"
                }`}
              >
Hi, {capitalize(firstName(user))}
                  </span>
              <button
                onClick={signOut}
                className={`text-sm font-bold rounded-full px-5 py-2.5 border transition-colors ${
                  home
                    ? "border-white/60 text-white hover:bg-white hover:text-[#603809]"
                    : "border-[#603809]/40 text-[#603809] hover:bg-[#603809] hover:text-white"
                }`}
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link
                to="/signin"
                className={`text-sm font-medium underline underline-offset-4 ${
                  home ? "text-white" : "text-[#603809]"
                }`}
              >
                Sign In
              </Link>
              <Button to="/signup">Sign Up</Button>
            </>
          )}
        </div>

        <button
          className={`lg:hidden flex items-center justify-center w-10 h-10 rounded-full ${
            open ? "bg-[#ffeed8]" : ""
          } ${
            home ? "text-white" : "text-[#603809]"
          } transition-colors`}
          onClick={() => setOpen(!open)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
        >
          {open ? (
            <svg
              className="w-6 h-6"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
            >
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          ) : (
            <svg
              className="w-6 h-6"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
            >
              <path d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          )}
        </button>
      </div>

      {open && (
        <div className="lg:hidden mx-3 mb-3 mt-1 rounded-2xl bg-[#fffefc] border border-[#f9c06a]/40 shadow-[0_16px_40px_0px_rgba(0,0,0,0.15)] overflow-hidden animate-[menuIn_0.2s_ease-out]">
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#f9c06a]/20">
            <span className="font-script text-[#603809] text-2xl">Bean Scene</span>
            <button
              onClick={() => setOpen(false)}
              aria-label="Close menu"
              className="w-9 h-9 rounded-full bg-[#ffeed8] text-[#603809] flex items-center justify-center hover:bg-[#f9c06a] transition-colors"
            >
              <svg
                className="w-5 h-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
              >
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
          <nav className="px-3 py-3 flex flex-col gap-1">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.to === "/"}
                onClick={() => setOpen(false)}
              >
                {({ isActive }) => (
                  <span
                    className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${
                      isActive
                        ? "bg-[#ffeed8] text-[#603809]"
                        : "text-[#1e1e1e] hover:bg-[#fff9f1]"
                    }`}
                  >
                    <span>{l.label}</span>
                    <span
                      className={
                        isActive
                          ? "text-[#f9c06a] text-xs"
                          : "text-[#f9c06a]/40 text-xs"
                      }
                      aria-hidden="true"
                    >
                      →
                    </span>
                  </span>
                )}
              </NavLink>
            ))}
          </nav>
          <div className="border-t border-[#f9c06a]/20 px-3 py-4 flex flex-col gap-3">
{user ? (
                <>
                  <span
                    className="block text-center text-sm font-semibold text-[#603809] truncate max-w-full px-2"
                    title={user.email}
                  >
Hi, {capitalize(firstName(user))}
                  </span>
                  <button
                  onClick={() => {
                    setOpen(false)
                    signOut()
                  }}
                  className="w-full text-center text-sm font-semibold text-[#603809] border border-[#f9c06a]/50 rounded-full py-2.5 hover:bg-[#fff9f1] transition-colors"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/signin"
                  onClick={() => setOpen(false)}
                  className="text-center text-sm font-semibold text-[#603809] border border-[#f9c06a]/50 rounded-full py-2.5 hover:bg-[#fff9f1] transition-colors"
                >
                  Sign In
                </Link>
                <Button to="/signup" onClick={() => setOpen(false)} className="w-full">
                  Sign Up
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}

export default NavBar
