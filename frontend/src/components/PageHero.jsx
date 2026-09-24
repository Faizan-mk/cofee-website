import { useRef } from "react"
import { imgCoffeeImage } from "../assets/images"
import { gsap, SplitText, useGSAP, reducedMotion } from "../lib/gsap"

function PageHero({ title, subtitle, children }) {
  const root = useRef(null)

  useGSAP(
    () => {
      if (reducedMotion()) return
      const q = gsap.utils.selector(root)
      const tl = gsap.timeline({ defaults: { ease: "expo.out" } })
      tl.fromTo(q("[data-bar]"), { scaleY: 1 }, { scaleY: 0, duration: 1.2, ease: "expo.inOut" })
        .fromTo(
          q("[data-bg]"),
          { scale: 1.4, filter: "blur(12px) brightness(0.3)" },
          { scale: 1.1, filter: "blur(0px) brightness(1)", duration: 2.2, ease: "power2.out" },
          0
        )
        .fromTo(q("[data-rule]"), { scaleX: 0 }, { scaleX: 1, duration: 1.2 }, 0.5)

      SplitText.create(q("[data-title]"), {
        type: "chars",
        mask: "chars",
        autoSplit: true,
        onSplit: (self) =>
          gsap.from(self.chars, {
            yPercent: 120,
            rotateX: -90,
            opacity: 0,
            transformOrigin: "50% 100%",
            stagger: 0.035,
            duration: 1.3,
            ease: "expo.out",
            delay: 0.45,
          }),
      })
      if (q("[data-sub]").length)
        SplitText.create(q("[data-sub]"), {
          type: "lines",
          mask: "lines",
          autoSplit: true,
          onSplit: (self) =>
            gsap.from(self.lines, { yPercent: 110, stagger: 0.08, duration: 1.2, ease: "expo.out", delay: 0.8 }),
        })
      gsap.from(q("[data-extra]"), { y: 30, opacity: 0, duration: 1, delay: 1.1 })

      // Scroll: background drifts slower than the page, title lifts away.
      gsap
        .timeline({ scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: true } })
        .to(q("[data-bg]"), { yPercent: 20, scale: 1.25, ease: "none" }, 0)
        .to(q("[data-inner]"), { yPercent: -30, opacity: 0.2, ease: "none" }, 0)
    },
    { scope: root }
  )

  return (
    <section ref={root} className="relative overflow-hidden pt-28 md:pt-36 pb-16 md:pb-24 bg-black">
      <img
        data-bg
        src={imgCoffeeImage}
        alt=""
        className="absolute inset-0 w-full h-full object-cover will-change-transform"
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(100deg, rgba(30,30,30,0.9) 20%, rgba(0,0,0,0.5) 75%)",
        }}
      />
      <div data-inner className="relative z-10 max-w-7xl mx-auto px-6 md:px-10">
        <h1 data-title className="text-white text-4xl md:text-6xl font-bold leading-tight">
          {title}
        </h1>
        <div data-rule className="h-[2px] w-24 bg-[#f9c06a] mt-5 origin-left" />
        {subtitle && (
          <p data-sub className="text-white/85 text-base md:text-lg leading-loose mt-4 max-w-2xl">
            {subtitle}
          </p>
        )}
        {children && <div data-extra>{children}</div>}
      </div>
      <div data-bar className="absolute top-0 left-0 w-full h-1/2 bg-black z-20 origin-top pointer-events-none scale-y-0" />
      <div data-bar className="absolute bottom-0 left-0 w-full h-1/2 bg-black z-20 origin-bottom pointer-events-none scale-y-0" />
    </section>
  )
}

export default PageHero
