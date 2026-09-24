import { useEffect, useRef, useState } from "react"
import { NavLink, Link, useLocation } from "react-router-dom"
import Button from "./Button"
import { useAuth } from "../context/auth"
import { gsap, ScrollTrigger, useGSAP, reducedMotion } from "../lib/gsap"
import { introDone } from "../lib/intro"
import { pauseScroll, resumeScroll } from "../lib/smoothScroll"

// Label rolls up and a fresh copy rolls in from below on hover.
function RollLabel({ children }) {
  return (
    <span className="relative inline-flex flex-col h-[1.25em] overflow-hidden leading-[1.25em]">
      <span className="transition-transform duration-500 ease-[cubic-bezier(0.19,1,0.22,1)] group-hover:-translate-y-full">
        {children}
      </span>
      <span
        aria-hidden="true"
        className="absolute top-full left-0 transition-transform duration-500 ease-[cubic-bezier(0.19,1,0.22,1)] group-hover:-translate-y-full"
      >
        {children}
      </span>
    </span>
  )
}

function SteamingCup({ className }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden="true">
      <g data-logo-steam stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" fill="none" opacity="0.8">
        <path d="M14 11c-2-3 2-4 0-7" />
        <path d="M20 11c-2-3 2-4 0-7" />
        <path d="M26 11c-2-3 2-4 0-7" />
      </g>
      <path d="M8 15h24v8a12 12 0 0 1-24 0z" fill="#f9c06a" />
      <path d="M32 18h2.5a4 4 0 0 1 0 8H31" fill="none" stroke="#f9c06a" strokeWidth="2.4" />
      <path d="M6 36h28" stroke="#f9c06a" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  )
}

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

const brand = "Bean Scene"

