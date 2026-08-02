import { useState } from "react"
import PageHero from "../components/PageHero"
import MenuCard from "../components/MenuCard"
import Button from "../components/Button"
import { categories, menuItems, money } from "../data/menuItems"

function Menu() {
  const [active, setActive] = useState("Hot Coffee")
  const filtered = menuItems.filter((item) => item.category === active)

  return (
    <>
      <PageHero
        title="Our Menu"
        subtitle="Explore all flavours of coffee with us. There is always a new cup worth experiencing."
      />
      <section className="max-w-7xl mx-auto px-6 md:px-10 py-16 md:py-24">
        <div className="flex flex-wrap justify-center gap-4 mb-14">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setActive(c)}
              className={`px-6 py-3 rounded-full font-bold text-sm transition-colors ${
                active === c
                  ? "bg-[#f9c06a] text-[#1e1e1e] shadow-[0px_6px_12px_0px_rgba(249,192,106,0.35)]"
                  : "bg-[#fff9f1] border border-[#f9c06a]/40 text-[#603809] hover:bg-[#ffeed8]"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {filtered.map((item) => (
            <MenuCard key={item.name} {...item} price={money(item.price)} />
          ))}
        </div>
      </section>

      <section className="max-w-2xl mx-auto px-6 md:px-10 pb-16 md:pb-24 text-center">
        <p className="text-[#603809] text-2xl md:text-3xl font-bold mb-4">
          Craving something delicious?
        </p>
        <p className="text-[#707070] text-base md:text-lg mb-8">
          Build your perfect order and we'll brew it fresh just for you.
        </p>
        <Button to="/order">Order Now</Button>
      </section>
    </>
  )
}

export default Menu
