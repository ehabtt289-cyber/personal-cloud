import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import {
  HiDocumentText, HiPhotograph, HiFilm, HiFolder,
  HiCollection, HiClock
} from "react-icons/hi";

function StatCard({ icon: Icon, label, value, to, color }) {
  return (
    <Link to={to} className={`group bg-gray-900 border border-gray-800 rounded-2xl p-6 hover:border-${color}-500/50 transition-all hover:shadow-lg hover:shadow-${color}-500/10`}>
      <div className={`w-12 h-12 rounded-xl bg-${color}-500/10 flex items-center justify-center mb-4 group-hover:bg-${color}-500/20 transition-colors`}>
        <Icon size={24} className={`text-${color}-400`} />
      </div>
      <div className="text-3xl font-bold text-white mb-1">{value}</div>
      <div className="text-sm text-gray-400">{label}</div>
    </Link>
  );
}

function formatBytes(bytes) {
  if (!bytes) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [recentNotes, setRecentNotes] = useState([]);
  const [recentMedia, setRecentMedia] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get("/stats"),
      api.get("/notes?limit=4"),
      api.get("/media?limit=6"),
    ])
      .then(([s, n, m]) => {
        setStats(s.data);
        setRecentNotes(n.data.slice(0, 4));
        setRecentMedia(m.data.slice(0, 6));
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="animate-fadeIn space-y-8 max-w-6xl">
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-gray-400 mt-1">Welcome to your personal cloud vault</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={HiDocumentText} label="Notes" value={stats?.notesCount ?? 0} to="/notes" color="indigo" />
        <StatCard icon={HiPhotograph} label="Images" value={stats?.imagesCount ?? 0} to="/images" color="emerald" />
        <StatCard icon={HiFilm} label="Videos" value={stats?.videosCount ?? 0} to="/videos" color="violet" />
        <StatCard icon={HiFolder} label="Files" value={stats?.filesCount ?? 0} to="/files" color="amber" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-2">
            <HiCollection size={18} className="text-indigo-400" />
            <span className="font-semibold text-white">Total Items</span>
          </div>
          <div className="text-4xl font-bold text-indigo-400">{stats?.totalItems ?? 0}</div>
          <div className="text-sm text-gray-500 mt-1">stored in your vault</div>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-2">
            <HiFolder size={18} className="text-amber-400" />
            <span className="font-semibold text-white">Storage Used</span>
          </div>
          <div className="text-4xl font-bold text-amber-400">{formatBytes(stats?.totalSize)}</div>
          <div className="text-sm text-gray-500 mt-1">across media & files</div>
        </div>
      </div>

      {recentNotes.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <HiClock size={18} className="text-gray-400" /> Recent Notes
            </h2>
            <Link to="/notes" className="text-sm text-indigo-400 hover:text-indigo-300">View all →</Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {recentNotes.map((note) => (
              <Link
                key={note._id}
                to="/notes"
                className="bg-gray-900 border border-gray-800 rounded-xl p-4 hover:border-indigo-500/40 transition-all group"
              >
                <div className="font-medium text-white group-hover:text-indigo-300 truncate">{note.title}</div>
                <div
                  className="text-sm text-gray-400 mt-1 line-clamp-2"
                  dangerouslySetInnerHTML={{
                    __html: note.content?.replace(/<[^>]*>/g, "") || "Empty note",
                  }}
                />
                <div className="text-xs text-gray-600 mt-2">
                  {new Date(note.updatedAt).toLocaleDateString()}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {recentMedia.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <HiPhotograph size={18} className="text-gray-400" /> Recent Media
            </h2>
            <Link to="/images" className="text-sm text-indigo-400 hover:text-indigo-300">View all →</Link>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {recentMedia.map((m) => (
              <div key={m._id} className="aspect-square rounded-xl overflow-hidden bg-gray-800 border border-gray-700">
                {m.type === "image" ? (
                  <img src={m.url} alt={m.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <HiFilm size={24} className="text-violet-400" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
