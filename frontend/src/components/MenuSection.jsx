import { imgCoffeeBlast } from "../assets/images"
import { menuItems, money } from "../data/menuItems"
import MenuCard from "./MenuCard"
import { useRef } from "react"
import { gsap, useGSAP, reducedMotion } from "../lib/gsap"

function MenuSection() {
  const featured = menuItems.filter((item) =>
    ["Cappuccino", "Chai Latte", "Macchiato", "Expresso"].includes(item.name)
  )
  const root = useRef(null)

  useGSAP(
    () => {
      if (reducedMotion()) return
      // The coffee splash swirls round as the section scrolls past.
      gsap.fromTo(
        "[data-splash]",
        { rotate: 140, xPercent: 30, scale: 0.8 },
        {
          rotate: 220,
          xPercent: -10,
          scale: 1.15,
          ease: "none",
          scrollTrigger: { trigger: root.current, start: "top bottom", end: "bottom top", scrub: 1 },
        }
      )
    },
    { scope: root }
  )

  return (
    <section ref={root} className="relative max-w-7xl mx-auto px-6 md:px-10 py-16 md:py-24">
      <img
        data-splash
        src={imgCoffeeBlast}
        alt=""
        className="hidden md:block absolute right-0 top-24 w-[420px] rotate-180 opacity-70 pointer-events-none select-none"
      />
      <div className="text-center max-w-2xl mx-auto mb-14 relative z-10">
        <h2 className="text-[#603809] text-3xl md:text-5xl font-bold mb-4">
          Enjoy a new blend of coffee style
        </h2>
        <p className="text-[#707070] text-base md:text-lg leading-loose">
          Explore all flavours of coffee with us. There is always a new cup
          worth experiencing
        </p>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
        {featured.map((item) => (
          <MenuCard
            key={item.name}
            {...item}
            price={money(item.price)}
          />
        ))}
      </div>
    </section>
  )
}

export default MenuSection
