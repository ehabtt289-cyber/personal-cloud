import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  HiHome, HiDocumentText, HiPhotograph, HiFilm, HiFolder,
  HiSearch, HiLogout, HiX
} from "react-icons/hi";

const navItems = [
  { to: "/", label: "Dashboard", icon: HiHome, exact: true },
  { to: "/notes", label: "Notes", icon: HiDocumentText },
  { to: "/images", label: "Images", icon: HiPhotograph },
  { to: "/videos", label: "Videos", icon: HiFilm },
  { to: "/files", label: "Files", icon: HiFolder },
  { to: "/search", label: "Search", icon: HiSearch },
];

export default function Sidebar({ open, onClose }) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 bg-black/60 z-20 md:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={`
          fixed top-0 left-0 h-full z-30 w-64 bg-gray-900 border-r border-gray-800
          flex flex-col transform transition-transform duration-200
          md:static md:translate-x-0
          ${open ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-sm">☁</div>
            <span className="text-lg font-bold text-white">Cloud Vault</span>
          </div>
          <button onClick={onClose} className="md:hidden text-gray-400 hover:text-white">
            <HiX size={20} />
          </button>
        </div>

        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {navItems.map(({ to, label, icon: Icon, exact }) => (
            <NavLink
              key={to}
              to={to}
              end={exact}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20"
                    : "text-gray-400 hover:text-white hover:bg-gray-800"
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="px-3 py-4 border-t border-gray-800">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:text-red-400 hover:bg-gray-800 transition-all"
          >
            <HiLogout size={18} />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}
