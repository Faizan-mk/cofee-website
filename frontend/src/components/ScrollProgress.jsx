import { useRef } from "react"
import { gsap, useGSAP } from "../lib/gsap"

function ScrollProgress() {
  const bar = useRef(null)

  useGSAP(() => {
    gsap.to(bar.current, {
      scaleX: 1,
      ease: "none",
      scrollTrigger: { start: 0, end: "max", scrub: 0.3 },
    })
  })

  return (
    <div className="fixed top-0 left-0 w-full h-[3px] z-[60] pointer-events-none">
      <div
        ref={bar}
        className="h-full origin-left scale-x-0 bg-gradient-to-r from-[#603809] via-[#f9c06a] to-[#ffeed8]"
      />
    </div>
  )
}

export default ScrollProgress
