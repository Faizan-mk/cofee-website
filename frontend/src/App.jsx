import { useEffect } from "react"
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom"
import Layout from "./components/Layout"
import ScrollToTop from "./components/ScrollToTop"
import Home from "./pages/Home"
import Menu from "./pages/Menu"
import About from "./pages/About"
import Contact from "./pages/Contact"
import OrderNow from "./pages/OrderNow"
import SignIn from "./pages/SignIn"
import SignUp from "./pages/SignUp"
import ResetPassword from "./pages/ResetPassword"
import NotFound from "./pages/NotFound"

const titles = {
  "/": "Bean Scene — Coffee Landing Page",
  "/menu": "Menu — Bean Scene",
  "/about": "About Us — Bean Scene",
  "/contact": "Contact Us — Bean Scene",
  "/order": "Order Now — Bean Scene",
  "/signin": "Sign In — Bean Scene",
  "/signup": "Sign Up — Bean Scene",
  "/reset-password": "Reset Password — Bean Scene",
}

function PageTitle() {
  const { pathname } = useLocation()
  useEffect(() => {
    document.title = titles[pathname] ?? "Bean Scene"
  }, [pathname])
  return null
}

function App() {
  return (
    <BrowserRouter>
      <PageTitle />
      <ScrollToTop />
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/menu" element={<Menu />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/order" element={<OrderNow />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
