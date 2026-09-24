import { gsap, useGSAP, finePointer, reducedMotion } from "./gsap"

// Card leans toward the cursor in 3D, with a glare that follows the light.
export function useTilt(ref, { max = 12, scale = 1.03 } = {}) {
  useGSAP(
    () => {
      const el = ref.current
      if (!el || !finePointer() || reducedMotion()) return
      gsap.set(el, { transformPerspective: 900, transformStyle: "preserve-3d" })
      const glare = el.querySelector("[data-glare]")
      const rx = gsap.quickTo(el, "rotationX", { duration: 0.6, ease: "power3" })
      const ry = gsap.quickTo(el, "rotationY", { duration: 0.6, ease: "power3" })

      const move = (e) => {
        const r = el.getBoundingClientRect()
        const px = (e.clientX - r.left) / r.width
        const py = (e.clientY - r.top) / r.height
        ry((px - 0.5) * max * 2)
        rx(-(py - 0.5) * max * 2)
        if (glare)
          gsap.to(glare, {
            opacity: 1,
            background: `radial-gradient(circle at ${px * 100}% ${py * 100}%, rgba(255,255,255,0.45), transparent 55%)`,
            duration: 0.3,
          })
      }
      const enter = () => gsap.to(el, { scale, duration: 0.5, ease: "power3" })
      const leave = () => {
        rx(0)
        ry(0)
        gsap.to(el, { scale: 1, duration: 0.8, ease: "elastic.out(1,0.5)" })
        if (glare) gsap.to(glare, { opacity: 0, duration: 0.5 })
      }
      el.addEventListener("pointerenter", enter)
      el.addEventListener("pointermove", move)
      el.addEventListener("pointerleave", leave)
      return () => {
        el.removeEventListener("pointerenter", enter)
        el.removeEventListener("pointermove", move)
        el.removeEventListener("pointerleave", leave)
      }
    },
    { scope: ref }
  )
}

// Element is pulled toward the cursor while hovered and springs back on leave.
export function useMagnetic(ref, strength = 0.35) {
  useGSAP(
    () => {
      const el = ref.current
      if (!el || !finePointer() || reducedMotion()) return
      const x = gsap.quickTo(el, "x", { duration: 0.6, ease: "power3" })
      const y = gsap.quickTo(el, "y", { duration: 0.6, ease: "power3" })
      const move = (e) => {
        const r = el.getBoundingClientRect()
        x((e.clientX - (r.left + r.width / 2)) * strength)
        y((e.clientY - (r.top + r.height / 2)) * strength)
      }
      const leave = () => gsap.to(el, { x: 0, y: 0, duration: 1, ease: "elastic.out(1,0.4)", overwrite: true })
      el.addEventListener("pointermove", move)
      el.addEventListener("pointerleave", leave)
      return () => {
        el.removeEventListener("pointermove", move)
        el.removeEventListener("pointerleave", leave)
      }
    },
    { scope: ref }
  )
}
