import { useRef } from "react"
import { imgCtaBg, imgCoffeeBean, imgCup } from "../assets/images"
import Button from "./Button"
import { gsap, useGSAP, reducedMotion } from "../lib/gsap"

function MorningCta() {
  const root = useRef(null)

  useGSAP(
    () => {
      if (reducedMotion()) return
      // Scrubbed through the section: beans orbit, the cup swings round in 3D and settles.
      gsap
        .timeline({
          scrollTrigger: { trigger: root.current, start: "top bottom", end: "bottom top", scrub: 1 },
        })
        .fromTo("[data-beans]", { rotate: -40, scale: 0.7 }, { rotate: 40, scale: 1.1, ease: "none" }, 0)
        .fromTo(
          "[data-cup]",
          { rotationY: -70, rotationX: 25, y: 120, z: -200 },
          { rotationY: 20, rotationX: -8, y: -60, z: 80, ease: "none" },
          0
        )
        .fromTo("[data-bg]", { yPercent: -15, scale: 1.2 }, { yPercent: 15, scale: 1.2, ease: "none" }, 0)
      gsap.to("[data-steam] path", {
        y: -18,
        opacity: 0,
        duration: 2.4,
        stagger: { each: 0.5, repeat: -1 },
        ease: "sine.out",
      })
    },
    { scope: root }
  )

  return (
    <section ref={root} className="relative overflow-hidden">
      <img data-bg src={imgCtaBg} alt="" className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0 bg-[#603809] opacity-80" />
      <div className="relative max-w-7xl mx-auto px-6 md:px-10 py-16 md:py-24 grid md:grid-cols-2 gap-12 items-center">
        <div data-reveal="left">
          <h2 className="text-white text-3xl md:text-5xl font-bold mb-6 leading-tight">
            Get a chance to have an Amazing morning
          </h2>
          <p className="text-white/85 text-base md:text-lg leading-loose mb-8">
            We are giving you are one time opportunity to experience a better
            life with coffee.
          </p>
          <Button to="/order">Order Now</Button>
        </div>
        <div
          data-reveal="scale"
          className="relative hidden md:flex justify-center items-center"
          style={{ perspective: 1000 }}
        >
          <img data-beans src={imgCoffeeBean} alt="" className="w-full max-w-md object-cover" />
          <div data-cup className="absolute w-[45%]" style={{ transformStyle: "preserve-3d" }}>
            <svg
              data-steam
              viewBox="0 0 60 40"
              className="absolute -top-16 left-1/2 -translate-x-1/2 w-24"
              aria-hidden="true"
            >
              <g stroke="white" strokeOpacity="0.7" strokeWidth="2.5" strokeLinecap="round" fill="none">
                <path d="M18 38c-5-8 5-12 0-22" />
                <path d="M30 38c-5-8 5-12 0-22" />
                <path d="M42 38c-5-8 5-12 0-22" />
              </g>
            </svg>
            <img
              src={imgCup}
              alt="Coffee cup"
              className="w-full object-cover shadow-[0px_30px_40px_0px_rgba(0,0,0,0.5)]"
            />
          </div>
        </div>
      </div>
    </section>
  )
}

export default MorningCta
