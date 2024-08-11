import { Link, useLocation } from "react-router-dom";
import { navItems } from "../nav-items";

const Layout = ({ children }) => {
  const location = useLocation();

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white shadow-sm">
        <nav className="container mx-auto px-4 py-3">
          <ul className="flex space-x-4">
            {navItems.map(({ title, to, icon }) => (
              <li key={to}>
                <Link
                  to={to}
                  className={`flex items-center space-x-1 px-3 py-2 rounded-md transition ${
                    location.pathname === to
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-gray-100"
                  }`}
                >
                  {icon}
                  <span>{title}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </header>
      <main className="flex-grow container mx-auto px-4 py-8">{children}</main>
      <footer className="bg-gray-100 py-4">
        <div className="container mx-auto px-4 text-center text-gray-600">
          © 2024 Recycling Object Counter. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default Layout;
