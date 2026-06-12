import { useState, useCallback } from "react";
import api from "../api/axios";
import { HiSearch, HiDocumentText, HiPhotograph, HiFilm, HiFolder } from "react-icons/hi";
import PreviewModal from "../components/PreviewModal";

function useDebounce(fn, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

export default function Search() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [previewType, setPreviewType] = useState(null);

  const doSearch = async (q) => {
    if (!q.trim()) { setResults(null); return; }
    setLoading(true);
    try {
      const { data } = await api.get(`/search?q=${encodeURIComponent(q)}`);
      setResults(data);
    } catch {
      setResults(null);
    } finally {
      setLoading(false);
    }
  };

  const total = results
    ? results.notes.length + results.media.length + results.files.length
    : 0;

  return (
    <div className="animate-fadeIn max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-4">Search</h1>
        <div className="relative">
          <HiSearch size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              doSearch(e.target.value);
            }}
            placeholder="Search notes, images, videos, files..."
            autoFocus
            className="w-full bg-gray-900 border border-gray-700 rounded-2xl pl-12 pr-4 py-4 text-white text-base placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition shadow-lg"
          />
          {loading && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>
      </div>

      {results && (
        <div>
          <p className="text-gray-400 text-sm mb-6">
            {total} result{total !== 1 ? "s" : ""} for "<span className="text-white">{query}</span>"
          </p>

          {results.notes.length > 0 && (
            <div className="mb-6">
              <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-300 uppercase tracking-wider mb-3">
                <HiDocumentText size={16} className="text-indigo-400" /> Notes
              </h2>
              <div className="space-y-2">
                {results.notes.map((note) => (
                  <div key={note._id} className="bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 hover:border-indigo-500/40 transition">
                    <div className="font-medium text-white">{note.title}</div>
                    <div
                      className="text-sm text-gray-400 mt-1 line-clamp-2"
                      dangerouslySetInnerHTML={{ __html: note.content?.replace(/<[^>]*>/g, "") || "" }}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {results.media.filter((m) => m.type === "image").length > 0 && (
            <div className="mb-6">
              <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-300 uppercase tracking-wider mb-3">
                <HiPhotograph size={16} className="text-emerald-400" /> Images
              </h2>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                {results.media.filter((m) => m.type === "image").map((img) => (
                  <div
                    key={img._id}
                    onClick={() => { setPreview(img); setPreviewType("image"); }}
                    className="aspect-square rounded-xl overflow-hidden bg-gray-800 border border-gray-700 cursor-pointer hover:border-emerald-500/50 transition"
                  >
                    <img src={img.url} alt={img.title} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {results.media.filter((m) => m.type === "video").length > 0 && (
            <div className="mb-6">
              <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-300 uppercase tracking-wider mb-3">
                <HiFilm size={16} className="text-violet-400" /> Videos
              </h2>
              <div className="space-y-2">
                {results.media.filter((m) => m.type === "video").map((vid) => (
                  <div
                    key={vid._id}
                    onClick={() => { setPreview(vid); setPreviewType("video"); }}
                    className="bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 hover:border-violet-500/40 transition cursor-pointer flex items-center gap-3"
                  >
                    <div className="w-10 h-10 rounded-lg bg-violet-600/20 flex items-center justify-center">
                      <HiFilm size={20} className="text-violet-400" />
                    </div>
                    <span className="font-medium text-white">{vid.title}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {results.files.length > 0 && (
            <div className="mb-6">
              <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-300 uppercase tracking-wider mb-3">
                <HiFolder size={16} className="text-amber-400" /> Files
              </h2>
              <div className="space-y-2">
                {results.files.map((file) => (
                  <a
                    key={file._id}
                    href={file.url}
                    target="_blank"
                    rel="noreferrer"
                    className="block bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 hover:border-amber-500/40 transition"
                  >
                    <div className="font-medium text-white">{file.title}</div>
                    <div className="text-xs text-gray-500 mt-0.5 uppercase">{file.format}</div>
                  </a>
                ))}
              </div>
            </div>
          )}

          {total === 0 && !loading && (
            <div className="text-center py-16">
              <HiSearch size={40} className="mx-auto text-gray-700 mb-3" />
              <p className="text-gray-500">No results found</p>
            </div>
          )}
        </div>
      )}

      {!results && !loading && (
        <div className="text-center py-20">
          <HiSearch size={48} className="mx-auto text-gray-700 mb-4" />
          <p className="text-gray-500">Start typing to search your vault</p>
        </div>
      )}

      {preview && (
        <PreviewModal item={preview} type={previewType} onClose={() => setPreview(null)} />
      )}
    </div>
  );
}
