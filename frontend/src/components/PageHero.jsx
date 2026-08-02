import { imgCoffeeImage } from "../assets/images"

function PageHero({ title, subtitle, children }) {
  return (
    <section className="relative overflow-hidden pt-28 md:pt-36 pb-16 md:pb-24">
      <img
        src={imgCoffeeImage}
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(100deg, rgba(30,30,30,0.9) 20%, rgba(0,0,0,0.5) 75%)",
        }}
      />
      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-10">
        <h1 className="text-white text-4xl md:text-6xl font-bold leading-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="text-white/85 text-base md:text-lg leading-loose mt-4 max-w-2xl">
            {subtitle}
          </p>
        )}
        {children}
      </div>
    </section>
  )
}

export default PageHero
