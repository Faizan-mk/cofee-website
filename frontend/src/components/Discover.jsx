import { imgDiscover } from "../assets/images"
import Button from "./Button"

function Discover() {
  return (
    <section className="max-w-7xl mx-auto px-6 md:px-10 py-16 md:py-24 grid md:grid-cols-2 gap-12 items-center">
      <div>
        <h2 className="text-[#603809] text-3xl md:text-5xl font-bold mb-6 leading-tight">
          Discover the best coffee
        </h2>
        <p className="text-[#707070] text-base md:text-lg leading-loose mb-8">
          Bean Scene is a coffee shop that provides you with quality coffee that
          helps boost your productivity and helps build your mood. Having a cup
          of coffee is good, but having a cup of real coffee is greater. There
          is no doubt that you will enjoy this coffee more than others you have
          ever tasted.
        </p>
        <Button to="/about">Learn More</Button>
      </div>
      <div className="relative">
        <div className="rounded-[24px] overflow-hidden aspect-[500/484]">
          <img
            src={imgDiscover}
            alt="Stylized coffee cup and beans"
            className="w-full h-full object-cover mix-blend-multiply"
          />
        </div>
      </div>
    </section>
  )
}

export default Discover