function NavBar() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [hovered, setHovered] = useState(null)
  const { pathname } = useLocation()
  const { user, signOut } = useAuth()
  const home = pathname === "/"
  const light = home || scrolled || open
  const nav = useRef(null)
  const linkRow = useRef(null)
  const blob = useRef(null)
  const overlay = useRef(null)
  const menuTl = useRef(null)
  const openRef = useRef(open)
  useEffect(() => {
    openRef.current = open
  }, [open])

  const activeIndex = links.findIndex((l) => (l.to === "/" ? pathname === "/" : pathname.startsWith(l.to)))

  // Intro, hide-on-scroll, logo life.
  useGSAP(
    () => {
      if (reducedMotion()) return
      const items = gsap.utils.toArray("[data-nav-item]", nav.current)
      const letters = gsap.utils.toArray("[data-logo-letter]", nav.current)
      gsap.set(items, { y: -40, opacity: 0 })
      gsap.set(letters, { yPercent: 100, rotateX: -90, opacity: 0, transformPerspective: 400 })
      let cancelled = false
      introDone.then(() => {
        if (cancelled) return
        gsap.to(items, { y: 0, opacity: 1, duration: 1.2, stagger: 0.08, ease: "expo.out", delay: 0.3 })
        gsap.to(letters, { yPercent: 0, rotateX: 0, opacity: 1, duration: 1, stagger: 0.04, ease: "back.out(2)", delay: 0.5 })
      })

      gsap.fromTo(
        "[data-logo-steam] path",
        { y: 3, opacity: 0 },
        { y: -3, opacity: 0.9, duration: 1.4, stagger: { each: 0.35, repeat: -1, yoyo: true }, ease: "sine.inOut" }
      )

      // Slide away while reading down, return the moment the visitor scrolls up.
      const shown = gsap.quickTo(nav.current, "yPercent", { duration: 0.5, ease: "power3" })
      ScrollTrigger.create({
        start: 0,
        end: "max",
        onUpdate: (self) => {
          const y = self.scroll()
          setScrolled(y > 60)
          shown(self.direction === 1 && y > 240 && !openRef.current ? -130 : 0)
        },
      })
      return () => {
        cancelled = true
      }
    },
    { scope: nav }
  )

  const waveLogo = () => {
    if (reducedMotion()) return
    gsap.to(nav.current.querySelectorAll("[data-logo-letter]"), {
      keyframes: { y: [0, -9, 0], rotation: [0, -8, 0] },
      duration: 0.6,
      stagger: 0.04,
      ease: "sine.inOut",
      overwrite: "auto",
    })
    gsap.fromTo(
      nav.current.querySelector("[data-logo-cup]"),
      { rotation: 0 },
      { keyframes: { rotation: [0, -18, 12, -6, 0] }, duration: 0.9, ease: "power2.out", transformOrigin: "50% 90%" }
    )
  }

  // Gold pill that glides between desktop links, squashing as it travels.
  const moveBlob = (index, instant = false) => {
    const row = linkRow.current
    const pill = blob.current
    if (!row || !pill) return
    const target = row.querySelectorAll("[data-link]")[index]
    if (!target) {
      gsap.to(pill, { opacity: 0, scale: 0.6, duration: 0.3 })
      return
    }
    const vars = { x: target.offsetLeft, width: target.offsetWidth, opacity: 1, scale: 1 }
    if (instant || reducedMotion()) {
      gsap.set(pill, vars)
      return
    }
    gsap.to(pill, { ...vars, duration: 0.7, ease: "elastic.out(1,0.8)", overwrite: "auto" })
    gsap.fromTo(pill, { scaleY: 0.7 }, { scaleY: 1, duration: 0.6, ease: "elastic.out(1,0.5)" })
  }

  useEffect(() => {
    moveBlob(activeIndex, true)
    const reset = () => moveBlob(activeIndex, true)
    window.addEventListener("resize", reset)
    document.fonts?.ready.then(reset)
    return () => window.removeEventListener("resize", reset)
  }, [activeIndex])

  // Full-screen mobile menu: an iris opens from the burger, then the links rise into place.
  useGSAP(() => {
    const el = overlay.current
    const tl = gsap.timeline({ paused: true, defaults: { ease: "expo.out" } })
    tl.set(el, { visibility: "visible" })
      .fromTo(
        el,
        { clipPath: "circle(0% at calc(100% - 44px) 44px)" },
        { clipPath: "circle(150% at calc(100% - 44px) 44px)", duration: 0.9, ease: "expo.inOut" }
      )
      .from("[data-mlink]", { yPercent: 120, rotate: 6, duration: 0.9, stagger: 0.07 }, 0.35)
      .from("[data-mnum]", { opacity: 0, x: -20, duration: 0.6, stagger: 0.07 }, 0.45)
      .from("[data-mfoot]", { y: 30, opacity: 0, duration: 0.7, stagger: 0.08 }, 0.6)
      .from("[data-mwatermark]", { xPercent: 20, opacity: 0, duration: 1.4 }, 0.3)
    menuTl.current = tl
  }, { scope: overlay })

  const wasOpen = useRef(false)
  useEffect(() => {
    const tl = menuTl.current
    if (!tl) return
    if (open) {
      wasOpen.current = true
      pauseScroll()
      document.body.style.overflow = "hidden"
      if (reducedMotion()) tl.progress(1)
      else tl.timeScale(1).play()
    } else {
      // Only undo our own lock; on first mount the preloader may be holding scroll.
      if (!wasOpen.current) return
      wasOpen.current = false
      resumeScroll()
      document.body.style.overflow = ""
      if (reducedMotion() || tl.progress() === 0) tl.progress(0).pause()
      else tl.timeScale(1.8).reverse()
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === "Escape" && setOpen(false)
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open])

  const close = () => setOpen(false)
  const textTone = light ? "text-white" : "text-[#1e1e1e]"

  return (
    <>
      <nav
        ref={nav}
        className={`fixed top-0 left-0 w-full z-50 transition-[background-color,box-shadow,border-color] duration-500 border-b ${
          !home && !scrolled && !open
            ? "bg-[#fffefc]/95 backdrop-blur border-[#f9c06a]/40 shadow-[0_2px_20px_0px_rgba(96,56,9,0.08)]"
            : "border-transparent"
        }`}
      >
        {/* Full-width bar at the top of the page; morphs into a floating capsule once scrolled. */}
        <div
          className={`mx-auto flex items-center justify-between border transition-all duration-700 ease-[cubic-bezier(0.19,1,0.22,1)] ${
            scrolled && !open
              ? "w-[calc(100%-1.5rem)] max-w-5xl mt-3 px-4 sm:px-6 py-2.5 rounded-[40px] bg-[#1e140a]/80 backdrop-blur-xl border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.35)]"
              : "w-full max-w-7xl mt-0 px-5 sm:px-6 md:px-10 py-5 md:py-6 rounded-none bg-transparent border-transparent"
          }`}
        >
          <Link
            to="/"
            data-nav-item
            onClick={close}
            onMouseEnter={waveLogo}
            aria-label={brand}
            className={`flex items-center gap-2 ${light ? "text-white" : "text-[#603809]"}`}
          >
            <span data-logo-cup className="inline-block">
              <SteamingCup className="w-7 h-7 sm:w-8 sm:h-8" />
            </span>
            <span aria-hidden="true" className="font-script text-2xl sm:text-3xl md:text-4xl flex">
              {brand.split("").map((c, i) => (
                <span key={i} data-logo-letter className="inline-block" style={{ whiteSpace: "pre" }}>
                  {c}
                </span>
              ))}
            </span>
          </Link>

          <div
            ref={linkRow}
            onMouseLeave={() => {
              setHovered(null)
              moveBlob(activeIndex)
            }}
            className="relative hidden lg:flex items-center gap-1 text-sm font-medium"
          >
            <span
              ref={blob}
              aria-hidden="true"
              className="absolute top-0 left-0 h-full rounded-full bg-[#f9c06a] shadow-[0_6px_18px_rgba(249,192,106,0.45)] opacity-0"
            />
            {links.map((l, i) => {
              const lit = hovered === null ? i === activeIndex : i === hovered
              return (
                <NavLink
                  key={l.to}
                  to={l.to}
                  end={l.to === "/"}
                  data-nav-item
                  data-link
                  onMouseEnter={() => {
                    setHovered(i)
                    moveBlob(i)
                  }}
                  className={`group relative z-10 px-4 py-2 rounded-full transition-colors duration-300 ${
                    lit ? "text-[#1e1e1e]" : textTone
                  }`}
                >
                  <RollLabel>{l.label}</RollLabel>
                </NavLink>
              )
            })}
          </div>

          <div data-nav-item className="hidden lg:flex items-center gap-6">
            {user ? (
              <>
                <span className={`text-sm font-medium ${light ? "text-white/90" : "text-[#603809]"}`}>
                  Hi, {capitalize(firstName(user))}
                </span>
                <button
                  onClick={signOut}
                  className={`text-sm font-bold rounded-full px-5 py-2.5 border transition-colors ${
                    light
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
                  className={`group text-sm font-medium ${light ? "text-white" : "text-[#603809]"}`}
                >
                  <RollLabel>Sign In</RollLabel>
                </Link>
                <Button to="/signup" className="btn-shine">
                  Sign Up
                </Button>
              </>
            )}
          </div>

          <button
            data-nav-item
            className={`lg:hidden relative w-11 h-11 rounded-full transition-colors duration-300 ${
              open ? "bg-[#f9c06a] text-[#1e1e1e]" : light ? "text-white" : "text-[#603809]"
            }`}
            onClick={() => setOpen(!open)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
          >
            {[
              open ? "top-1/2 -translate-y-1/2 rotate-45" : "top-[14px]",
              open ? "top-1/2 -translate-y-1/2 scale-x-0 opacity-0" : "top-1/2 -translate-y-1/2",
              open ? "top-1/2 -translate-y-1/2 -rotate-45" : "bottom-[14px] w-3.5",
            ].map((pos, i) => (
              <span
                key={i}
                className={`absolute left-1/2 -ml-2.5 h-[2px] rounded-full bg-current transition-all duration-500 ease-[cubic-bezier(0.19,1,0.22,1)] ${
                  i === 2 && !open ? "" : "w-5"
                } ${pos}`}
              />
            ))}
          </button>
        </div>
      </nav>

      {/* Lives outside <nav>: the nav's hide-on-scroll transform would otherwise trap this fixed layer. */}
      <div
        ref={overlay}
        className="lg:hidden fixed inset-0 z-[45] bg-[#140c05] text-white overflow-hidden"
        style={{ visibility: "hidden", clipPath: "circle(0% at calc(100% - 44px) 44px)" }}
        aria-hidden={!open}
      >
        <p
          data-mwatermark
          aria-hidden="true"
          className="absolute -right-10 bottom-24 font-script text-[38vw] leading-none text-white/[0.04] whitespace-nowrap pointer-events-none select-none"
        >
          Coffee
        </p>
        <div className="relative h-full flex flex-col justify-between px-6 sm:px-10 pt-28 pb-10">
          <ul className="flex flex-col gap-2">
            {links.map((l, i) => (
              <li key={l.to} className="overflow-hidden">
                <NavLink
                  to={l.to}
                  end={l.to === "/"}
                  onClick={close}
                  tabIndex={open ? 0 : -1}
                  className="group flex items-baseline gap-4 py-1"
                >
                  {({ isActive }) => (
                    <>
                      <span data-mnum className="text-xs tracking-[0.3em] text-[#f9c06a]">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span
                        data-mlink
                        className={`inline-block text-5xl sm:text-6xl font-bold transition-[color,translate] duration-500 group-hover:translate-x-3 ${
                          isActive ? "text-[#f9c06a]" : "text-white group-hover:text-[#f9c06a]"
                        }`}
                      >
                        {l.label}
                      </span>
                    </>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>

          <div className="flex flex-col gap-6">
            <div data-mfoot className="flex flex-col sm:flex-row gap-3">
              {user ? (
                <>
                  <span className="text-center sm:text-left self-center text-sm text-white/80 truncate" title={user.email}>
                    Hi, {capitalize(firstName(user))}
                  </span>
                  <button
                    tabIndex={open ? 0 : -1}
                    onClick={() => {
                      close()
                      signOut()
                    }}
                    className="rounded-full border border-white/30 py-3 px-6 text-sm font-semibold hover:bg-white hover:text-[#603809] transition-colors"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/signin"
                    onClick={close}
                    tabIndex={open ? 0 : -1}
                    className="text-center rounded-full border border-white/30 py-3 px-6 text-sm font-semibold hover:bg-white hover:text-[#603809] transition-colors"
                  >
                    Sign In
                  </Link>
                  <Button to="/signup" onClick={close} className="btn-shine sm:px-10">
                    Sign Up
                  </Button>
                </>
              )}
            </div>
            <p data-mfoot className="flex flex-wrap gap-x-4 gap-y-1 text-xs tracking-[0.2em] text-white/40">
              <span>beanscene@mail.com</span>
              <span>+1 202-918-2132</span>
            </p>
          </div>
        </div>
      </div>
    </>
  )
}

export default NavBar
