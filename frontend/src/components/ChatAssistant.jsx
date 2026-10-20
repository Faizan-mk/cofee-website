import { useEffect, useRef, useState } from "react"
import { Link } from "react-router-dom"
import Mascot from "./Mascot"
import { menuItems, categories, money } from "../data/menuItems"
import { introDone } from "../lib/intro"
import { pauseScroll, resumeScroll } from "../lib/smoothScroll"

const STORAGE_KEY = "beanscene-chats"

const suggestions = [
  { icon: "☕", label: "Show me the menu" },
  { icon: "⭐", label: "Recommend a coffee" },
  { icon: "🧊", label: "Cold drinks?" },
  { icon: "🕖", label: "Opening hours" },
]

const byName = Object.fromEntries(menuItems.map((m) => [m.name, m]))

function readStorage(key, fallback) {
  try {
    const value = JSON.parse(localStorage.getItem(key))
    return value ?? fallback
  } catch {
    return fallback
  }
}

function writeStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // ignore quota / private mode errors
  }
}

const loadChats = () => {
  const saved = readStorage(STORAGE_KEY, [])
  return Array.isArray(saved) ? saved : []
}

const pick = (list) => list[Math.floor(Math.random() * list.length)]

const typingDelay = () => 600 + Math.random() * 600

// RAG backend (rag-backend/, FastAPI). In dev Vite proxies /api to it; in production
// set VITE_CHAT_API_URL to the deployed server, e.g. https://bean-rag.onrender.com/api
const CHAT_API = import.meta.env.VITE_CHAT_API_URL || "/api"
const HISTORY_TURNS = 6

async function askAssistant(message, history) {
  const res = await fetch(`${CHAT_API}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, history }),
    // Free hosting sleeps when idle; the first request can take ~50s to wake it.
    signal: AbortSignal.timeout(60000),
  })
  if (!res.ok) throw new Error(`chat API ${res.status}`)
  const data = await res.json()
  return { text: data.answer, items: (data.items ?? []).filter((n) => byName[n]) }
}

// Matches the `chatwide` variant in index.css: below it the chat goes full-screen (phones, landscape phones).
const isMobile = () => !window.matchMedia("(min-width: 640px) and (min-height: 560px)").matches

// Every menu item named in the text; "Iced Cappuccino" wins over the plain "Cappuccino" inside it.
function mentionedItems(q) {
  const found = menuItems.filter((m) => q.includes(m.name.toLowerCase())).map((m) => m.name)
  return found.filter((n) => !found.some((o) => o !== n && o.toLowerCase().includes(n.toLowerCase())))
}

const orderLink = { label: "Order now", to: "/order" }
const menuLink = { label: "Open full menu", to: "/menu" }

// Offline fallback when the RAG API can't be reached: small rule-based answers from the menu data.
function reply(input) {
  const q = input.toLowerCase()
  const items = mentionedItems(q)

  if (items.length === 1) {
    const m = byName[items[0]]
    return {
      text: `${m.name} — ${m.desc}. It's ${money(m.price)}${m.badge ? ` and a ${m.badge.toLowerCase()} favourite` : ""}. Want one?`,
      items,
    }
  }
  if (items.length > 1)
    return { text: "Great picks! Here they are side by side:", items, links: [orderLink] }
  if (/\b(hi|hello|hey|salam|assalam)/.test(q))
    return { text: "Hello! ☕ What can I brew up for you today? Ask me about the menu, prices or ordering." }
  if (/recommend|suggest|best|popular|favourite|favorite/.test(q)) {
    const best = menuItems.filter((m) => m.badge === "Bestseller")
    const m = pick(best)
    return {
      text: `Our bestsellers are ${best.map((b) => b.name).join(" and ")}. Today I'd go with the ${m.name} — ${m.desc.toLowerCase()}.`,
      items: best.map((b) => b.name),
    }
  }
  for (const cat of categories) {
    const key = cat.split(" ")[0].toLowerCase()
    if (q.includes(key) || (cat === "Desserts" && /cake|sweet|dessert|snack/.test(q))) {
      const list = menuItems.filter((m) => m.category === cat)
      return { text: `Here's our ${cat.toLowerCase()} — swipe to see them all:`, items: list.map((m) => m.name) }
    }
  }
  if (/menu|drinks|items|what do you (have|sell)/.test(q))
    return {
      text: `We serve ${menuItems.length} items across ${categories.join(", ")}. Ask me about any category, or open the full menu.`,
      links: [menuLink],
    }
  if (/price|cost|cheap|expensive|how much/.test(q)) {
    const prices = menuItems.map((m) => m.price)
    return {
      text: `Prices range from ${money(Math.min(...prices))} to ${money(Math.max(...prices))}. Name a drink and I'll tell you its exact price.`,
    }
  }
  if (/hour|open|close|timing|time/.test(q))
    return { text: "We're open every day, 8:00 AM – 10:00 PM. Early birds get the freshest roast! 🌅" }
  if (/order|buy|deliver|delivery/.test(q))
    return { text: "Ordering is easy — pick your drinks, add them to the cart and checkout in a minute.", links: [orderLink] }
  if (/contact|email|phone|call|reach/.test(q))
    return { text: "Reach us at beanscene@mail.com or through our contact page.", links: [{ label: "Contact us", to: "/contact" }] }
  if (/thank|thanks|shukriya/.test(q)) return { text: "Anytime! Enjoy your coffee ☕" }
  return {
    text: "Hmm, I'm not sure about that one. Try asking about our menu, a specific drink, prices, hours or ordering.",
  }
}

