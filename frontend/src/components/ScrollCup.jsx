import { useRef } from "react"
import { imgCup } from "../assets/images"
import { gsap, ScrollTrigger, useGSAP, reducedMotion } from "../lib/gsap"
import { scrollToTopSmooth } from "../lib/smoothScroll"

// Where the cup sits at each point of the page (at = scroll progress), as fractions of the
// free space on screen (x: 0 = left edge, 1 = right edge; y: 0 = under the nav, 1 = bottom).
// It hugs the right through the hero and the pinned film, whose titles sit bottom-left,
// then weaves across the rest of the page where it slides under the content.
const stops = [
  { at: 0, x: 0.92, y: 0.08, r: -10, s: 1 },
  { at: 0.22, x: 0.74, y: 0.2, r: 8, s: 0.9 },
  { at: 0.46, x: 0.9, y: 0.38, r: -10, s: 0.95 },
  { at: 0.6, x: 0.03, y: 0.55, r: 12, s: 0.85 },
  { at: 0.74, x: 0.94, y: 0.7, r: -8, s: 0.95 },
  { at: 0.87, x: 0.05, y: 0.85, r: 10, s: 0.85 },
  { at: 1, x: 0.5, y: 1, r: 0, s: 1.1 },
]

const trailBeans = [0.25, 0.45, 0.65, 0.85, 1.05]

// A big takeaway cup that travels the whole page from top to bottom as you scroll:
// it weaves side to side, spins in 3D, tips with scroll speed and drags a tail of beans.
function ScrollCup() {
  const root = useRef(null)

  useGSAP(
    () => {
      if (reducedMotion()) return
      const q = gsap.utils.selector(root)
      const rider = q("[data-rider]")[0]
      const cup = q("[data-cupimg]")[0]
      const tilt = q("[data-tilt]")[0]

      const nav = 90
      const freeX = () => window.innerWidth - rider.offsetWidth
      const freeY = () => window.innerHeight - rider.offsetHeight - nav - 16
      const px = (f) => () => f * freeX()
      const py = (f) => () => nav + f * freeY()

      gsap.set(rider, { x: px(stops[0].x)(), y: py(stops[0].y)(), rotation: stops[0].r })

      const tl = gsap.timeline({
        defaults: { ease: "sine.inOut" },
        scrollTrigger: { start: 0, end: "max", scrub: 1.5, invalidateOnRefresh: true },
      })
      stops.slice(1).forEach((s, i) => {
        const p = stops[i]
        tl.fromTo(
          rider,
          { x: px(p.x), y: py(p.y), rotation: p.r, scale: p.s },
          { x: px(s.x), y: py(s.y), rotation: s.r, scale: s.s, duration: s.at - p.at, immediateRender: i === 0 },
          p.at
        )
      })
      // Three full turns in 3D over the page, ending label-forward.
      tl.to(cup, { rotationY: 1080, ease: "none", duration: 1 }, 0)

      // Scroll speed tips and stretches the cup as if it's being carried at a run.
      const tip = gsap.quickTo(tilt, "rotation", { duration: 0.6, ease: "power3" })
      const stretch = gsap.quickTo(tilt, "scaleY", { duration: 0.4, ease: "power3" })
      let settle
      ScrollTrigger.create({
        start: 0,
        end: "max",
        onUpdate: (self) => {
          const v = self.getVelocity()
          tip(gsap.utils.clamp(-25, 25, v / -100))
          stretch(1 + gsap.utils.clamp(0, 0.1, Math.abs(v) / 25000))
          settle?.kill()
          settle = gsap.delayedCall(0.15, () => {
            tip(0)
            stretch(1)
          })
        },
        onLeave: () => gsap.fromTo(tilt, { scaleY: 0.85 }, { scaleY: 1, duration: 1, ease: "elastic.out(1,0.35)" }),
      })

      // Beans trail behind the cup, each one lagging a little more than the last.
      const beans = q("[data-trail-bean]").map((el, i) => ({
        x: gsap.quickTo(el, "x", { duration: trailBeans[i], ease: "power2" }),
        y: gsap.quickTo(el, "y", { duration: trailBeans[i], ease: "power2" }),
      }))
      const follow = () => {
        const cx = gsap.getProperty(rider, "x") + rider.offsetWidth / 2
        const cy = gsap.getProperty(rider, "y") + rider.offsetHeight * 0.55
        beans.forEach((b) => {
          b.x(cx)
          b.y(cy)
        })
      }
      gsap.ticker.add(follow)
      q("[data-trail-bean] svg").forEach((b, i) =>
        gsap.to(b, { rotation: i % 2 ? -360 : 360, duration: 3 + i, repeat: -1, ease: "none" })
      )

      // Idle bob + rising steam.
      gsap.to(q("[data-bob]")[0], { y: -12, duration: 1.8, repeat: -1, yoyo: true, ease: "sine.inOut" })
      gsap.fromTo(
        q("[data-steam] path"),
        { y: 10, opacity: 0 },
        { y: -18, opacity: 0.85, duration: 1.8, stagger: { each: 0.45, repeat: -1, yoyo: true }, ease: "sine.inOut" }
      )

      return () => gsap.ticker.remove(follow)
    },
    { scope: root }
  )

  return (
    <div ref={root} className="fixed inset-0 z-[5] pointer-events-none overflow-hidden" aria-hidden="true">
      {trailBeans.map((_, i) => (
        <div key={i} data-trail-bean className="absolute top-0 left-0" style={{ opacity: 0.85 - i * 0.14 }}>
          <svg
            viewBox="0 0 40 56"
            className="-translate-x-1/2 -translate-y-1/2 drop-shadow-[0_6px_8px_rgba(0,0,0,0.35)]"
            style={{ width: 22 - i * 2.5 }}
          >
            <ellipse cx="20" cy="28" rx="18" ry="26" fill="#6b3d14" />
            <ellipse cx="14" cy="20" rx="6" ry="12" fill="#9a6632" opacity="0.5" />
            <path d="M20 4c-8 10 8 22 0 48" stroke="#2a1606" strokeWidth="3" fill="none" strokeLinecap="round" />
          </svg>
        </div>
      ))}

      <div data-rider className="absolute top-0 left-0 w-[120px] sm:w-[170px] lg:w-[clamp(200px,17vw,280px)]" style={{ perspective: 900 }}>
        <div data-bob>
          <div data-tilt style={{ transformOrigin: "50% 100%" }}>
            <svg data-steam viewBox="0 0 40 24" className="absolute -top-[18%] left-1/2 -translate-x-1/2 w-1/2" aria-hidden="true">
              <g stroke="#f3e2c7" strokeOpacity="0.9" strokeWidth="1.6" strokeLinecap="round" fill="none">
                <path d="M12 22c-4-5 4-8 0-14" />
                <path d="M20 22c-4-5 4-8 0-14" />
                <path d="M28 22c-4-5 4-8 0-14" />
              </g>
            </svg>
            <button
              type="button"
              tabIndex={-1}
              onClick={scrollToTopSmooth}
              data-cursor-label="Top"
              className="pointer-events-auto block w-full"
              title="Back to top"
            >
              <img
                data-cupimg
                src={imgCup}
                alt=""
                className="w-full drop-shadow-[0_30px_30px_rgba(30,15,5,0.5)]"
                style={{ transformStyle: "preserve-3d" }}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ScrollCup
