import { useEffect, useState } from "react";
import api from "../api/axios";
import toast from "react-hot-toast";
import UploadModal from "../components/UploadModal";
import PreviewModal from "../components/PreviewModal";
import { HiPlus, HiTrash, HiFilm, HiPlay } from "react-icons/hi";

function formatBytes(bytes) {
  if (!bytes) return "";
  const mb = bytes / (1024 * 1024);
  return mb >= 1 ? `${mb.toFixed(1)} MB` : `${(bytes / 1024).toFixed(0)} KB`;
}

export default function Videos() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [preview, setPreview] = useState(null);

  const fetchVideos = async () => {
    try {
      const { data } = await api.get("/media?type=video");
      setVideos(data);
    } catch {
      toast.error("Failed to load videos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchVideos(); }, []);

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!confirm("Delete this video?")) return;
    try {
      await api.delete(`/media/${id}`);
      toast.success("Video deleted");
      setVideos((prev) => prev.filter((v) => v._id !== id));
    } catch {
      toast.error("Failed to delete");
    }
  };

  return (
    <div className="animate-fadeIn max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Videos</h1>
          <p className="text-gray-400 text-sm mt-1">{videos.length} videos</p>
        </div>
        <button
          onClick={() => setShowUpload(true)}
          className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium rounded-xl transition shadow-lg shadow-violet-500/20"
        >
          <HiPlus size={18} /> Upload Video
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : videos.length === 0 ? (
        <div className="text-center py-20">
          <HiFilm size={48} className="mx-auto text-gray-700 mb-4" />
          <p className="text-gray-500 text-lg">No videos yet</p>
          <p className="text-gray-600 text-sm mt-1">Upload your first video to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {videos.map((vid) => (
            <div
              key={vid._id}
              onClick={() => setPreview(vid)}
              className="group bg-gray-900 border border-gray-800 rounded-xl overflow-hidden hover:border-violet-500/50 cursor-pointer transition-all animate-fadeIn"
            >
              <div className="relative aspect-video bg-gray-800 flex items-center justify-center">
                <div className="w-14 h-14 rounded-full bg-violet-600/80 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <HiPlay size={28} className="text-white ml-1" />
                </div>
                <button
                  onClick={(e) => handleDelete(vid._id, e)}
                  className="absolute top-2 right-2 p-1.5 rounded-lg bg-red-600 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
                >
                  <HiTrash size={14} />
                </button>
              </div>
              <div className="p-4">
                <h3 className="font-medium text-white truncate">{vid.title}</h3>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs text-gray-500">{formatBytes(vid.size)}</span>
                  <span className="text-xs text-gray-500">{new Date(vid.createdAt).toLocaleDateString()}</span>
                </div>
                {vid.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {vid.tags.map((t) => (
                      <span key={t} className="px-1.5 py-0.5 bg-gray-800 text-gray-400 rounded text-xs">#{t}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showUpload && (
        <UploadModal type="video" onClose={() => setShowUpload(false)} onSuccess={fetchVideos} />
      )}
      {preview && (
        <PreviewModal item={preview} type="video" onClose={() => setPreview(null)} />
      )}
    </div>
  );
}