const titleFrom = (text) => (text.length > 34 ? `${text.slice(0, 34)}…` : text)

const timeAgo = (ts) => {
  const s = Math.floor((Date.now() - ts) / 1000)
  if (s < 60) return "just now"
  if (s < 3600) return `${Math.floor(s / 60)}m ago`
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`
  return new Date(ts).toLocaleDateString()
}

const clock = (ts) => new Date(ts).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })

function Icon({ d, className = "w-5 h-5" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {d}
    </svg>
  )
}

const icons = {
  chat: <path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z" />,
  close: <path d="M18 6 6 18M6 6l12 12" />,
  plus: <path d="M12 5v14M5 12h14" />,
  history: (
    <>
      <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
      <path d="M3 3v5h5M12 7v5l3 2" />
    </>
  ),
  back: <path d="m15 18-6-6 6-6" />,
  send: <path d="m22 2-7 20-4-9-9-4zM22 2 11 13" />,
  trash: <path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14" />,
  arrow: <path d="M5 12h14m-6-6 6 6-6 6" />,
}

function IconButton({ label, onClick, active, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={`w-10 h-10 grid place-items-center rounded-full transition-colors ${
        active ? "bg-[#f9c06a] text-[#1e1e1e]" : "text-white/80 hover:text-[#1e1e1e] hover:bg-[#f9c06a]"
      }`}
    >
      {children}
    </button>
  )
}

function Avatar({ className = "w-8 h-8" }) {
  return (
    <span className={`${className} shrink-0 grid place-items-center rounded-full bg-[#f9c06a] ring-2 ring-white overflow-hidden`}>
      <Mascot variant="face" className="w-[85%] h-[85%]" />
    </span>
  )
}

