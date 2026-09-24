import { useRef } from "react"
import { imgCoffeeImage, imgCoffeeBlast } from "../assets/images"
import Button from "./Button"
import { gsap, SplitText, useGSAP, reducedMotion, finePointer } from "../lib/gsap"
import { introDone } from "../lib/intro"

// Bean silhouettes scattered through 3D depth; z drives size, blur and parallax strength.
const beans = [
  { x: 62, y: 18, z: 0.9, r: 20 },
  { x: 78, y: 32, z: 0.5, r: -35 },
  { x: 88, y: 12, z: 0.3, r: 60 },
  { x: 70, y: 62, z: 0.7, r: -10 },
  { x: 92, y: 58, z: 1, r: 45 },
  { x: 55, y: 80, z: 0.4, r: 80 },
  { x: 83, y: 84, z: 0.6, r: -60 },
  { x: 48, y: 10, z: 0.25, r: 15 },
]

function Bean({ className, style }) {
  return (
    <svg viewBox="0 0 40 56" className={className} style={style} aria-hidden="true">
      <ellipse cx="20" cy="28" rx="18" ry="26" fill="#5a3310" />
      <ellipse cx="14" cy="20" rx="6" ry="12" fill="#8a5a2b" opacity="0.45" />
      <path d="M20 4c-8 10 8 22 0 48" stroke="#2a1606" strokeWidth="3" fill="none" strokeLinecap="round" />
    </svg>
  )
}

