import { Outlet } from "react-router-dom"
import NavBar from "./NavBar"
import Footer from "./Footer"

function Layout() {
  return (
    <div className="overflow-x-hidden">
      <NavBar />
      <Outlet />
      <Footer />
    </div>
  )
}

export default Layout
