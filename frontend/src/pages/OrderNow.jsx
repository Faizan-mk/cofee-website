import { useState } from "react"
import { Link, useLocation } from "react-router-dom"
import PageHero from "../components/PageHero"
import Button from "../components/Button"
import { menuItems, money } from "../data/menuItems"
import { supabase } from "../lib/supabase"

const FREE_DELIVERY_OVER = 25

function OrderNow() {
  const location = useLocation()
  const [cart, setCart] = useState(() => {
    const item = location.state?.item
    return item ? { [item]: 1 } : {}
  })
  const [payment, setPayment] = useState("cash")
  const [placed, setPlaced] = useState(false)
  const [orderError, setOrderError] = useState("")
  const [busy, setBusy] = useState(false)

  const handlePlaceOrder = async (e) => {
    e.preventDefault()
    if (cartEntries.length === 0) return

    if (!supabase) {
      setPlaced(true)
      return
    }

    const form = new FormData(e.currentTarget)
    const order = {
      customer_name: form.get("name"),
      email: form.get("email"),
      phone: form.get("phone"),
      address: form.get("address"),
      payment_method: payment,
      subtotal,
      tax,
      delivery_fee: delivery,
      total,
    }

    setBusy(true)
    setOrderError("")
    const orderId = crypto.randomUUID()

    const { error: orderErr } = await supabase.from("orders").insert({
      ...order,
      id: orderId,
    })
    if (orderErr) {
      setBusy(false)
      setOrderError(orderErr.message)
      return
    }

    const items = cartEntries.map(([name, q]) => {
      const item = menuItems.find((i) => i.name === name)
      return {
        order_id: orderId,
        item_name: name,
        quantity: q,
        price: item?.price ?? 0,
      }
    })
    const { error: itemsErr } = await supabase.from("order_items").insert(items)
    setBusy(false)
    if (itemsErr) {
      setOrderError(itemsErr.message)
      return
    }
    setPlaced(true)
  }

  const addToCart = (name, qty = 1) => {
    setCart((prev) => ({ ...prev, [name]: (prev[name] || 0) + qty }))
  }

  const setQty = (name, qty) => {
    if (qty <= 0) {
      setCart((prev) => {
        const next = { ...prev }
        delete next[name]
        return next
      })
    } else {
      setCart((prev) => ({ ...prev, [name]: qty }))
    }
  }

  const cartEntries = Object.entries(cart)
  const totalQty = cartEntries.reduce((sum, [, q]) => sum + q, 0)
  const subtotal = cartEntries.reduce((sum, [name, q]) => {
    const item = menuItems.find((i) => i.name === name)
    return sum + (item ? item.price * q : 0)
  }, 0)
  const tax = subtotal * 0.1
  const delivery = subtotal > FREE_DELIVERY_OVER ? 0 : 2.5
  const total = subtotal + tax + delivery

  const inputClass =
    "w-full bg-[#fff9f1] border border-[#f9c06a]/40 rounded-[8px] px-4 py-3 text-[#1e1e1e] placeholder-[#707070] outline-none focus:border-[#f9c06a] transition-colors"

  if (placed) {
    return (
      <>
        <PageHero title="Order Now" subtitle="Place your order and enjoy the best coffee in town." />
        <section className="max-w-2xl mx-auto px-6 md:px-10 py-16 md:py-24 text-center">
          <p className="font-script text-[#603809] text-7xl mb-4">Thank you!</p>
          <p className="text-[#707070] text-lg leading-loose mb-8">
            Your order has been placed successfully. We're already brewing your
            coffee — it will be on its way to you shortly.
          </p>
          <Button to="/menu">Back to Menu</Button>
        </section>
      </>
    )
  }

  return (
    <>
      <PageHero
        title="Order Now"
        subtitle="Pick your favourites, tell us where to deliver, and enjoy the best cup in town."
      />

      <section className="max-w-7xl mx-auto px-6 md:px-10 py-16 md:py-24 grid lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2">
          <h2 className="text-[#603809] text-3xl md:text-4xl font-bold mb-2">
            Choose your items
          </h2>
          <p className="text-[#707070] mb-8">
            {totalQty} item{totalQty === 1 ? "" : "s"} in your order
          </p>
          <div className="grid sm:grid-cols-2 gap-6">
            {menuItems.map((item) => {
              const qty = cart[item.name] || 0
              return (
                <div
                  key={item.name}
                  className="bg-[#fff9f1] border border-[#f9c06a]/40 rounded-[16px] overflow-hidden flex flex-col"
                >
                  <img
                    src={item.img}
                    alt={item.name}
                    className="w-full h-[140px] object-cover"
                  />
                  <div className="p-5 flex flex-col gap-1 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-[#603809] font-bold">{item.name}</h3>
                      <span className="text-[#603809] font-bold">
                        {money(item.price)}
                      </span>
                    </div>
                    <p className="text-[#707070] text-xs mb-3">{item.desc}</p>
                    <div className="mt-auto">
                      {qty > 0 ? (
                        <div className="flex items-center justify-between bg-[#ffeed8] rounded-full px-2 py-1">
                          <button
                            onClick={() => setQty(item.name, qty - 1)}
                            className="w-9 h-9 rounded-full bg-[#f9c06a] text-[#1e1e1e] font-bold hover:scale-105 transition-transform"
                            aria-label={`Remove one ${item.name}`}
                          >
                            −
                          </button>
                          <span className="font-bold text-[#603809]">{qty}</span>
                          <button
                            onClick={() => addToCart(item.name)}
                            className="w-9 h-9 rounded-full bg-[#f9c06a] text-[#1e1e1e] font-bold hover:scale-105 transition-transform"
                            aria-label={`Add one ${item.name}`}
                          >
                            +
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => addToCart(item.name)}
                          className="w-full py-2 rounded-full bg-[#f9c06a] text-[#1e1e1e] font-bold text-sm hover:scale-105 transition-transform"
                        >
                          Add to Order
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <aside className="lg:sticky lg:top-24 self-start">
          <div className="bg-[#fff9f1] border border-[#f9c06a]/40 rounded-[24px] p-6 mb-8">
            <h3 className="text-[#603809] text-xl font-bold mb-4">
              Order Summary
            </h3>
            {cartEntries.length === 0 ? (
              <p className="text-[#707070] text-sm mb-4">
                Your order is empty. Add some delicious coffee!
              </p>
            ) : (
              <ul className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                {cartEntries.map(([name, q]) => {
                  const item = menuItems.find((i) => i.name === name)
                  return (
                    <li
                      key={name}
                      className="flex items-center justify-between gap-2 text-sm"
                    >
                      <span className="text-[#1e1e1e]">
                        {name}{" "}
                        <span className="text-[#707070]">× {q}</span>
                      </span>
                      <span className="text-[#603809] font-bold">
                        {money((item?.price || 0) * q)}
                      </span>
                    </li>
                  )
                })}
              </ul>
            )}
            <div className="border-t border-[#f9c06a]/40 pt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-[#707070]">Subtotal</span>
                <span className="font-bold text-[#1e1e1e]">
                  {money(subtotal)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#707070]">Tax (10%)</span>
                <span className="font-bold text-[#1e1e1e]">{money(tax)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#707070]">Delivery</span>
                <span className="font-bold text-[#1e1e1e]">
                  {delivery === 0 ? "Free" : money(delivery)}
                </span>
              </div>
              <div className="flex justify-between text-lg pt-3 border-t border-[#f9c06a]/40">
                <span className="text-[#603809] font-bold">Total</span>
                <span className="text-[#603809] font-bold">{money(total)}</span>
              </div>
            </div>
            <p className="text-[#707070] text-xs mt-3">
              Free delivery on orders over ${FREE_DELIVERY_OVER}.
            </p>
          </div>

          <div className="bg-[#fff9f1] border border-[#f9c06a]/40 rounded-[24px] p-6">
            <h3 className="text-[#603809] text-xl font-bold mb-4">
              Delivery details
            </h3>
            <form className="flex flex-col gap-4" onSubmit={handlePlaceOrder}>
              <div className="grid sm:grid-cols-2 gap-4">
                <input name="name" required placeholder="Full name" className={inputClass} />
                <input
                  name="email"
                  required
                  type="email"
                  placeholder="Email address"
                  className={inputClass}
                />
              </div>
              <input name="phone" required placeholder="Phone number" className={inputClass} />
              <input
                name="address"
                required
                placeholder="Delivery address"
                className={inputClass}
              />
              <div className="flex flex-wrap gap-4 text-sm text-[#1e1e1e]">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="payment"
                    checked={payment === "cash"}
                    onChange={() => setPayment("cash")}
                    className="accent-[#603809]"
                  />
                  Cash on Delivery
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="payment"
                    checked={payment === "card"}
                    onChange={() => setPayment("card")}
                    className="accent-[#603809]"
                  />
                  Credit / Debit Card
                </label>
              </div>
              {orderError && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-[8px] px-3 py-2">
                  {orderError}
                </p>
              )}
              <Button
                disabled={cartEntries.length === 0 || busy}
                className="w-full"
              >
                {busy ? "Placing order…" : `Place Order · ${money(total)}`}
              </Button>
            </form>
          </div>

          {cartEntries.length === 0 && (
            <p className="text-center text-[#707070] text-sm mt-4">
              Add items to your order to continue.{" "}
              <Link
                to="/menu"
                className="text-[#603809] font-bold underline underline-offset-4"
              >
                Browse the menu
              </Link>
            </p>
          )}
        </aside>
      </section>
    </>
  )
}

export default OrderNow
