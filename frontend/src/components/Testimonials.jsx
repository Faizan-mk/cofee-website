import { useRef } from "react"
import { imgCtaBg, imgAvatar } from "../assets/images"

const testimonials = [
  {
    quote:
      "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.",
    name: "Jonny Thomas",
    role: "Project Manager",
  },
  {
    quote:
      "The cappuccino here is honestly the best I've ever tasted. The milk is silky, the espresso is bold, and the staff always greet you with a smile. Bean Scene is now part of my daily routine.",
    name: "Sarah Mitchell",
    role: "Product Designer",
  },
  {
    quote:
      "I love how every cup feels freshly made with real care. The iced latte on a warm afternoon is unbeatable. It's my go-to spot to work, catch up with friends, or simply enjoy a quiet moment.",
    name: "David Kim",
    role: "Software Engineer",
  },
  {
    quote:
      "Ordering online was quick and my coffee arrived hot and perfectly made. The delivery was fast and the packaging kept everything fresh. Highly recommended for anyone who wants great coffee at home.",
    name: "Emily Carter",
    role: "Marketing Manager",
  },
  {
    quote:
      "I've been to coffee shops all over the city and nothing matches the warmth and consistency of Bean Scene. Their supreme beans really do make a difference in every single cup.",
    name: "Michael Brown",
    role: "Entrepreneur",
  },
  {
    quote:
      "The best part of my morning commute is stopping at Bean Scene. Friendly baristas, cozy atmosphere, and the macchiato is absolutely perfect every single time.",
    name: "Priya Sharma",
    role: "Architect",
  },
]

function Testimonials() {
  const scrollerRef = useRef(null)

  const scrollByCards = (dir) => {
    const el = scrollerRef.current
    if (!el) return
    const card = el.querySelector("article")
    const amount = (card ? card.offsetWidth + 32 : el.clientWidth * 0.8) * dir
    el.scrollBy({ left: amount, behavior: "smooth" })
  }

  return (
    <section className="relative overflow-hidden">
      <img
        src={imgCtaBg}
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-[#603809] opacity-80" />
      <div className="relative max-w-7xl mx-auto px-6 md:px-10 py-16 md:py-24">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="text-white text-3xl md:text-5xl font-bold mb-4">
            Our coffee perfection feedback
          </h2>
          <p className="text-white/85 text-base md:text-lg">
            Our customers has amazing things to say about us
          </p>
        </div>

        <div className="relative">
          <div
            ref={scrollerRef}
            className="flex gap-8 overflow-x-auto snap-x snap-mandatory pb-4 no-scrollbar"
          >
            {testimonials.map((t) => (
              <article
                key={t.name}
                className="snap-start shrink-0 w-[85%] sm:w-[46%] lg:w-[31.5%] bg-[#fff9f1] border border-[#f9c06a]/40 rounded-[24px] p-8 flex flex-col"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="font-script text-[#603809] text-[56px] leading-[0.5] select-none">
                    "
                  </span>
                  <span className="text-[#f9c06a] text-sm tracking-widest">
                    ★★★★★
                  </span>
                </div>
                <p className="text-[#707070] text-sm md:text-base leading-loose flex-1">
                  {t.quote}
                </p>
                <div className="flex items-center gap-3 mt-6 pt-6 border-t border-[#f9c06a]/40">
                  <img
                    src={imgAvatar}
                    alt={t.name}
                    className="w-12 h-12 rounded-2xl object-cover shadow-[0px_6px_12px_0px_rgba(249,192,106,0.3)]"
                  />
                  <div>
                    <p className="text-[#603809] font-bold">{t.name}</p>
                    <p className="text-[#707070] text-xs">{t.role}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className="flex items-center justify-center gap-6 mt-6">
            <button
              onClick={() => scrollByCards(-1)}
              aria-label="Previous reviews"
              className="w-11 h-11 rounded-full border border-white/40 text-white font-bold hover:bg-[#f9c06a] hover:text-[#1e1e1e] hover:border-[#f9c06a] transition-colors"
            >
              ←
            </button>
            <button
              onClick={() => scrollByCards(1)}
              aria-label="Next reviews"
              className="w-11 h-11 rounded-full border border-white/40 text-white font-bold hover:bg-[#f9c06a] hover:text-[#1e1e1e] hover:border-[#f9c06a] transition-colors"
            >
              →
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Testimonials
