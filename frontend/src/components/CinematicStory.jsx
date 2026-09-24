import { useRef } from "react"
import { imgCoffeeBean, imgExpresso, imgCtaBg, imgCoffeeImage } from "../assets/images"
import { gsap, useGSAP, reducedMotion } from "../lib/gsap"

const scenes = [
  {
    chapter: "Chapter I",
    title: "The Bean",
    line: "Hand-picked at dawn from high-altitude farms, one ripe cherry at a time.",
    img: imgCoffeeBean,
    fit: "object-contain p-[8vh] md:p-[12vh] [mask-image:radial-gradient(ellipse_at_center,black_45%,transparent_72%)]",
  },
  {
    chapter: "Chapter II",
    title: "The Roast",
    line: "Slow-roasted in small batches until the sugars turn to caramel and smoke.",
    img: imgExpresso,
    fit: "object-cover",
  },
  {
    chapter: "Chapter III",
    title: "The Brew",
    line: "Nine bars of pressure. Twenty-five seconds. Not one more.",
    img: imgCtaBg,
    fit: "object-cover",
  },
  {
    chapter: "Chapter IV",
    title: "The Cup",
    line: "And then, the quiet moment that makes the whole morning worth it.",
    img: imgCoffeeImage,
    fit: "object-cover",
  },
]

// A pinned "reel": scrolling plays the film forward, each cut an iris-open into the next scene.
function CinematicStory() {
  const root = useRef(null)

  useGSAP(
    () => {
      if (reducedMotion()) return
      const q = gsap.utils.selector(root)
      const frames = q("[data-scene]")
      const dots = q("[data-dot]")

      gsap.set(frames.slice(1), { clipPath: "circle(0% at 50% 50%)" })
      gsap.set(q("[data-scene-img]"), { scale: 1.25 })

      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: root.current,
          start: "top top",
          end: () => "+=" + window.innerHeight * scenes.length * 1.1,
          pin: true,
          scrub: 1,
          anticipatePin: 1,
          onUpdate: (self) => {
            const i = Math.min(scenes.length - 1, Math.floor(self.progress * scenes.length))
            dots.forEach((d, n) => d.classList.toggle("is-active", n === i))
            q("[data-reel-bar]")[0].style.transform = `scaleY(${self.progress})`
          },
        },
      })

      frames.forEach((frame, i) => {
        const img = frame.querySelector("[data-scene-img]")
        const words = frame.querySelectorAll("[data-word]")
        const line = frame.querySelector("[data-line]")
        const chapter = frame.querySelector("[data-chapter]")
        const at = i * 1.2

        if (i > 0) {
          // The iris opens on the new scene while the old one rushes past the lens.
          tl.to(frame, { clipPath: "circle(75% at 50% 50%)", duration: 0.7, ease: "power2.inOut" }, at - 0.35)
          tl.to(
            frames[i - 1].querySelector("[data-scene-img]"),
            { scale: 1.9, filter: "blur(10px) brightness(0.4)", duration: 0.7, ease: "power2.in" },
            at - 0.35
          )
        }

        // Slow dolly-in for the life of the shot.
        tl.fromTo(img, { scale: 1.25, rotate: i % 2 ? -3 : 3 }, { scale: 1, rotate: 0, duration: i === 0 ? 0.8 : 1 }, Math.max(0, at - 0.2))

        tl.from(chapter, { y: 30, opacity: 0, letterSpacing: "1em", duration: 0.3 }, at)
          .from(words, { yPercent: 120, rotateX: -90, opacity: 0, stagger: 0.06, duration: 0.35, transformOrigin: "50% 100%" }, at + 0.05)
          .from(line, { y: 40, opacity: 0, duration: 0.3 }, at + 0.2)

        if (i < frames.length - 1) {
          // Title card drifts toward the camera and dissolves before the cut.
          tl.to([chapter, ...words, line], { z: 400, opacity: 0, stagger: 0.02, duration: 0.3, ease: "power2.in" }, at + 0.75)
        }
      })
    },
    { scope: root }
  )

  return (
    <section
      ref={root}
      data-cursor-label="Scroll"
      className="relative h-[100svh] bg-black overflow-hidden text-white"
      aria-label="Our story"
    >
      {scenes.map((s, i) => (
        <div
          key={s.title}
          data-scene
          className="absolute inset-0 bg-[#140c05]"
          style={{ zIndex: i + 1 }}
        >
          <img
            data-scene-img
            src={s.img}
            alt=""
            className={`absolute inset-0 w-full h-full ${s.fit} will-change-transform`}
          />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0.1)_0%,rgba(0,0,0,0.75)_75%)]" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
          <div
            className="relative h-full max-w-7xl mx-auto px-6 md:px-10 flex flex-col justify-end pb-[14vh]"
            style={{ perspective: 800 }}
          >
            <p data-chapter className="text-[#f9c06a] text-xs md:text-sm uppercase tracking-[0.5em] mb-4">
              {s.chapter}
            </p>
            <h2
              data-split="none"
              className="font-script text-[clamp(64px,13vw,180px)] leading-[0.9] mb-6 flex flex-wrap gap-x-[0.25em]"
              style={{ transformStyle: "preserve-3d" }}
            >
              {s.title.split(" ").map((w) => (
                <span key={w} className="inline-block overflow-hidden pb-[0.1em]">
                  <span data-word className="inline-block">
                    {w}
                  </span>
                </span>
              ))}
            </h2>
            <p data-line className="max-w-md text-white/80 text-base md:text-xl leading-relaxed">
              {s.line}
            </p>
          </div>
        </div>
      ))}

      {/* Reel indicator */}
      <div className="absolute right-5 md:right-10 top-1/2 -translate-y-1/2 z-20 hidden sm:flex items-stretch gap-4">
        <div className="relative w-px bg-white/20">
          <div data-reel-bar className="absolute inset-0 bg-[#f9c06a] origin-top" style={{ transform: "scaleY(0)" }} />
        </div>
        <ol className="flex flex-col justify-between gap-8 text-xs tracking-[0.3em]">
          {scenes.map((s, i) => (
            <li key={s.title} data-dot className="reel-dot">
              {String(i + 1).padStart(2, "0")}
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

export default CinematicStory
