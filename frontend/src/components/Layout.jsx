import { useEffect, useRef } from "react"
import { Outlet, useLocation } from "react-router-dom"
import NavBar from "./NavBar"
import Footer from "./Footer"
import Preloader from "./Preloader"
import Cursor from "./Cursor"
import ScrollProgress from "./ScrollProgress"
import ScrollCup from "./ScrollCup"
import { gsap, useGSAP, reducedMotion } from "../lib/gsap"
import { useReveal } from "../lib/useReveal"
import { startSmoothScroll } from "../lib/smoothScroll"

function Layout() {
  const { pathname } = useLocation()
  const page = useRef(null)
  const firstRender = useRef(true)

  useEffect(() => startSmoothScroll(), [])

  useReveal(page, [pathname])

  useGSAP(
    () => {
      if (firstRender.current || reducedMotion()) {
        firstRender.current = false
        return
      }
      gsap.fromTo(
        page.current,
        { opacity: 0, y: 40, filter: "blur(8px)" },
        { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.8, ease: "expo.out", clearProps: "all" }
      )
    },
    { dependencies: [pathname] }
  )

  return (
    <div className="overflow-x-hidden">
      <Preloader />
      <Cursor />
      <ScrollProgress />
      <ScrollCup />
      <NavBar />
      <main ref={page}>
        <Outlet />
      </main>
      <Footer />
      <div className="film-vignette" aria-hidden="true" />
      <div className="film-grain" aria-hidden="true" />
    </div>
  )
}

export default Layout
