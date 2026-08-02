import { useState } from "react"
import { useNavigate } from "react-router-dom"
import AuthCard from "../components/AuthCard"
import Button from "../components/Button"
import { supabase } from "../lib/supabase"
import { validatePassword, PASSWORD_RULES } from "../lib/password"

function SignUp() {
  const navigate = useNavigate()
  const [confirmation, setConfirmation] = useState(false)
  const [error, setError] = useState("")
  const [busy, setBusy] = useState(false)
  const [password, setPassword] = useState("")
  const inputClass =
    "w-full bg-[#fff9f1] border border-[#f9c06a]/40 rounded-[8px] px-4 py-3 text-[#1e1e1e] placeholder-[#707070] outline-none focus:border-[#f9c06a] transition-colors"

  const handleSubmit = async (e) => {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    const email = form.get("email")
    const password = form.get("password")
    const fullName = form.get("fullName")

    if (!supabase) {
      navigate("/")
      return
    }

    setBusy(true)
    setError("")
    const ruleErr = validatePassword(password)
    if (ruleErr) {
      setBusy(false)
      setError(ruleErr)
      return
    }
    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
      },
    })
    setBusy(false)
    if (authError) {
      setError(authError.message)
    } else if (!data.session) {
      setConfirmation(true)
    } else {
      navigate("/")
    }
  }

  return (
    <AuthCard
      title={confirmation ? "Check your email" : "Create your account"}
      subtitle={
        confirmation
          ? "We've sent you a confirmation link to verify your email."
          : "Join Bean Scene and taste the difference"
      }
      footerText="Already have an account?"
      footerLink="/signin"
      footerLabel="Sign In"
    >
      {confirmation ? (
        <div className="text-center py-4">
          <p className="font-script text-[#603809] text-5xl mb-4">Almost there!</p>
          <p className="text-[#707070] text-base">
            Click the link in your email, then sign in to get started.
          </p>
        </div>
      ) : (
        <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
          <input type="text" name="fullName" required placeholder="Full name" className={inputClass} />
          <input type="email" name="email" required placeholder="Email address" className={inputClass} />
          <input
            type="password"
            name="password"
            required
            minLength={6}
            placeholder="Password"
            className={inputClass}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
            {PASSWORD_RULES.map((rule) => {
              const ok = rule.test(password)
              const relevant = ok || password.length > 0
              return (
                <span
                  key={rule.message}
                  className={relevant ? (ok ? "text-green-600" : "text-[#707070]") : "text-[#707070]/50"}
                >
                  {ok ? "✓" : "•"} {rule.message}
                </span>
              )
            })}
          </div>
          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-[8px] px-3 py-2">
              {error}
            </p>
          )}
          <Button className="w-full" disabled={busy}>
            {busy ? "Creating account…" : "Sign Up"}
          </Button>
        </form>
      )}
    </AuthCard>
  )
}

export default SignUp
