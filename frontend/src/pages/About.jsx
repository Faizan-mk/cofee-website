import PageHero from "../components/PageHero"
import SectionTitle from "../components/SectionTitle"
import Button from "../components/Button"
import {
  imgDiscover,
  imgCtaBg,
  imgAvatar,
  imgCoffeeBeansIcon,
  imgBadgeIcon,
  imgCoffeeCupIcon,
  imgBestPriceIcon,
} from "../assets/images"

const features = [
  { title: "Supreme Beans", desc: "Beans that provides great taste", icon: imgCoffeeBeansIcon, filled: true },
  { title: "High Quality", desc: "We provide the highest quality", icon: imgBadgeIcon },
  { title: "Extraordinary", desc: "Coffee like you have never tasted", icon: imgCoffeeCupIcon },
  { title: "Affordable Price", desc: "Our Coffee prices are easy to afford", icon: imgBestPriceIcon },
]

const stats = [
  { value: "10+", label: "Years of Experience" },
  { value: "50+", label: "Coffee Varieties" },
  { value: "5K+", label: "Happy Customers" },
  { value: "20+", label: "Awards Won" },
]

function About() {
  return (
    <>
      <PageHero
        title="About Bean Scene"
        subtitle="Great ideas start with great coffee. We're here to help you achieve that — one perfect cup at a time."
      />

      <section className="max-w-7xl mx-auto px-6 md:px-10 py-16 md:py-24 grid md:grid-cols-2 gap-12 items-center">
        <div className="relative order-2 md:order-1">
          <div className="rounded-[24px] overflow-hidden aspect-[500/484]">
            <img
              src={imgDiscover}
              alt="Stylized coffee cup and beans"
              className="w-full h-full object-cover mix-blend-multiply"
            />
          </div>
        </div>
        <div className="order-1 md:order-2">
          <h2 className="text-[#603809] text-3xl md:text-5xl font-bold mb-6 leading-tight">
            Our story
          </h2>
          <p className="text-[#707070] text-base md:text-lg leading-loose mb-6">
            Bean Scene started with a simple belief: everyone deserves a real
            cup of coffee. From sourcing the finest beans to roasting them to
            perfection, we obsess over every step so that every sip feels like
            the best part of your day.
          </p>
          <p className="text-[#707070] text-base md:text-lg leading-loose mb-8">
            Whether you're starting your morning or taking a well-earned break,
            our baristas craft each cup with care and passion. It is best to
            start your day with a cup of coffee — and we're glad you're starting
            it with us.
          </p>
          <Button to="/contact">Visit Us</Button>
        </div>
      </section>

      <section className="relative overflow-hidden py-16 md:py-24">
        <img src={imgCtaBg} alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-[#603809] opacity-80" />
        <div className="relative max-w-7xl mx-auto px-6 md:px-10">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 text-center">
            {stats.map((s) => (
              <div key={s.label}>
                <p className="font-script text-white text-5xl md:text-6xl mb-2">
                  {s.value}
                </p>
                <p className="text-white/85 text-sm md:text-base font-medium">
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 md:px-10 py-16 md:py-24">
        <SectionTitle
          title="Why are we different?"
          subtitle="We don't just make your coffee, we make your day!"
        />
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((f) => (
            <div
              key={f.title}
              className={`rounded-[16px] p-8 text-center ${
                f.filled
                  ? "bg-[#ffeed8]"
                  : "bg-[#fff9f1] border border-[#f9c06a]/40"
              }`}
            >
              <img
                src={f.icon}
                alt=""
                className="w-[72px] h-[72px] object-cover mx-auto mb-6"
              />
              <h3 className="text-[#603809] text-xl font-bold mb-2">
                {f.title}
              </h3>
              <p className="text-[#707070] text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-6 md:px-10 pb-16 md:pb-24">
        <SectionTitle
          title="What our founder says"
          subtitle="Our customers has amazing things to say about us"
        />
        <div className="bg-[#fff9f1] border border-[#f9c06a]/40 rounded-[24px] px-6 sm:px-16 py-14 relative text-center">
          <span className="font-script text-[#603809] text-[90px] leading-[0.5] absolute left-8 top-6 select-none">
            "
          </span>
          <p className="text-[#707070] text-base md:text-lg leading-loose mb-8 relative z-10">
            We didn't set out to open a coffee shop — we set out to build a
            place where every cup feels like a small celebration. That mission
            still drives everything we do today.
          </p>
          <div className="flex items-center justify-center gap-4">
            <img
              src={imgAvatar}
              alt="Jonny Thomas"
              className="w-16 h-16 rounded-2xl object-cover shadow-[0px_6px_12px_0px_rgba(249,192,106,0.3)]"
            />
            <div className="text-left">
              <p className="text-[#603809] font-bold text-lg">Jonny Thomas</p>
              <p className="text-[#707070] text-sm">Founder &amp; CEO</p>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

export default About
