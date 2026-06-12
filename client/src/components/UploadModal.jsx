import { useState, useRef } from "react";
import { HiUpload, HiX, HiCloudUpload } from "react-icons/hi";
import api from "../api/axios";
import toast from "react-hot-toast";

export default function UploadModal({ type, onClose, onSuccess }) {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");
  const [tags, setTags] = useState("");
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const inputRef = useRef();

  const acceptMap = {
    image: "image/*",
    video: "video/*",
    file: ".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.rar",
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) { setFile(dropped); setTitle(dropped.name.split(".").slice(0, -1).join(".")); }
  };

  const handleFile = (e) => {
    const f = e.target.files[0];
    if (f) { setFile(f); setTitle(f.name.split(".").slice(0, -1).join(".")); }
  };

  const handleUpload = async () => {
    if (!file) return toast.error("Please select a file");
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", title || file.name);
    formData.append("tags", tags);
    try {
      const endpoint = type === "file" ? "/files/upload" : "/media/upload";
      await api.post(endpoint, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (e) => setProgress(Math.round((e.loaded * 100) / e.total)),
      });
      toast.success("Uploaded successfully!");
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.error || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-gray-900 rounded-2xl border border-gray-700 w-full max-w-md shadow-2xl animate-fadeIn">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
          <h2 className="text-lg font-semibold text-white capitalize">Upload {type}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <HiX size={20} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => inputRef.current.click()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
              dragging ? "border-indigo-500 bg-indigo-500/10" : "border-gray-700 hover:border-gray-500"
            }`}
          >
            <input ref={inputRef} type="file" accept={acceptMap[type]} className="hidden" onChange={handleFile} />
            <HiCloudUpload size={36} className="mx-auto mb-3 text-gray-500" />
            {file ? (
              <p className="text-sm text-indigo-400 font-medium">{file.name}</p>
            ) : (
              <>
                <p className="text-sm text-gray-300">Drag & drop or click to select</p>
                <p className="text-xs text-gray-500 mt-1">Max 100MB</p>
              </>
            )}
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter a title..."
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Tags (comma separated)</label>
            <input
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="work, personal, 2024..."
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {uploading && (
            <div>
              <div className="flex justify-between text-xs text-gray-400 mb-1">
                <span>Uploading...</span>
                <span>{progress}%</span>
              </div>
              <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-500 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button onClick={onClose} className="flex-1 py-2 rounded-lg border border-gray-700 text-gray-300 hover:bg-gray-800 text-sm transition">
              Cancel
            </button>
            <button
              onClick={handleUpload}
              disabled={uploading || !file}
              className="flex-1 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-medium transition flex items-center justify-center gap-2"
            >
              <HiUpload size={16} /> Upload
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
