import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import AuthCard from "../components/AuthCard"
import Button from "../components/Button"
import { supabase } from "../lib/supabase"
import { validatePassword, PASSWORD_RULES } from "../lib/password"

const inputClass =
  "w-full bg-[#fff9f1] border border-[#f9c06a]/40 rounded-[8px] px-4 py-3 text-[#1e1e1e] placeholder-[#707070] outline-none focus:border-[#f9c06a] transition-colors"

function ResetPassword() {
  const navigate = useNavigate()
  const [ready, setReady] = useState(false)
  const [error, setError] = useState("")
  const [busy, setBusy] = useState(false)
  const [password, setPassword] = useState("")

  useEffect(() => {
    async function restore() {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (session) {
        setReady(true)
        return
      }

      if (window.location.hash?.includes("type=recovery")) {
        const { data, error } = await supabase.auth.getUser()
        if (!error && data.user) {
          setReady(true)
          return
        }
      }
      setError(
        "This link is invalid or expired. Request a new password reset link."
      )
    }
    restore()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    const password = form.get("password")
    const confirm = form.get("confirm")
    if (password !== confirm) {
      setError("Passwords do not match.")
      return
    }
    const ruleErr = validatePassword(password)
    if (ruleErr) {
      setError(ruleErr)
      return
    }
    setBusy(true)
    setError("")
    const { error: updateError } = await supabase.auth.updateUser({ password })
    setBusy(false)
    if (updateError) {
      setError(updateError.message)
    } else {
      navigate("/signin")
    }
  }

  return (
    <AuthCard
      title="Set a new password"
      subtitle="Choose a strong password for your account"
    >
      {error && (
        <>
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-[8px] px-3 py-2">
            {error}
          </p>
          {!ready && (
            <Button to="/signin" className="w-full">
              Back to Sign In
            </Button>
          )}
        </>
      )}
      {ready && (
        <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
          <input type="password" name="password" required minLength={6} placeholder="New password" className={inputClass} value={password} onChange={(e) => setPassword(e.target.value)} />
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
          <input type="password" name="confirm" required minLength={6} placeholder="Confirm new password" className={inputClass} />
          <Button className="w-full" disabled={busy}>
            {busy ? "Updating…" : "Update Password"}
          </Button>
        </form>
      )}
    </AuthCard>
  )
}

export default ResetPassword