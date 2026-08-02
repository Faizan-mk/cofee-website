import { imgCtaBg } from "../assets/images"
import Button from "../components/Button"

function NotFound() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <img
        src={imgCtaBg}
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-[#603809] opacity-80" />
      <div className="relative z-10 text-center px-6 py-32">
        <p className="font-script text-[#f9c06a] text-5xl md:text-6xl mb-2">
          Oops!
        </p>
        <h1 className="text-white text-7xl md:text-9xl font-bold mb-4 leading-none">
          404
        </h1>
        <p className="text-white/85 text-lg mb-8 max-w-md mx-auto">
          The page you're looking for has left the building. Grab a coffee and
          head back home instead.
        </p>
        <Button to="/">Back to Home</Button>
      </div>
    </section>
  )
}

export default NotFound
