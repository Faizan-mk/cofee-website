import Button from "./Button"

function MenuCard({ name, desc, price, img, badge }) {
  return (
    <div className="relative bg-[#fff9f1] border border-[#f9c06a]/40 rounded-[16px] overflow-hidden flex flex-col">
      <img src={img} alt={name} className="w-full h-[180px] object-cover" />
      {badge && (
        <span className="absolute top-3 left-3 bg-[#f9c06a] text-[#1e1e1e] text-xs font-bold px-3 py-1 rounded-full">
          {badge}
        </span>
      )}
      <div className="p-6 flex flex-col items-center text-center gap-2">
        <h3 className="text-[#603809] text-xl font-bold">{name}</h3>
        <p className="text-[#1e1e1e] text-sm">{desc}</p>
        <p className="text-[#603809] text-lg font-bold mb-2">{price}</p>
        <Button to="/order" navigateState={{ item: name }} className="w-full">
          Order Now
        </Button>
      </div>
    </div>
  )
}

export default MenuCard
