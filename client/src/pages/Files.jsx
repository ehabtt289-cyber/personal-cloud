import { useEffect, useState } from "react";
import api from "../api/axios";
import toast from "react-hot-toast";
import UploadModal from "../components/UploadModal";
import PreviewModal from "../components/PreviewModal";
import { HiPlus, HiTrash, HiFolder, HiDownload, HiExternalLink } from "react-icons/hi";

function formatBytes(bytes) {
  if (!bytes) return "";
  const mb = bytes / (1024 * 1024);
  return mb >= 1 ? `${mb.toFixed(1)} MB` : `${(bytes / 1024).toFixed(0)} KB`;
}

const fileIcons = {
  pdf: "📄", doc: "📝", docx: "📝", xls: "📊", xlsx: "📊",
  ppt: "📋", pptx: "📋", txt: "📃", zip: "🗜️", rar: "🗜️",
};

export default function Files() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [preview, setPreview] = useState(null);

  const fetchFiles = async () => {
    try {
      const { data } = await api.get("/files");
      setFiles(data);
    } catch {
      toast.error("Failed to load files");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchFiles(); }, []);

  const handleDelete = async (id) => {
    if (!confirm("Delete this file?")) return;
    try {
      await api.delete(`/files/${id}`);
      toast.success("File deleted");
      setFiles((prev) => prev.filter((f) => f._id !== id));
    } catch {
      toast.error("Failed to delete");
    }
  };

  return (
    <div className="animate-fadeIn max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Files</h1>
          <p className="text-gray-400 text-sm mt-1">{files.length} files</p>
        </div>
        <button
          onClick={() => setShowUpload(true)}
          className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white text-sm font-medium rounded-xl transition shadow-lg shadow-amber-500/20"
        >
          <HiPlus size={18} /> Upload File
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : files.length === 0 ? (
        <div className="text-center py-20">
          <HiFolder size={48} className="mx-auto text-gray-700 mb-4" />
          <p className="text-gray-500 text-lg">No files yet</p>
          <p className="text-gray-600 text-sm mt-1">Upload your first file to get started</p>
        </div>
      ) : (
        <div className="space-y-2">
          {files.map((file) => (
            <div
              key={file._id}
              className="group bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 hover:border-amber-500/40 transition-all flex items-center gap-4 animate-fadeIn"
            >
              <div className="text-2xl shrink-0">
                {fileIcons[file.format?.toLowerCase()] || "📁"}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-white truncate">{file.title}</div>
                <div className="flex items-center gap-3 mt-0.5">
                  <span className="text-xs text-gray-500 uppercase">{file.format}</span>
                  {file.size && <span className="text-xs text-gray-500">{formatBytes(file.size)}</span>}
                  <span className="text-xs text-gray-500">{new Date(file.createdAt).toLocaleDateString()}</span>
                </div>
                {file.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {file.tags.map((t) => (
                      <span key={t} className="px-1.5 py-0.5 bg-gray-800 text-gray-400 rounded text-xs">#{t}</span>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                <a
                  href={file.url}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition"
                >
                  <HiExternalLink size={16} />
                </a>
                <a
                  href={file.url}
                  download
                  className="p-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition"
                >
                  <HiDownload size={16} />
                </a>
                <button
                  onClick={() => handleDelete(file._id)}
                  className="p-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-red-400 transition"
                >
                  <HiTrash size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showUpload && (
        <UploadModal type="file" onClose={() => setShowUpload(false)} onSuccess={fetchFiles} />
      )}
      {preview && (
        <PreviewModal item={preview} type="file" onClose={() => setPreview(null)} />
      )}
    </div>
  );
}
