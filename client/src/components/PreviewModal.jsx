import { HiX, HiDownload, HiExternalLink } from "react-icons/hi";

export default function PreviewModal({ item, type, onClose }) {
  if (!item) return null;

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="relative max-w-4xl w-full max-h-[90vh] animate-fadeIn" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-white font-medium truncate pr-8">{item.title}</h3>
          <div className="flex items-center gap-2 shrink-0">
            <a
              href={item.url}
              download
              target="_blank"
              rel="noreferrer"
              className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white transition"
            >
              <HiDownload size={18} />
            </a>
            <a
              href={item.url}
              target="_blank"
              rel="noreferrer"
              className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white transition"
            >
              <HiExternalLink size={18} />
            </a>
            <button onClick={onClose} className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white transition">
              <HiX size={18} />
            </button>
          </div>
        </div>

        <div className="bg-gray-900 rounded-2xl overflow-hidden border border-gray-700 flex items-center justify-center">
          {type === "image" && (
            <img src={item.url} alt={item.title} className="max-h-[75vh] max-w-full object-contain" />
          )}
          {type === "video" && (
            <video controls autoPlay className="max-h-[75vh] max-w-full" src={item.url}>
              Your browser does not support video.
            </video>
          )}
          {type === "file" && (
            <div className="p-12 text-center">
              <div className="text-6xl mb-4">📄</div>
              <p className="text-white font-medium mb-2">{item.title}</p>
              <p className="text-gray-400 text-sm mb-6">{item.format?.toUpperCase()} file</p>
              <a
                href={item.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-medium transition"
              >
                <HiExternalLink size={16} /> Open File
              </a>
            </div>
          )}
        </div>

        {item.tags?.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {item.tags.map((tag) => (
              <span key={tag} className="px-2 py-1 bg-gray-800 text-gray-300 rounded-md text-xs">
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
