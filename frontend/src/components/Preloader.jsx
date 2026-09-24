import { useRef, useState } from "react"
import { gsap, useGSAP, reducedMotion } from "../lib/gsap"
import { finishIntro } from "../lib/intro"
import { pauseScroll, resumeScroll } from "../lib/smoothScroll"

const SEEN_KEY = "bs-preloader-seen"

const alreadySeen = () => {
  try {
    return sessionStorage.getItem(SEEN_KEY) === "1"
  } catch {
    return false
  }
}

function Preloader() {
  const [done, setDone] = useState(() => alreadySeen() || reducedMotion())
  const root = useRef(null)

  useGSAP(
    () => {
      if (done) {
        finishIntro()
        return
      }
      pauseScroll()
      const counter = { v: 0 }
      const num = root.current.querySelector("[data-count]")
      const tl = gsap.timeline({
        onComplete: () => {
          try {
            sessionStorage.setItem(SEEN_KEY, "1")
          } catch {
            // private mode: the loader just plays again next visit
          }
          resumeScroll()
          setDone(true)
        },
      })
      tl.from("[data-brand] span", {
        yPercent: 120,
        rotateX: -90,
        opacity: 0,
        stagger: 0.05,
        duration: 0.9,
        ease: "expo.out",
      })
        .to("[data-fill]", { attr: { y: 22 }, duration: 1.8, ease: "power2.inOut" }, 0.2)
        .to(
          counter,
          {
            v: 100,
            duration: 1.8,
            ease: "power2.inOut",
            onUpdate: () => (num.textContent = Math.round(counter.v)),
          },
          0.2
        )
        .from("[data-steam] path", { opacity: 0, y: 8, stagger: 0.15, duration: 0.6 }, 1.2)
        .to("[data-inner]", { y: -60, opacity: 0, duration: 0.6, ease: "power3.in" }, "+=0.2")
        .add(finishIntro, "-=0.1")
        .to(root.current, {
          clipPath: "inset(0% 0% 100% 0%)",
          duration: 1,
          ease: "expo.inOut",
        })
    },
    { scope: root }
  )

  if (done) return null

  return (
    <div
      ref={root}
      className="fixed inset-0 z-[200] bg-[#1e140a] flex items-center justify-center"
      style={{ clipPath: "inset(0% 0% 0% 0%)" }}
    >
      <div data-inner className="flex flex-col items-center gap-6" style={{ perspective: 600 }}>
        <svg viewBox="0 0 64 64" className="w-20 h-20" aria-hidden="true">
          <defs>
            <clipPath id="cup-clip">
              <path d="M12 20h34v18a17 17 0 0 1-34 0z" />
            </clipPath>
          </defs>
          <g data-steam stroke="#f9c06a" strokeWidth="2" strokeLinecap="round" fill="none">
            <path d="M22 14c-2-3 2-5 0-8" />
            <path d="M29 14c-2-3 2-5 0-8" />
            <path d="M36 14c-2-3 2-5 0-8" />
          </g>
          <rect data-fill x="10" y="56" width="40" height="40" fill="#b5651d" clipPath="url(#cup-clip)" />
          <path d="M12 20h34v18a17 17 0 0 1-34 0z" fill="none" stroke="#f9c06a" strokeWidth="2.5" />
          <path d="M46 25h4a6 6 0 0 1 0 12h-5" fill="none" stroke="#f9c06a" strokeWidth="2.5" />
        </svg>
        <p data-brand className="font-script text-white text-5xl md:text-6xl flex overflow-hidden">
          {"Bean Scene".split("").map((c, i) => (
            <span key={i} className="inline-block" style={{ whiteSpace: "pre" }}>
              {c}
            </span>
          ))}
        </p>
        <p className="text-[#f9c06a] text-sm tracking-[0.4em] tabular-nums">
          <span data-count>0</span>%
        </p>
      </div>
    </div>
  )
}

export default Preloader
