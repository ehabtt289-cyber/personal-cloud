import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { HiLockClosed, HiEye, HiEyeOff } from "react-icons/hi";

export default function Login() {
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(password);
      toast.success("Welcome back!");
      navigate("/");
    } catch {
      toast.error("Invalid password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-600 text-3xl mb-4 shadow-lg shadow-indigo-500/30">
            ☁
          </div>
          <h1 className="text-3xl font-bold text-white">Cloud Vault</h1>
          <p className="text-gray-400 mt-2">Your private personal storage</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-gray-900 rounded-2xl p-8 border border-gray-800 shadow-xl"
        >
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Vault Password
          </label>
          <div className="relative mb-6">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
              <HiLockClosed size={18} />
            </div>
            <input
              type={show ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              className="w-full bg-gray-800 border border-gray-700 rounded-xl pl-10 pr-10 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
              autoFocus
            />
            <button
              type="button"
              onClick={() => setShow(!show)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
            >
              {show ? <HiEyeOff size={18} /> : <HiEye size={18} />}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold rounded-xl transition-all shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              "Unlock Vault"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
