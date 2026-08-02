import { useState } from "react"
import { useNavigate } from "react-router-dom"
import AuthCard from "../components/AuthCard"
import Button from "../components/Button"
import { supabase } from "../lib/supabase"

const inputClass =
  "w-full bg-[#fff9f1] border border-[#f9c06a]/40 rounded-[8px] px-4 py-3 text-[#1e1e1e] placeholder-[#707070] outline-none focus:border-[#f9c06a] transition-colors"

function ForgotPassword({ onBack }) {
  const [sent, setSent] = useState(false)
  const [error, setError] = useState("")
  const [busy, setBusy] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    const email = new FormData(e.currentTarget).get("email")

    if (!supabase) {
      setSent(true)
      return
    }

    setBusy(true)
    setError("")
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + "/reset-password",
    })
    setBusy(false)
    if (resetError) {
      setError(resetError.message)
    } else {
      setSent(true)
    }
  }

  return (
    <AuthCard
      title={sent ? "Check your email" : "Reset your password"}
      subtitle={
        sent
          ? "We've sent you a link to reset your password."
          : "Enter your email and we'll send you a reset link"
      }
      footerText="Remembered it?"
      footerLink="/signin"
      footerLabel="Back to Sign In"
    >
      {sent ? (
        <div className="text-center py-4">
          <p className="font-script text-[#603809] text-5xl mb-4">Almost there!</p>
          <p className="text-[#707070] text-base">
            Click the link in your email to choose a new password.
          </p>
        </div>
      ) : (
        <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
          <input type="email" name="email" required placeholder="Email address" className={inputClass} />
          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-[8px] px-3 py-2">
              {error}
            </p>
          )}
          <Button className="w-full" disabled={busy}>
            {busy ? "Sending…" : "Send Reset Link"}
          </Button>
          <button
            type="button"
            onClick={onBack}
            className="text-sm text-[#603809] underline underline-offset-4"
          >
            Back to Sign In
          </button>
        </form>
      )}
    </AuthCard>
  )
}

function SignIn() {
  const navigate = useNavigate()
  const [mode, setMode] = useState("signin")
  const [error, setError] = useState("")
  const [busy, setBusy] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    const email = form.get("email")
    const password = form.get("password")

    if (!supabase) {
      navigate("/")
      return
    }

    setBusy(true)
    setError("")
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    setBusy(false)
    if (authError) {
      setError(authError.message)
    } else {
      navigate("/")
    }
  }

  if (mode === "forgot") {
    return <ForgotPassword onBack={() => setMode("signin")} />
  }

  return (
    <AuthCard
      title="Welcome back"
      subtitle="Sign in to continue your coffee journey"
      footerText="Don't have an account?"
      footerLink="/signup"
      footerLabel="Sign Up"
    >
      <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
        <input type="email" name="email" required placeholder="Email address" className={inputClass} />
        <input type="password" name="password" required placeholder="Password" className={inputClass} />
        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-[8px] px-3 py-2">
            {error}
          </p>
        )}
        <button
          type="button"
          onClick={() => setMode("forgot")}
          className="text-right text-sm text-[#603809] underline underline-offset-4"
        >
          Forgot password?
        </button>
        <Button className="w-full" disabled={busy}>
          {busy ? "Signing in…" : "Sign In"}
        </Button>
      </form>
    </AuthCard>
  )
}

export default SignIn