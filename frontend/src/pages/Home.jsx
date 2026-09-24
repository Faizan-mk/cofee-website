import Hero from "../components/Hero"
import CinematicStory from "../components/CinematicStory"
import Marquee from "../components/Marquee"
import Discover from "../components/Discover"
import MenuSection from "../components/MenuSection"
import WhyDifferent from "../components/WhyDifferent"
import MorningCta from "../components/MorningCta"
import Testimonials from "../components/Testimonials"
import Newsletter from "../components/Newsletter"

function Home() {
  return (
    <>
      <Hero />
      <CinematicStory />
      <Marquee />
      <Discover />
      <MenuSection />
      <WhyDifferent />
      <MorningCta />
      <Testimonials />
      <Newsletter />
    </>
  )
}

export default Home
