import { Link } from "react-router-dom"
import { imgCtaBg } from "../assets/images"

function AuthCard({ title, subtitle, children, footerText, footerLink, footerLabel }) {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-24 md:pt-32 pb-16 md:pb-24">
      <img src={imgCtaBg} alt="" className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0 bg-[#603809] opacity-80" />
      <div className="relative z-10 w-full max-w-md mx-6 bg-[#fffefc] rounded-[24px] border border-[#f9c06a]/40 p-8 md:p-10 shadow-[0px_10px_30px_0px_rgba(0,0,0,0.3)]">
        <Link
          to="/"
          className="font-script text-[#603809] text-4xl block text-center mb-6"
        >
          Bean Scene
        </Link>
        <h1 className="text-[#603809] text-2xl md:text-3xl font-bold text-center mb-1">
          {title}
        </h1>
        <p className="text-[#707070] text-sm text-center mb-8">{subtitle}</p>
        {children}
        <p className="text-center text-sm text-[#707070] mt-6">
          {footerText}{" "}
          <Link
            to={footerLink}
            className="text-[#603809] font-bold underline underline-offset-4"
          >
            {footerLabel}
          </Link>
        </p>
      </div>
    </section>
  )
}

export default AuthCard
