import { useState } from "react"
import { imgCtaBg, imgLeaf } from "../assets/images"
import { supabase } from "../lib/supabase"

function Newsletter() {
  const [subscribed, setSubscribed] = useState(false)
  const [error, setError] = useState("")
  const [busy, setBusy] = useState(false)

  const handleSubscribe = async (e) => {
    e.preventDefault()
    const email = e.currentTarget.email.value.trim()
    if (!email) return

    if (!supabase) {
      setSubscribed(true)
      return
    }

    setBusy(true)
    setError("")
    const { error: insertError } = await supabase
      .from("newsletter_subscribers")
      .insert({ email })
    setBusy(false)
    if (insertError) {
      setError(
        insertError.message.includes("duplicate")
          ? "This email is already subscribed."
          : insertError.message
      )
    } else {
      setSubscribed(true)
    }
  }

  return (
    <section className="relative overflow-hidden">
      <img
        src={imgCtaBg}
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-[#603809] opacity-80" />
      <img
        src={imgLeaf}
        alt=""
        className="hidden lg:block absolute -left-16 bottom-0 w-[340px] opacity-90 pointer-events-none select-none"
      />
      <img
        src={imgLeaf}
        alt=""
        className="hidden lg:block absolute -right-16 bottom-0 w-[340px] -scale-x-100 opacity-90 pointer-events-none select-none"
      />
      <div className="relative max-w-3xl mx-auto px-6 md:px-10 py-16 md:py-24 text-center">
        <h2 className="text-white text-3xl md:text-5xl font-bold mb-4">
          Subscribe to get the Latest News
        </h2>
        <p className="text-white/85 text-base md:text-lg mb-10">
          Don't miss out on our latest news, updates, tips and special offers
        </p>
        {subscribed ? (
          <div className="max-w-xl mx-auto bg-[#fff9f1] border border-[#f9c06a]/40 rounded-[8px] p-8">
            <p className="font-script text-[#603809] text-4xl mb-2">You're in!</p>
            <p className="text-[#707070] text-lg">
              Thanks for subscribing. Fresh offers are on their way to your
              inbox.
            </p>
          </div>
        ) : (
          <form
            className="flex flex-col sm:flex-row items-center gap-4 bg-[#fff9f1] border border-[#f9c06a]/40 rounded-[8px] p-2 max-w-xl mx-auto"
            onSubmit={handleSubscribe}
          >
            <input
              type="email"
              name="email"
              required
              placeholder="Enter your mail"
              className="flex-1 w-full bg-transparent px-4 py-3 text-[#1e1e1e] placeholder-black/40 text-lg outline-none"
            />
            <button
              type="submit"
              disabled={busy}
              className="bg-[#f9c06a] text-[#603809] font-bold rounded-[6px] px-8 py-3 text-lg shrink-0 shadow-[0px_6px_12px_0px_rgba(249,192,106,0.35)] hover:scale-105 transition-transform disabled:opacity-60"
            >
              {busy ? "Subscribing…" : "Subscribe"}
            </button>
          </form>
        )}
        {error && (
          <p className="mt-4 inline-block text-sm text-red-700 bg-red-50 border border-red-200 rounded-full px-4 py-2">
            {error}
          </p>
        )}
      </div>
    </section>
  )
}

export default Newsletter
