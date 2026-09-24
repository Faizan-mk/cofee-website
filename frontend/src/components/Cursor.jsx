import { useRef } from "react"
import { gsap, useGSAP, finePointer, reducedMotion } from "../lib/gsap"

const INTERACTIVE = "a, button, select, label, [role='button'], [data-cursor], [data-cursor-label]"
const TEXT_FIELD = "input, textarea, [contenteditable='true']"

// Dot that tracks the pointer almost exactly, plus a ring that trails behind with frame-rate
// independent easing, stretches along the direction of travel, and swells into a gold halo
// (optionally with a label from data-cursor-label) over anything clickable. Mouse users only.
function Cursor() {
  const dotRef = useRef(null)
  const ringRef = useRef(null)

  useGSAP(() => {
    if (!finePointer() || reducedMotion()) return
    const dot = dotRef.current
    const ring = ringRef.current
    const halo = ring.querySelector("[data-halo]")
    const stretcher = ring.querySelector("[data-stretch]")
    const label = ring.querySelector("[data-label]")
    document.documentElement.classList.add("custom-cursor")

    const mouse = { x: innerWidth / 2, y: innerHeight / 2 }
    const d = { ...mouse }
    const r = { ...mouse }
    let visible = false
    let state = ""
    let stretch = 0

    gsap.set([dot, ring], { xPercent: -50, yPercent: -50, x: mouse.x, y: mouse.y, opacity: 0 })

    const setState = (next, text = "") => {
      if (next === state && label.textContent === text) return
      state = next
      label.textContent = text
      const big = next === "hover" || next === "label"
      gsap.to(halo, {
        scale: next === "label" ? 2.6 : big ? 1.8 : next === "text" ? 0 : 1,
        backgroundColor: big ? "rgba(249,192,106,0.22)" : "rgba(249,192,106,0)",
        borderColor: big ? "rgba(249,192,106,0.9)" : "rgba(249,192,106,0.8)",
        duration: 0.45,
        ease: "expo.out",
      })
      gsap.to(label, { opacity: next === "label" ? 1 : 0, scale: next === "label" ? 1 : 0.5, duration: 0.3 })
      gsap.to(dot, { scale: big || next === "text" ? 0 : 1, duration: 0.3, ease: "power3" })
    }

    const move = (e) => {
      mouse.x = e.clientX
      mouse.y = e.clientY
      if (!visible) {
        visible = true
        d.x = r.x = mouse.x
        d.y = r.y = mouse.y
        gsap.to([dot, ring], { opacity: 1, duration: 0.3 })
      }
      const t = e.target
      if (t.closest?.(TEXT_FIELD)) return setState("text")
      const hit = t.closest?.(INTERACTIVE)
      if (hit?.dataset.cursorLabel) return setState("label", hit.dataset.cursorLabel)
      setState(hit ? "hover" : "")
    }
    const down = () => gsap.to(ring, { scale: 0.75, duration: 0.2, ease: "power3" })
    const up = () => gsap.to(ring, { scale: 1, duration: 0.6, ease: "elastic.out(1,0.4)" })
    const leave = () => {
      visible = false
      gsap.to([dot, ring], { opacity: 0, duration: 0.3 })
    }

    const tick = (_time, deltaMs) => {
      // Exponential smoothing tuned per 60fps frame, corrected for the real frame time.
      const f = deltaMs / (1000 / 60)
      const kd = 1 - Math.pow(1 - 0.55, f)
      const kr = 1 - Math.pow(1 - 0.16, f)
      d.x += (mouse.x - d.x) * kd
      d.y += (mouse.y - d.y) * kd
      const vx = mouse.x - r.x
      const vy = mouse.y - r.y
      r.x += vx * kr
      r.y += vy * kr
      const speed = Math.min(Math.hypot(vx, vy), 160)
      const target = state === "" ? speed / 400 : 0
      stretch += (target - stretch) * kr
      gsap.set(dot, { x: d.x, y: d.y })
      gsap.set(ring, { x: r.x, y: r.y })
      gsap.set(stretcher, {
        rotation: speed > 0.5 ? (Math.atan2(vy, vx) * 180) / Math.PI : "+=0",
        scaleX: 1 + stretch,
        scaleY: 1 - stretch * 0.5,
      })
    }

    gsap.ticker.add(tick)
    window.addEventListener("pointermove", move, { passive: true })
    window.addEventListener("pointerdown", down)
    window.addEventListener("pointerup", up)
    document.documentElement.addEventListener("pointerleave", leave)
    return () => {
      gsap.ticker.remove(tick)
      window.removeEventListener("pointermove", move)
      window.removeEventListener("pointerdown", down)
      window.removeEventListener("pointerup", up)
      document.documentElement.removeEventListener("pointerleave", leave)
      document.documentElement.classList.remove("custom-cursor")
    }
  })

  return (
    <div aria-hidden="true">
      <div
        ref={ringRef}
        className="fixed top-0 left-0 z-[100] pointer-events-none will-change-transform opacity-0"
      >
        <div data-stretch>
          <div data-halo className="w-9 h-9 rounded-full border-[1.5px] border-[#f9c06a]" />
        </div>
        <span
          data-label
          className="absolute inset-0 flex items-center justify-center whitespace-nowrap text-[10px] font-bold uppercase tracking-widest text-[#1e1e1e] opacity-0"
        />
      </div>
      <div
        ref={dotRef}
        className="fixed top-0 left-0 z-[101] w-2 h-2 rounded-full bg-[#f9c06a] pointer-events-none will-change-transform opacity-0 shadow-[0_0_10px_rgba(249,192,106,0.8)]"
      />
    </div>
  )
}

export default Cursor
