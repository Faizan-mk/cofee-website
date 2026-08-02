export const PASSWORD_RULES = [
  { test: (pw) => pw.length >= 6, message: "At least 6 characters" },
  { test: (pw) => /[a-z]/.test(pw), message: "one lowercase letter" },
  { test: (pw) => /[A-Z]/.test(pw), message: "one uppercase letter" },
  { test: (pw) => /\d/.test(pw), message: "one number" },
  { test: (pw) => /[^A-Za-z0-9]/.test(pw), message: "one special character" },
]

export function validatePassword(password) {
  if (typeof password !== "string") {
    return "Password must contain at least 6 characters"
  }
  const first = PASSWORD_RULES.find((r) => !r.test(password))
  return first
    ? `Password must contain at least ${first.message}`
    : null
}