function Hero() {
  const root = useRef(null)

  useGSAP(
    () => {
      const q = gsap.utils.selector(root)
      if (reducedMotion()) {
        gsap.set(q("[data-bar]"), { scaleY: 0.18 })
        return
      }

      const title = SplitText.create(q("[data-title]"), { type: "chars" })
      // Line splits re-run when web fonts land or the viewport resizes (autoSplit); each
      // re-split rebuilds its reveal and SplitText carries the progress across.
      const played = new Set()
      const anims = {}
      const lineReveal = (key, extra) => ({
        type: "lines",
        mask: "lines",
        autoSplit: true,
        onSplit: (self) =>
          (anims[key] = gsap.fromTo(
            self.lines,
            { yPercent: 110 },
            { yPercent: 0, duration: 1.2, ease: "expo.out", paused: !played.has(key), ...extra }
          )),
      })
      SplitText.create(q("[data-lead]"), lineReveal("lead"))
      SplitText.create(q("[data-copy]"), lineReveal("copy", { stagger: 0.08 }))
      const playLines = (key) => () => {
        played.add(key)
        anims[key]?.play()
      }

      // Everything waits in its "before the take" state until the preloader lifts.
      // Perspective lives on the stage itself so the section stays out of stacking contexts
      // and its text can sit above the travelling cup.
      gsap.set(q("[data-stage]"), { transformPerspective: 1200 })
      gsap.set(q("[data-bg]"), { scale: 1.45, filter: "blur(14px) brightness(0.25)" })
      gsap.set(q("[data-bar]"), { scaleY: 1 })
      gsap.set(title.chars, { yPercent: 120, rotateY: -90, rotateX: 40, opacity: 0, transformOrigin: "50% 50% -40px" })
      gsap.set(q("[data-cta], [data-scroll-cue]"), { autoAlpha: 0, y: 30 })
      gsap.set(q("[data-bean]"), { autoAlpha: 0, z: -600 })
      gsap.set(q("[data-blast]"), { autoAlpha: 0, xPercent: -40, rotate: -25 })

      const tl = gsap.timeline({ paused: true, defaults: { ease: "expo.out" } })
      tl.to(q("[data-bar]"), { scaleY: 0.18, duration: 1.8, ease: "expo.inOut" })
        .to(q("[data-bg]"), { scale: 1.08, filter: "blur(0px) brightness(1)", duration: 3, ease: "power2.out" }, 0.1)
        .call(playLines("lead"), null, 0.9)
        .to(title.chars, { yPercent: 0, rotateY: 0, rotateX: 0, opacity: 1, duration: 1.6, stagger: 0.08 }, 1)
        .call(playLines("copy"), null, 1.5)
        .to(q("[data-cta]"), { autoAlpha: 1, y: 0, duration: 1 }, 1.8)
        .to(q("[data-blast]"), { autoAlpha: 0.9, xPercent: 0, rotate: 0, duration: 2 }, 1.2)
        .to(q("[data-bean]"), { autoAlpha: 1, z: 0, duration: 2.2, stagger: 0.08, ease: "power4.out" }, 1.1)
        .to(q("[data-scroll-cue]"), { autoAlpha: 1, y: 0, duration: 1 }, 2.4)

      let cancelled = false
      introDone.then(() => !cancelled && tl.play())

      // Idle life: beans bob and spin at their own pace, slow push-in on the plate.
      q("[data-bean]").forEach((b, i) => {
        gsap.to(b, {
          y: "+=" + gsap.utils.random(-30, 30),
          rotation: "+=" + gsap.utils.random(-40, 40),
          duration: gsap.utils.random(3, 6),
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
          delay: i * 0.2,
        })
      })

      // Scroll = the camera pulls back and the scene fades to black.
      gsap
        .timeline({
          scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: true },
        })
        .to(q("[data-bg]"), { scale: 1.35, yPercent: 12, ease: "none" }, 0)
        .to(q("[data-content]"), { yPercent: -35, rotateX: 18, transformPerspective: 1200, opacity: 0, ease: "none" }, 0)
        .to(q("[data-depth]"), { yPercent: -60, z: 300, ease: "none" }, 0)
        .to(q("[data-bar]"), { scaleY: 0.5, ease: "none" }, 0)
        .to(q("[data-fade]"), { opacity: 1, ease: "none" }, 0.3)

      // Mouse = handheld camera: the whole set tilts in 3D, near beans move more than far ones.
      let onMove
      if (finePointer()) {
        const rotY = gsap.quickTo(q("[data-stage]"), "rotationY", { duration: 1.2, ease: "power3" })
        const rotX = gsap.quickTo(q("[data-stage]"), "rotationX", { duration: 1.2, ease: "power3" })
        const depth = q("[data-bean], [data-blast]").map((el) => ({
          x: gsap.quickTo(el, "x", { duration: 1.4, ease: "power3" }),
          y: gsap.quickTo(el, "yPercent", { duration: 1.4, ease: "power3" }),
          z: parseFloat(el.dataset.z || 0.5),
        }))
        onMove = (e) => {
          const nx = e.clientX / window.innerWidth - 0.5
          const ny = e.clientY / window.innerHeight - 0.5
          rotY(nx * 4)
          rotX(-ny * 3)
          depth.forEach((d) => {
            d.x(nx * -120 * d.z)
            d.y(ny * -40 * d.z)
          })
        }
        window.addEventListener("pointermove", onMove)
      }

      return () => {
        cancelled = true
        if (onMove) window.removeEventListener("pointermove", onMove)
      }
    },
    { scope: root }
  )

  return (
    <section
      ref={root}
      className="relative h-[100svh] min-h-[640px] flex items-end overflow-hidden bg-black"
    >
      <div data-stage className="absolute inset-0" style={{ transformStyle: "preserve-3d" }}>
        <img
          data-bg
          src={imgCoffeeImage}
          alt="Steaming cup of coffee on a wooden table"
          className="absolute inset-0 w-full h-full object-cover will-change-transform"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(100deg, rgba(20,12,5,0.95) 8%, rgba(20,12,5,0.55) 45%, rgba(0,0,0,0) 75%)",
          }}
        />
        <div data-depth className="absolute inset-0 hidden md:block" style={{ transformStyle: "preserve-3d" }}>
          {beans.map((b, i) => (
            <div
              key={i}
              data-bean
              data-z={b.z}
              className="absolute"
              style={{ left: `${b.x}%`, top: `${b.y}%` }}
            >
              <Bean
                className="drop-shadow-[0_20px_25px_rgba(0,0,0,0.5)]"
                style={{
                  width: 18 + b.z * 46,
                  transform: `rotate(${b.r}deg)`,
                  filter: `blur(${(1 - b.z) * 3}px)`,
                  opacity: 0.55 + b.z * 0.45,
                }}
              />
            </div>
          ))}
          <img
            data-blast
            data-z="0.8"
            src={imgCoffeeBlast}
            alt=""
            className="absolute -left-24 bottom-40 w-[420px] pointer-events-none select-none"
          />
        </div>
      </div>


      <div
        data-content
        className="relative z-10 max-w-7xl mx-auto px-6 md:px-10 pb-[22vh] md:pb-[24vh] w-full"
        style={{ transformOrigin: "50% 100%" }}
      >
        <div className="max-w-xl">
          <p data-lead className="text-white text-xl md:text-2xl font-medium mb-2">
            We've got your morning covered with
          </p>
          <h1
            data-title
            className="font-script text-white text-[clamp(72px,18vw,170px)] leading-[0.9] mb-6 whitespace-nowrap"
            style={{ perspective: 800 }}
          >
            Coffee
          </h1>
          <p data-copy className="text-white/85 text-base md:text-lg leading-relaxed mb-8 max-w-md">
            It is best to start your day with a cup of coffee. Discover the best
            flavours coffee you will ever have. We provide the best for our
            customers.
          </p>
          <div data-cta>
            <Button to="/order">Order Now</Button>
          </div>
        </div>
      </div>

      <div
        data-scroll-cue
        className="absolute bottom-[12vh] right-6 md:right-10 z-20 flex items-center gap-3 text-white/70 text-[10px] tracking-[0.4em] uppercase"
      >
        Scroll
        <span className="relative block w-12 h-px bg-white/30 overflow-hidden">
          <span className="absolute inset-0 bg-[#f9c06a] animate-[scrollCue_1.8s_ease-in-out_infinite]" />
        </span>
      </div>

      {/* Anamorphic letterbox */}
      <div data-bar className="absolute top-0 left-0 w-full h-1/2 bg-black z-30 origin-top pointer-events-none" />
      <div data-bar className="absolute bottom-0 left-0 w-full h-1/2 bg-black z-30 origin-bottom pointer-events-none" />
      <div data-fade className="absolute inset-0 bg-black opacity-0 z-20 pointer-events-none" />
    </section>
  )
}

export default Hero
