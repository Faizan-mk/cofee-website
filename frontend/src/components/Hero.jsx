import { imgCoffeeImage, imgCoffeeBlast } from "../assets/images"
import Button from "./Button"

function Hero() {
  return (
    <section className="relative min-h-screen flex items-end overflow-hidden">
      <img
        src={imgCoffeeImage}
        alt="Coffee"
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(100deg, rgba(30,30,30,0.95) 10%, rgba(0,0,0,0) 75%)",
        }}
      />
      <img
        src={imgCoffeeBlast}
        alt=""
        className="hidden md:block absolute -left-24 bottom-40 w-[420px] opacity-90 pointer-events-none select-none"
      />
      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-10 pb-20 pt-40 w-full">
        <div className="max-w-xl">
          <p className="text-white text-xl md:text-2xl font-medium mb-2">
            We've got your morning covered with
          </p>
          <h1 className="font-script text-white text-[clamp(72px,18vw,170px)] leading-[0.8] mb-6 whitespace-nowrap">
            Coffee
          </h1>
          <p className="text-white/85 text-base md:text-lg leading-relaxed mb-8 max-w-md">
            It is best to start your day with a cup of coffee. Discover the best
            flavours coffee you will ever have. We provide the best for our
            customers.
          </p>
          <Button to="/order">Order Now</Button>
        </div>
      </div>
    </section>
  )
}

export default Hero
