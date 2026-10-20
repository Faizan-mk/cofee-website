// "Beanie" — the cartoon coffee cup that fronts the chat assistant.
// variant "full" shows the whole character (with a pointing arm); "face" crops to the cup for avatars.
function Mascot({ className = "", variant = "full" }) {
  const full = variant === "full"
  return (
    <svg viewBox={full ? "0 0 136 132" : "14 22 92 92"} className={className} aria-hidden="true">
      {full && (
        <g className="mascot-steam" stroke="#c9a77c" strokeWidth="3" strokeLinecap="round" fill="none">
          <path d="M48 22c-5-6 5-9 0-16" />
          <path d="M62 20c-5-6 5-9 0-16" />
          <path d="M76 22c-5-6 5-9 0-16" />
        </g>
      )}

      {/* handle on the left so the right arm is free to point */}
      <path d="M30 54h-7a14 14 0 0 0 0 28h9" fill="none" stroke="#603809" strokeWidth="7" strokeLinecap="round" />

      {full && (
        <>
          <ellipse cx="50" cy="122" rx="9" ry="5" fill="#603809" />
          <ellipse cx="76" cy="122" rx="9" ry="5" fill="#603809" />
        </>
      )}

      <path
        d="M24 38h78l-7 64a14 14 0 0 1-14 12H45a14 14 0 0 1-14-12z"
        fill="#fff4e2"
        stroke="#603809"
        strokeWidth="4"
        strokeLinejoin="round"
      />
      <path d="M28.5 84h69l-1.6 15H30.1z" fill="#f9c06a" />
      <path d="M57 88.5l6 6 6-6" fill="none" stroke="#603809" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <ellipse cx="63" cy="38" rx="39" ry="9" fill="#603809" />
      <ellipse cx="63" cy="37" rx="32" ry="5.5" fill="#8a5420" />

      <g className="mascot-eyes">
        <ellipse cx="51" cy="59" rx="4.5" ry="6" fill="#1e1e1e" />
        <ellipse cx="75" cy="59" rx="4.5" ry="6" fill="#1e1e1e" />
        <circle cx="52.5" cy="56.5" r="1.7" fill="#fff" />
        <circle cx="76.5" cy="56.5" r="1.7" fill="#fff" />
      </g>
      <ellipse cx="42" cy="70" rx="5" ry="3" fill="#f2967f" opacity="0.55" />
      <ellipse cx="84" cy="70" rx="5" ry="3" fill="#f2967f" opacity="0.55" />
      <path d="M55 68q8 9 16 0z" fill="#603809" stroke="#603809" strokeWidth="2.5" strokeLinejoin="round" />

      {full && (
        <g className="mascot-point">
          <path d="M98 70q14-2 24-10" fill="none" stroke="#603809" strokeWidth="5" strokeLinecap="round" />
          <circle cx="123" cy="59" r="6" fill="#fff4e2" stroke="#603809" strokeWidth="3" />
          <path d="M126 56l7-4" stroke="#603809" strokeWidth="4" strokeLinecap="round" />
        </g>
      )}
    </svg>
  )
}

export default Mascot
