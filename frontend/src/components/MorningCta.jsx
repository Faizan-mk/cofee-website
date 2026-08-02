import { imgCtaBg, imgCoffeeBean, imgCup } from "../assets/images"
import Button from "./Button"

function MorningCta() {
  return (
    <section className="relative overflow-hidden">
      <img src={imgCtaBg} alt="" className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0 bg-[#603809] opacity-80" />
      <div className="relative max-w-7xl mx-auto px-6 md:px-10 py-16 md:py-24 grid md:grid-cols-2 gap-12 items-center">
        <div>
          <h2 className="text-white text-3xl md:text-5xl font-bold mb-6 leading-tight">
            Get a chance to have an Amazing morning
          </h2>
          <p className="text-white/85 text-base md:text-lg leading-loose mb-8">
            We are giving you are one time opportunity to experience a better
            life with coffee.
          </p>
          <Button to="/order">Order Now</Button>
        </div>
        <div className="relative hidden md:flex justify-center items-center">
          <img src={imgCoffeeBean} alt="" className="w-full max-w-md object-cover" />
          <img
            src={imgCup}
            alt="Coffee cup"
            className="absolute w-[45%] object-cover shadow-[0px_10px_20px_0px_rgba(0,0,0,0.4)]"
          />
        </div>
      </div>
    </section>
  )
}

export default MorningCta
