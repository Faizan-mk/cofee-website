import { Link } from "react-router-dom"
import { imgFooterTexture } from "../assets/images"

const aboutLinks = [
  { label: "Menu", to: "/menu" },
  { label: "About Us", to: "/about" },
  { label: "Order Now", to: "/order" },
  { label: "Contact Us", to: "/contact" },
]

const companyLinks = [
  { label: "How we work", to: "/about" },
  { label: "Our Menu", to: "/menu" },
  { label: "Pricing", to: "/menu" },
  { label: "Get Started", to: "/signup" },
]

const socials = [
  {
    label: "Instagram",
    href: "https://instagram.com",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
        <rect x="2" y="2" width="20" height="20" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="1.2" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    label: "Facebook",
    href: "https://facebook.com",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M13.5 22v-8h2.7l.4-3.2h-3.1V8.7c0-.9.3-1.6 1.7-1.6h1.5V4.2c-.3 0-1.2-.1-2.3-.1-2.3 0-3.9 1.4-3.9 4v2.7H7.8V14h2.7v8h3z" />
      </svg>
    ),
  },
  {
    label: "X (Twitter)",
    href: "https://x.com",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M17.5 3h3.1l-6.8 7.8L21.8 21h-6.3l-4.9-6.4L5 21H1.9l7.3-8.3L2.2 3h6.4l4.4 5.9L17.5 3zm-1.1 16h1.7L7.6 4.8H5.8L16.4 19z" />
      </svg>
    ),
  },
  {
    label: "YouTube",
    href: "https://youtube.com",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M23 12s0-3.4-.4-5c-.2-1-1-1.8-2-2C18.9 4.6 12 4.6 12 4.6s-6.9 0-8.6.4c-1 .2-1.8 1-2 2C1 8.6 1 12 1 12s0 3.4.4 5c.2 1 1 1.8 2 2 1.7.4 8.6.4 8.6.4s6.9 0 8.6-.4c1-.2 1.8-1 2-2 .4-1.6.4-5 .4-5zM9.8 15.5v-7l6 3.5-6 3.5z" />
      </svg>
    ),
  },
]

function Footer() {
  return (
    <footer className="relative bg-[#442808] overflow-hidden pt-20 pb-10">
      <img
        src={imgFooterTexture}
        alt=""
        className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-80 pointer-events-none"
      />
      <div className="relative max-w-7xl mx-auto px-6 md:px-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-16">
        <div>
          <Link to="/" className="font-script text-white text-4xl block mb-4">
            Bean Scene
          </Link>
          <p className="text-white/70 text-sm leading-relaxed">
            Lorem Ipsum is simply dummy text of the printing and typesetting
            industry. Lorem Ipsum has been the industry's standard dummy text
            ever since the 1500s.
          </p>
          <div className="flex items-center gap-3 mt-6">
            {socials.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.label}
                className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-white/80 hover:bg-[#f9c06a] hover:text-[#1e1e1e] transition-colors"
              >
                {s.icon}
              </a>
            ))}
          </div>
        </div>
        <div>
          <h4 className="text-white text-xl font-bold mb-6">About</h4>
          <ul className="text-white/70 text-sm space-y-3">
            {aboutLinks.map((l) => (
              <li key={l.to}>
                <Link
                  to={l.to}
                  className="hover:text-[#f9c06a] transition-colors"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="text-white text-xl font-bold mb-6">Company</h4>
          <ul className="text-white/70 text-sm space-y-3">
            {companyLinks.map((l) => (
              <li key={l.label}>
                <Link
                  to={l.to}
                  className="hover:text-[#f9c06a] transition-colors"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="text-white text-xl font-bold mb-6">Contact Us</h4>
          <ul className="text-white/70 text-sm space-y-3">
            <li>
              Akshya Nagar 1st Block 1st Cross, Rammurthy nagar,
              Bangalore-560016
            </li>
            <li>+1 202-918-2132</li>
            <li>beanscene@mail.com</li>
            <li>www.beanscene.com</li>
          </ul>
        </div>
      </div>
      <div className="relative max-w-7xl mx-auto px-6 md:px-10 pt-8 border-t border-white/10 text-center text-white/50 text-xs">
        © {new Date().getFullYear()} Bean Scene. All rights reserved.
      </div>
    </footer>
  )
}

export default Footer
