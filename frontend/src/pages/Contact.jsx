import { useState } from "react"
import PageHero from "../components/PageHero"
import Button from "../components/Button"
import { supabase } from "../lib/supabase"

const contactInfo = [
  {
    title: "Visit Us",
    lines: [
      "Akshya Nagar 1st Block 1st Cross,",
      "Rammurthy nagar, Bangalore-560016",
    ],
  },
  {
    title: "Call Us",
    lines: ["+1 202-918-2132", "Mon–Sun: 8:00 AM – 10:00 PM"],
  },
  {
    title: "Email Us",
    lines: ["beanscene@mail.com", "support@beanscene.com"],
  },
]

function Contact() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  })
  const [sent, setSent] = useState(false)
  const [error, setError] = useState("")
  const [busy, setBusy] = useState(false)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!supabase) {
      setSent(true)
      return
    }
    setBusy(true)
    setError("")
    const { error: insertError } = await supabase
      .from("contact_messages")
      .insert(form)
    setBusy(false)
    if (insertError) {
      setError(insertError.message)
    } else {
      setSent(true)
    }
  }

  const inputClass =
    "w-full bg-[#fff9f1] border border-[#f9c06a]/40 rounded-[8px] px-4 py-3 text-[#1e1e1e] placeholder-[#707070] outline-none focus:border-[#f9c06a] transition-colors"

  return (
    <>
      <PageHero
        title="Contact Us"
        subtitle="Have a question, feedback, or just want to say hello? We'd love to hear from you."
      />

      <section className="max-w-7xl mx-auto px-6 md:px-10 py-16 md:py-24 grid lg:grid-cols-2 gap-12">
        <div>
          <h2 className="text-[#603809] text-3xl md:text-4xl font-bold mb-4">
            Get in touch
          </h2>
          <p className="text-[#707070] text-base md:text-lg leading-loose mb-10">
            We are giving you a one time opportunity to experience a better life
            with coffee. Reach out and let's talk.
          </p>
          <div className="grid sm:grid-cols-2 gap-6">
            {contactInfo.map((info) => (
              <div
                key={info.title}
                className="bg-[#fff9f1] border border-[#f9c06a]/40 rounded-[16px] p-6"
              >
                <h3 className="text-[#603809] text-lg font-bold mb-3">
                  {info.title}
                </h3>
                {info.lines.map((line) => (
                  <p key={line} className="text-[#707070] text-sm leading-relaxed">
                    {line}
                  </p>
                ))}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#fff9f1] border border-[#f9c06a]/40 rounded-[24px] p-8 md:p-10">
          {sent ? (
            <div className="text-center py-16">
              <p className="font-script text-[#603809] text-6xl mb-4">Thank you!</p>
              <p className="text-[#707070] text-lg mb-8">
                Your message has been sent. We'll get back to you soon.
              </p>
              <Button onClick={() => setSent(false)}>Send another</Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div className="grid sm:grid-cols-2 gap-5">
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  placeholder="Your name"
                  className={inputClass}
                />
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  placeholder="Your email"
                  className={inputClass}
                />
              </div>
              <input
                name="subject"
                value={form.subject}
                onChange={handleChange}
                placeholder="Subject"
                className={inputClass}
              />
              <textarea
                name="message"
                value={form.message}
                onChange={handleChange}
                required
                placeholder="Your message"
                rows="6"
                className={`${inputClass} resize-none`}
              />
              {error && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-[8px] px-3 py-2">
                  {error}
                </p>
              )}
              <Button className="w-max" disabled={busy}>
                {busy ? "Sending…" : "Send Message"}
              </Button>
            </form>
          )}
        </div>
      </section>
    </>
  )
}

export default Contact
