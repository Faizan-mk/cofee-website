import { useRef } from "react"
import Button from "./Button"
import { useTilt } from "../lib/usePointerFx"

function MenuCard({ name, desc, price, img, badge }) {
  const card = useRef(null)
  useTilt(card)

  // Outer div belongs to the grid's scroll reveal; the inner one owns the hover tilt.
  return (
    <div className="h-full">
      <div
        ref={card}
        className="relative h-full bg-[#fff9f1] border border-[#f9c06a]/40 rounded-[16px] overflow-hidden flex flex-col shadow-[0_10px_30px_rgba(96,56,9,0.08)] hover:shadow-[0_30px_60px_rgba(96,56,9,0.25)] transition-shadow duration-500"
      >
        <div className="overflow-hidden">
          <img
            src={img}
            alt={name}
            className="w-full h-[180px] object-cover scale-110 hover:scale-125 transition-transform duration-[1.2s] ease-[cubic-bezier(0.19,1,0.22,1)]"
          />
        </div>
        {badge && (
          <span className="absolute top-3 left-3 bg-[#f9c06a] text-[#1e1e1e] text-xs font-bold px-3 py-1 rounded-full" style={{ transform: "translateZ(40px)" }}>
            {badge}
          </span>
        )}
        <div className="p-6 flex flex-col items-center text-center gap-2 flex-1" style={{ transform: "translateZ(30px)" }}>
          <h3 className="text-[#603809] text-xl font-bold">{name}</h3>
          <p className="text-[#1e1e1e] text-sm">{desc}</p>
          <p className="text-[#603809] text-lg font-bold mb-2 mt-auto">{price}</p>
          <Button to="/order" navigateState={{ item: name }} className="w-full">
            Order Now
          </Button>
        </div>
        <div data-glare className="absolute inset-0 pointer-events-none opacity-0 mix-blend-overlay" />
      </div>
    </div>
  )
}

export default MenuCard