function ItemCards({ names, onPick }) {
  return (
    <div data-lenis-prevent className="no-scrollbar flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 snap-x">
      {names.map((n) => {
        const m = byName[n]
        if (!m) return null
        return (
          <div key={n} className="snap-start shrink-0 w-[132px] rounded-2xl overflow-hidden bg-white border border-[#603809]/10 shadow-sm">
            <div className="relative h-20 bg-[#f3e2c7]">
              <img src={m.img} alt={m.name} loading="lazy" className="w-full h-full object-cover" />
              {m.badge && (
                <span className="absolute top-1.5 left-1.5 text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-full bg-[#f9c06a] text-[#1e1e1e]">
                  {m.badge}
                </span>
              )}
            </div>
            <div className="p-2">
              <p className="text-xs font-bold text-[#1e1e1e] truncate">{m.name}</p>
              <p className="text-xs text-[#603809] mb-1.5">{money(m.price)}</p>
              <Link
                to="/order"
                state={{ item: m.name }}
                onClick={onPick}
                className="block text-center text-[11px] font-bold py-1.5 rounded-full bg-[#603809] text-white hover:bg-[#f9c06a] hover:text-[#1e1e1e] transition-colors"
              >
                Order
              </Link>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// LLM replies use light markdown: render **bold** and turn "* " / "- " list markers into bullets.
function RichText({ text }) {
  return text.split("\n").map((line, i) => {
    const clean = line.replace(/^\s*[*-]\s+/, "• ")
    return (
      <span key={i}>
        {i > 0 && "\n"}
        {clean.split(/(\*\*[^*]+\*\*)/g).map((part, j) =>
          part.startsWith("**") && part.endsWith("**") ? <strong key={j}>{part.slice(2, -2)}</strong> : part
        )}
      </span>
    )
  })
}

function Message({ m, onNavigate }) {
  if (m.role === "user")
    return (
      <div className="msg-in flex flex-col items-end">
        <p className="max-w-[82%] whitespace-pre-line text-[15px] sm:text-sm leading-relaxed px-4 py-2.5 rounded-2xl rounded-br-md bg-[#603809] text-white shadow-sm">
          {m.text}
        </p>
        <span className="text-[10px] text-[#603809]/50 mt-1 pr-1">{clock(m.ts)}</span>
      </div>
    )
  return (
    <div className="msg-in flex items-end gap-2">
      <Avatar className="w-7 h-7 mb-5" />
      <div className="min-w-0 max-w-[85%] space-y-2">
        <p className="whitespace-pre-line text-[15px] sm:text-sm leading-relaxed px-4 py-2.5 rounded-2xl rounded-bl-md bg-white text-[#1e1e1e] border border-[#603809]/10 shadow-sm w-fit">
          <RichText text={m.text} />
        </p>
        {m.items?.length > 0 && <ItemCards names={m.items} onPick={onNavigate} />}
        {m.links?.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {m.links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={onNavigate}
                className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-full bg-[#f9c06a] text-[#1e1e1e] hover:bg-[#603809] hover:text-white transition-colors"
              >
                {l.label} <Icon d={icons.arrow} className="w-3.5 h-3.5" />
              </Link>
            ))}
          </div>
        )}
        <span className="block text-[10px] text-[#603809]/50 pl-1">
          {clock(m.ts)}
          {m.offline && " · Offline answer — AI server not reachable"}
        </span>
      </div>
    </div>
  )
}

function Welcome({ onPick }) {
  return (
    <div className="msg-in flex flex-col items-center text-center pt-2 pb-4">
      <Mascot className="mascot-float w-28 h-28 sm:w-24 sm:h-24" />
      <h3 className="mt-2 text-xl font-bold text-[#1e1e1e]">Hey, I'm Beanie!</h3>
      <p className="mt-1 text-sm text-[#603809]/80 max-w-[260px]">
        Your Bean Scene coffee buddy. Ask me about drinks, prices, hours or ordering.
      </p>
      <div className="grid grid-cols-2 gap-2 w-full mt-5">
        {suggestions.map((s) => (
          <button
            key={s.label}
            type="button"
            onClick={() => onPick(s.label)}
            className="flex flex-col items-start gap-1 text-left p-3 rounded-2xl bg-white border border-[#603809]/10 shadow-sm hover:border-[#f9c06a] hover:shadow-[0_6px_16px_rgba(249,192,106,0.35)] hover:-translate-y-0.5 transition-all"
          >
            <span className="text-lg">{s.icon}</span>
            <span className="text-xs font-bold text-[#1e1e1e]">{s.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

function History({ chats, activeId, onOpen, onDelete, onNew }) {
  const dayStart = new Date().setHours(0, 0, 0, 0)
  const groups = [
    { label: "Today", list: chats.filter((c) => c.updatedAt >= dayStart) },
    { label: "Earlier", list: chats.filter((c) => c.updatedAt < dayStart) },
  ].filter((g) => g.list.length)

  return (
    <div data-lenis-prevent className="flex-1 overflow-y-auto overscroll-contain p-4 space-y-4 bg-[#fff8ee]">
      <button
        type="button"
        onClick={onNew}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-[#603809] text-white font-bold text-sm hover:bg-[#f9c06a] hover:text-[#1e1e1e] transition-colors"
      >
        <Icon d={icons.plus} className="w-4 h-4" /> Start a new chat
      </button>
      {chats.length === 0 && (
        <div className="flex flex-col items-center text-center pt-8">
          <Mascot variant="face" className="w-16 h-16 opacity-70" />
          <p className="mt-3 text-sm text-[#603809]/70">No conversations yet.<br />Say hi to Beanie!</p>
        </div>
      )}
      {groups.map((g) => (
        <div key={g.label}>
          <p className="text-[11px] font-bold uppercase tracking-widest text-[#603809]/50 mb-2 px-1">{g.label}</p>
          <div className="space-y-1.5">
            {g.list.map((c) => (
              <div
                key={c.id}
                className={`flex items-center gap-2 rounded-2xl pl-3 pr-1.5 py-2.5 border transition-colors ${
                  c.id === activeId ? "bg-[#f9c06a]/30 border-[#f9c06a]" : "bg-white border-[#603809]/10 hover:border-[#f9c06a]"
                }`}
              >
                <Icon d={icons.chat} className="w-4 h-4 shrink-0 text-[#603809]/60" />
                <button type="button" onClick={() => onOpen(c.id)} className="flex-1 min-w-0 text-left">
                  <p className="font-bold text-sm text-[#1e1e1e] truncate">{c.title}</p>
                  <p className="text-xs text-[#603809]/70">
                    {c.messages.length} messages · {timeAgo(c.updatedAt)}
                  </p>
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(c.id)}
                  aria-label={`Delete chat ${c.title}`}
                  className="w-9 h-9 grid place-items-center rounded-full text-[#603809]/50 hover:text-white hover:bg-red-600 transition-colors"
                >
                  <Icon d={icons.trash} className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

// Visit guide: Beanie slides in beside the launcher, "types" a hello, and points at the chat button.
function Guide({ leaving, onChat, onDismiss }) {
  const [typed, setTyped] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setTyped(true), 1100)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div
      className={`fixed z-[94] bottom-4 right-[84px] flex flex-col items-end ${leaving ? "mascot-out" : "mascot-pop"}`}
      role="status"
    >
      <div className="bubble-in relative mb-1 mr-6 w-[min(240px,calc(100vw-120px))] rounded-2xl rounded-br-sm bg-white p-3.5 shadow-[0_12px_32px_rgba(30,20,10,0.25)] border border-[#603809]/10">
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss"
          className="absolute top-1.5 right-1.5 w-7 h-7 grid place-items-center rounded-full text-[#603809]/50 hover:bg-[#603809]/10"
        >
          <Icon d={icons.close} className="w-3.5 h-3.5" />
        </button>
        {typed ? (
          <div className="msg-in">
            <p className="font-bold text-[#1e1e1e] pr-5">Hi! 👋 I'm your AI Assistant</p>
            <p className="text-xs text-[#603809]/80 mt-1 leading-relaxed">
              I'm Beanie. Ask me about coffee, prices or orders — tap the chat button right here 👉
            </p>
            <button
              type="button"
              onClick={onChat}
              className="mt-2.5 inline-flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-full bg-[#f9c06a] text-[#1e1e1e] hover:bg-[#603809] hover:text-white transition-colors"
            >
              Let's chat <Icon d={icons.arrow} className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div className="flex gap-1 py-1.5" aria-label="Beanie is typing">
            {[0, 1, 2].map((d) => (
              <span key={d} className="w-2 h-2 rounded-full bg-[#603809]/50 animate-bounce" style={{ animationDelay: `${d * 0.15}s` }} />
            ))}
          </div>
        )}
        <span className="absolute -bottom-2 right-6 w-4 h-4 rotate-45 bg-white border-r border-b border-[#603809]/10" />
      </div>
      <button type="button" onClick={onChat} aria-label="Open chat with Beanie" className="mascot-float">
        <Mascot className="w-[92px] sm:w-[118px] drop-shadow-[0_10px_14px_rgba(30,20,10,0.3)]" />
      </button>
    </div>
  )
}

function ChatAssistant() {
  const [open, setOpen] = useState(false)
  const [view, setView] = useState("chat")
  const [chats, setChats] = useState(loadChats)
  const [activeId, setActiveId] = useState(null)
  const [input, setInput] = useState("")
  const [typing, setTyping] = useState(false)
  const [guide, setGuide] = useState("hidden") // hidden | shown | leaving
  const [seen, setSeen] = useState(false)
  const scroller = useRef(null)
  const field = useRef(null)

  const active = chats.find((c) => c.id === activeId)
  const messages = active?.messages ?? []

  useEffect(() => writeStorage(STORAGE_KEY, chats), [chats])

  // Show the guide on every visit, a moment after the preloader lifts.
  useEffect(() => {
    if (seen) return
    let timer
    introDone.then(() => (timer = setTimeout(() => setGuide("shown"), 1200)))
    return () => clearTimeout(timer)
  }, [seen])

  useEffect(() => {
    if (guide !== "shown") return
    const timer = setTimeout(() => dismissGuide(), 15000)
    return () => clearTimeout(timer)
  }, [guide])

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: "smooth" })
  }, [messages.length, typing, view, open])

  useEffect(() => {
    if (open && view === "chat" && !isMobile()) field.current?.focus()
  }, [open, view, activeId])

  // Full-screen on phones: freeze the page behind the chat.
  useEffect(() => {
    if (!open || !isMobile()) return
    const root = document.documentElement
    const prev = root.style.overflow
    root.style.overflow = "hidden"
    pauseScroll()
    return () => {
      root.style.overflow = prev
      resumeScroll()
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === "Escape" && setOpen(false)
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open])

  function dismissGuide() {
    setSeen(true)
    setGuide((g) => (g === "shown" ? "leaving" : g))
    setTimeout(() => setGuide("hidden"), 350)
  }

  const openChat = () => {
    if (guide !== "hidden" || !seen) dismissGuide()
    setOpen(true)
  }

  const startNewChat = () => {
    setActiveId(null)
    setInput("")
    setTyping(false)
    setView("chat")
  }

  const showChat = (id) => {
    setActiveId(id)
    setView("chat")
  }

  const deleteChat = (id) => {
    setChats((list) => list.filter((c) => c.id !== id))
    if (id === activeId) setActiveId(null)
  }

  const closeOnMobile = () => isMobile() && setOpen(false)

  const send = (text) => {
    const msg = text.trim()
    if (!msg || typing) return
    setInput("")

    // A chat is only saved to history once the user sends something.
    let id = activeId
    if (!id) {
      id = crypto.randomUUID?.() ?? String(Date.now())
      const chat = { id, title: titleFrom(msg), messages: [], updatedAt: Date.now() }
      setChats((list) => [chat, ...list])
      setActiveId(id)
    }

    const append = (m) =>
      setChats((list) =>
        list
          .map((c) => (c.id === id ? { ...c, messages: [...c.messages, { ...m, ts: Date.now() }], updatedAt: Date.now() } : c))
          .sort((a, b) => b.updatedAt - a.updatedAt)
      )

    const history = (active?.messages ?? []).map(({ role, text }) => ({ role, text })).slice(-HISTORY_TURNS)

    append({ role: "user", text: msg })
    setTyping(true)
    askAssistant(msg, history)
      .catch(() => new Promise((ok) => setTimeout(() => ok({ ...reply(msg), offline: true }), typingDelay())))
      .then((answer) => {
        append({ role: "bot", ...answer })
        setTyping(false)
      })
  }

  return (
    <>
      {guide !== "hidden" && !open && (
        <Guide leaving={guide === "leaving"} onChat={openChat} onDismiss={dismissGuide} />
      )}

      {open && (
        <section
          role="dialog"
          aria-label="Beanie chat assistant"
          className="chat-in fixed z-[96] inset-0 h-[100dvh] chatwide:inset-auto chatwide:bottom-24 chatwide:right-5 chatwide:w-[400px] chatwide:h-[min(640px,calc(100dvh-8rem))] flex flex-col overflow-hidden bg-[#fffefc] chatwide:rounded-[28px] shadow-[0_24px_70px_rgba(30,20,10,0.4)] chatwide:border chatwide:border-[#603809]/15"
        >
          <header className="relative flex items-center gap-2 px-3 sm:px-4 pt-[max(0.75rem,env(safe-area-inset-top))] pb-3 bg-gradient-to-br from-[#2a1a0c] via-[#1e140a] to-[#3b2410] text-white">
            {view === "history" ? (
              <IconButton label="Back to chat" onClick={() => setView("chat")}>
                <Icon d={icons.back} />
              </IconButton>
            ) : (
              <span className="relative">
                <Avatar className="w-10 h-10" />
                <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500 ring-2 ring-[#1e140a]" />
              </span>
            )}
            <div className="flex-1 min-w-0 pl-1">
              <p className="font-bold leading-tight text-[17px]">{view === "history" ? "Chat history" : "Beanie"}</p>
              <p className="text-xs text-white/60 truncate">
                {view === "history"
                  ? `${chats.length} conversation${chats.length === 1 ? "" : "s"}`
                  : typing
                    ? "typing…"
                    : "AI coffee assistant · online"}
              </p>
            </div>
            <IconButton label="Chat history" active={view === "history"} onClick={() => setView(view === "history" ? "chat" : "history")}>
              <Icon d={icons.history} />
            </IconButton>
            <IconButton label="New chat" onClick={startNewChat}>
              <Icon d={icons.plus} />
            </IconButton>
            <IconButton label="Close chat" onClick={() => setOpen(false)}>
              <Icon d={icons.close} />
            </IconButton>
          </header>

          {view === "history" ? (
            <History chats={chats} activeId={activeId} onOpen={showChat} onDelete={deleteChat} onNew={startNewChat} />
          ) : (
            <>
              <div ref={scroller} data-lenis-prevent className="flex-1 overflow-y-auto overscroll-contain px-4 py-4 space-y-4 bg-[#fff8ee]">
                {!active && <Welcome onPick={send} />}
                {messages.map((m, i) => (
                  <Message key={i} m={m} onNavigate={closeOnMobile} />
                ))}
                {typing && (
                  <div className="msg-in flex items-end gap-2">
                    <Avatar className="w-7 h-7" />
                    <div className="flex gap-1 px-4 py-3.5 rounded-2xl rounded-bl-md bg-white border border-[#603809]/10">
                      {[0, 1, 2].map((d) => (
                        <span key={d} className="w-2 h-2 rounded-full bg-[#603809]/50 animate-bounce" style={{ animationDelay: `${d * 0.15}s` }} />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  send(input)
                }}
                className="px-3 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] border-t border-[#603809]/10 bg-[#fffefc]"
              >
                <div className="flex items-center gap-2 pl-4 pr-1.5 py-1.5 rounded-full bg-[#603809]/[0.06] focus-within:ring-2 focus-within:ring-[#f9c06a] transition-shadow">
                  <input
                    ref={field}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask Beanie anything…"
                    aria-label="Message"
                    enterKeyHint="send"
                    className="flex-1 min-w-0 bg-transparent text-base sm:text-sm text-[#1e1e1e] placeholder:text-[#603809]/45 outline-none"
                  />
                  <button
                    type="submit"
                    disabled={!input.trim() || typing}
                    aria-label="Send"
                    className="w-10 h-10 shrink-0 grid place-items-center rounded-full bg-[#f9c06a] text-[#1e1e1e] hover:bg-[#603809] hover:text-white disabled:opacity-40 disabled:pointer-events-none transition-colors"
                  >
                    <Icon d={icons.send} className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-[10px] text-center text-[#603809]/50 mt-2">Beanie can make mistakes · Prices shown are from our menu</p>
              </form>
            </>
          )}
        </section>
      )}

      <button
        type="button"
        onClick={() => (open ? setOpen(false) : openChat())}
        aria-label={open ? "Close chat assistant" : "Open chat assistant"}
        aria-expanded={open}
        className={`fixed z-[95] bottom-5 right-5 w-14 h-14 place-items-center rounded-full bg-[#f9c06a] text-[#1e1e1e] shadow-[0_8px_24px_rgba(249,192,106,0.55)] hover:bg-[#603809] hover:text-white hover:scale-105 transition-all ${
          open ? "hidden chatwide:grid" : "grid"
        } ${guide === "shown" && !open ? "launcher-wiggle" : ""}`}
      >
        {!seen && !open && <span className="launcher-pulse absolute inset-0 rounded-full bg-[#f9c06a]" aria-hidden="true" />}
        <Icon d={open ? icons.close : icons.chat} className="relative w-6 h-6" />
        {!seen && !open && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-red-500 ring-2 ring-white text-[9px] font-bold text-white grid place-items-center">
            1
          </span>
        )}
      </button>
    </>
  )
}

export default ChatAssistant
