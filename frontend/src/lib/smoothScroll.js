import Lenis from "lenis"
import { gsap, ScrollTrigger, reducedMotion } from "./gsap"

let lenis = null
let paused = false

export function startSmoothScroll() {
  if (lenis || reducedMotion()) return () => {}
  lenis = new Lenis({ duration: 1.15, smoothWheel: true })
  if (paused) lenis.stop()
  lenis.on("scroll", ScrollTrigger.update)
  const tick = (time) => lenis?.raf(time * 1000)
  gsap.ticker.add(tick)
  gsap.ticker.lagSmoothing(0)
  return () => {
    gsap.ticker.remove(tick)
    lenis?.destroy()
    lenis = null
  }
}

export function scrollToTop() {
  if (lenis) lenis.scrollTo(0, { immediate: true, force: true })
  else window.scrollTo({ top: 0, left: 0, behavior: "instant" })
}

export function pauseScroll() {
  paused = true
  lenis?.stop()
}

export function resumeScroll() {
  paused = false
  lenis?.start()
}

export function scrollToTopSmooth() {
  if (lenis) lenis.scrollTo(0, { duration: 2.2 })
  else window.scrollTo({ top: 0, behavior: "smooth" })
}
