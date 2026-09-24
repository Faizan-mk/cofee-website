import {
  imgCoffeeBeansIcon,
  imgBadgeIcon,
  imgCoffeeCupIcon,
  imgBestPriceIcon,
} from "../assets/images"
import { useRef } from "react"
import Button from "./Button"
import { useTilt } from "../lib/usePointerFx"

const features = [
  { title: "Supreme Beans", desc: "Beans that provides great taste", icon: imgCoffeeBeansIcon, filled: true },
  { title: "High Quality", desc: "We provide the highest quality", icon: imgBadgeIcon },
  { title: "Extraordinary", desc: "Coffee like you have never tasted", icon: imgCoffeeCupIcon },
  { title: "Affordable Price", desc: "Our Coffee prices are easy to afford", icon: imgBestPriceIcon },
]

function FeatureCard({ title, desc, icon, filled }) {
  const card = useRef(null)
  useTilt(card, { max: 16, scale: 1.05 })
  return (
    <div className="h-full">
      <div
        ref={card}
        className={`group relative h-full rounded-[16px] p-8 text-center overflow-hidden ${
          filled ? "bg-[#ffeed8]" : "bg-[#fff9f1] border border-[#f9c06a]/40"
        }`}
      >
        <img
          src={icon}
          alt=""
          className="w-[72px] h-[72px] object-cover mx-auto mb-6 transition-transform duration-700 ease-[cubic-bezier(0.19,1,0.22,1)] group-hover:[transform:translateZ(60px)_rotateY(360deg)]"
        />
        <h3 className="text-[#603809] text-xl font-bold mb-2" style={{ transform: "translateZ(30px)" }}>
          {title}
        </h3>
        <p className="text-[#707070] text-sm leading-relaxed" style={{ transform: "translateZ(20px)" }}>
          {desc}
        </p>
        <div data-glare className="absolute inset-0 pointer-events-none opacity-0 mix-blend-overlay" />
      </div>
    </div>
  )
}

function WhyDifferent() {
  return (
    <section className="max-w-7xl mx-auto px-6 md:px-10 py-16 md:py-24">
      <div className="text-center max-w-2xl mx-auto mb-14">
        <h2 className="text-[#603809] text-3xl md:text-5xl font-bold mb-4">
          Why are we different?
        </h2>
        <p className="text-[#707070] text-base md:text-lg leading-loose">
          We don't just make your coffee, we make your day!
        </p>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-14">
        {features.map((f) => (
          <FeatureCard key={f.title} {...f} />
        ))}
      </div>
      <div className="text-center" data-reveal="up">
        <p className="text-[#707070] text-lg mb-1">
          Great ideas start with great coffee, Lets help you achieve that
        </p>
        <p className="text-[#603809] text-2xl font-bold mb-6">
          Get started today.
        </p>
        <Button to="/signup">Join Us</Button>
      </div>
    </section>
  )
}

export default WhyDifferent
