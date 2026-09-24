import { useRef } from "react"
import { gsap, ScrollTrigger, useGSAP, reducedMotion } from "../lib/gsap"

const words = ["Cappuccino", "Espresso", "Macchiato", "Chai Latte", "Cold Brew", "Mocha", "Flat White"]

// Endless ticker whose direction follows the scroll and whose speed spikes with scroll velocity.
function Marquee() {
  const root = useRef(null)

  useGSAP(
    () => {
      if (reducedMotion()) return
      const loop = gsap.to("[data-track]", { xPercent: -50, duration: 28, ease: "none", repeat: -1 })
      const skew = gsap.quickTo("[data-track]", "skewX", { duration: 0.4, ease: "power3" })
      let direction = 1
      ScrollTrigger.create({
        trigger: root.current,
        start: "top bottom",
        end: "bottom top",
        onUpdate: (self) => {
          if (self.direction !== direction) direction = self.direction
          const v = self.getVelocity()
          gsap.to(loop, { timeScale: direction * (1 + Math.min(Math.abs(v) / 300, 5)), duration: 0.2, overwrite: true })
          gsap.to(loop, { timeScale: direction, duration: 1.2, delay: 0.2 })
          skew(gsap.utils.clamp(-12, 12, v / -150))
        },
      })
    },
    { scope: root }
  )

  const row = (
    <div className="flex shrink-0 items-center">
      {words.map((w) => (
        <span key={w} className="flex items-center">
          <span className="font-script text-5xl md:text-7xl px-8 whitespace-nowrap">{w}</span>
          <span className="text-[#f9c06a] text-3xl" aria-hidden="true">✦</span>
        </span>
      ))}
    </div>
  )

  return (
    <section
      ref={root}
      aria-label="Our coffees"
      className="relative bg-[#1e140a] text-[#fff9f1] py-8 md:py-10 overflow-hidden -rotate-2 scale-[1.04] my-10 shadow-[0_20px_60px_rgba(30,20,10,0.35)]"
    >
      <div data-track className="flex w-max will-change-transform">
        {row}
        {row}
      </div>
    </section>
  )
}

export default Marquee
