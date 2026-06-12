import { useEffect, useState } from "react";
import api from "../api/axios";
import toast from "react-hot-toast";
import UploadModal from "../components/UploadModal";
import PreviewModal from "../components/PreviewModal";
import { HiPlus, HiTrash, HiPhotograph, HiEye } from "react-icons/hi";

export default function Images() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [preview, setPreview] = useState(null);

  const fetchImages = async () => {
    try {
      const { data } = await api.get("/media?type=image");
      setImages(data);
    } catch {
      toast.error("Failed to load images");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchImages(); }, []);

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!confirm("Delete this image?")) return;
    try {
      await api.delete(`/media/${id}`);
      toast.success("Image deleted");
      setImages((prev) => prev.filter((i) => i._id !== id));
    } catch {
      toast.error("Failed to delete");
    }
  };

  return (
    <div className="animate-fadeIn max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Images</h1>
          <p className="text-gray-400 text-sm mt-1">{images.length} images</p>
        </div>
        <button
          onClick={() => setShowUpload(true)}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium rounded-xl transition shadow-lg shadow-emerald-500/20"
        >
          <HiPlus size={18} /> Upload Image
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : images.length === 0 ? (
        <div className="text-center py-20">
          <HiPhotograph size={48} className="mx-auto text-gray-700 mb-4" />
          <p className="text-gray-500 text-lg">No images yet</p>
          <p className="text-gray-600 text-sm mt-1">Upload your first image to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {images.map((img) => (
            <div
              key={img._id}
              onClick={() => setPreview(img)}
              className="group relative aspect-square rounded-xl overflow-hidden bg-gray-800 border border-gray-700 hover:border-emerald-500/50 cursor-pointer transition-all"
            >
              <img src={img.url} alt={img.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all flex items-center justify-center">
                <HiEye size={28} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <button
                onClick={(e) => handleDelete(img._id, e)}
                className="absolute top-2 right-2 p-1.5 rounded-lg bg-red-600 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
              >
                <HiTrash size={14} />
              </button>
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="text-white text-xs font-medium truncate">{img.title}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {showUpload && (
        <UploadModal type="image" onClose={() => setShowUpload(false)} onSuccess={fetchImages} />
      )}
      {preview && (
        <PreviewModal item={preview} type="image" onClose={() => setPreview(null)} />
      )}
    </div>
  );
}
