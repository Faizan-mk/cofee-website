import { gsap, ScrollTrigger, SplitText, useGSAP, reducedMotion } from "./gsap"

// Scroll-driven entrance animations for everything inside `scope`, driven by markup:
//   h2 / [data-split]        words rise out of a 3D fold (opt out with data-split="none")
//   [data-reveal="up|left|right|scale|flip"]
//   [data-stagger] > *       children cascade in with a 3D tilt
//   section > .grid > *      same cascade, so plain grid pages animate without markup
//   [data-parallax="0.2"]    drifts vertically while scrolling (positive = slower than page)
//   [data-clip]              image unmasks from the bottom
const fromVars = {
  up: { y: 80, opacity: 0 },
  left: { x: -120, opacity: 0, rotateY: 25 },
  right: { x: 120, opacity: 0, rotateY: -25 },
  scale: { scale: 0.8, opacity: 0, rotateX: 20 },
  flip: { rotateX: -90, opacity: 0, transformOrigin: "50% 100%" },
}

export function useReveal(scope, deps = []) {
  useGSAP(
    () => {
      if (reducedMotion()) return
      const root = scope.current
      if (!root) return
      const q = gsap.utils.selector(root)

      q("h2:not([data-split='none']), [data-split]:not([data-split='none'])").forEach((el) => {
        SplitText.create(el, {
          type: "words",
          mask: "words",
          autoSplit: true,
          onSplit: (self) =>
            gsap.from(self.words, {
              yPercent: 110,
              rotateX: -80,
              transformOrigin: "50% 100%",
              opacity: 0,
              duration: 1.1,
              stagger: 0.06,
              ease: "expo.out",
              scrollTrigger: { trigger: el, start: "top 85%", once: true },
            }),
        })
      })

      q("[data-reveal]").forEach((el) => {
        gsap.from(el, {
          ...(fromVars[el.dataset.reveal] ?? fromVars.up),
          transformPerspective: 900,
          duration: 1.2,
          ease: "expo.out",
          scrollTrigger: { trigger: el, start: "top 88%", once: true },
        })
      })

      const groups = new Set([...q("[data-stagger]"), ...q("section > .grid")])
      groups.forEach((group) => {
        const items = [...group.children].filter((c) => !c.hasAttribute("data-reveal"))
        if (!items.length) return
        gsap.from(items, {
          y: 90,
          opacity: 0,
          rotateX: -35,
          rotateY: 8,
          transformPerspective: 1000,
          transformOrigin: "50% 0%",
          duration: 1.2,
          stagger: 0.12,
          ease: "expo.out",
          scrollTrigger: { trigger: group, start: "top 85%", once: true },
        })
      })

      q("[data-parallax]").forEach((el) => {
        const speed = parseFloat(el.dataset.parallax) || 0.2
        gsap.fromTo(
          el,
          { yPercent: -speed * 100 },
          {
            yPercent: speed * 100,
            ease: "none",
            scrollTrigger: { trigger: el.parentElement, scrub: true },
          }
        )
      })

      q("[data-clip]").forEach((el) => {
        gsap.fromTo(
          el,
          { clipPath: "inset(100% 0% 0% 0% round 24px)" },
          {
            clipPath: "inset(0% 0% 0% 0% round 24px)",
            duration: 1.6,
            ease: "expo.inOut",
            scrollTrigger: { trigger: el, start: "top 85%", once: true },
          }
        )
      })

      // New page height shifts every trigger outside this page too (e.g. the footer credits).
      ScrollTrigger.refresh()

      // Images finishing late shift layout; re-measure trigger positions once they land.
      const pending = q("img").filter((img) => !img.complete)
      const refresh = gsap.delayedCall(0.15, () => ScrollTrigger.refresh()).pause()
      const onLoad = () => refresh.restart(true)
      pending.forEach((img) => img.addEventListener("load", onLoad, { once: true }))
      return () => pending.forEach((img) => img.removeEventListener("load", onLoad))
    },
    { scope, dependencies: deps, revertOnUpdate: true }
  )
}
