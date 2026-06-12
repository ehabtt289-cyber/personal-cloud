import { useState, useEffect, useRef } from "react";
import ReactQuill from "react-quill";
import { HiSave, HiX, HiTag } from "react-icons/hi";
import api from "../api/axios";
import toast from "react-hot-toast";

const modules = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ["bold", "italic", "underline", "strike"],
    [{ list: "ordered" }, { list: "bullet" }],
    ["blockquote", "code-block"],
    ["link"],
    ["clean"],
  ],
};

export default function NoteEditor({ note, onClose, onSaved }) {
  const [title, setTitle] = useState(note?.title || "");
  const [content, setContent] = useState(note?.content || "");
  const [tags, setTags] = useState(note?.tags?.join(", ") || "");
  const [saving, setSaving] = useState(false);
  const titleRef = useRef();

  useEffect(() => {
    titleRef.current?.focus();
  }, []);

  const handleSave = async () => {
    if (!title.trim()) return toast.error("Title is required");
    setSaving(true);
    try {
      const payload = {
        title: title.trim(),
        content,
        tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
      };
      if (note?._id) {
        await api.put(`/notes/${note._id}`, payload);
        toast.success("Note updated");
      } else {
        await api.post("/notes", payload);
        toast.success("Note created");
      }
      onSaved();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-gray-900 rounded-2xl border border-gray-700 w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl animate-fadeIn">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800 shrink-0">
          <input
            ref={titleRef}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Note title..."
            className="flex-1 text-xl font-semibold bg-transparent text-white placeholder-gray-500 focus:outline-none"
          />
          <div className="flex items-center gap-2 ml-4">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition"
            >
              <HiSave size={16} /> {saving ? "Saving..." : "Save"}
            </button>
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition">
              <HiX size={18} />
            </button>
          </div>
        </div>

        <div className="px-6 py-3 border-b border-gray-800 shrink-0">
          <div className="flex items-center gap-2">
            <HiTag size={16} className="text-gray-500" />
            <input
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="Add tags (comma separated)..."
              className="flex-1 text-sm bg-transparent text-gray-300 placeholder-gray-600 focus:outline-none"
            />
          </div>
        </div>

        <div className="flex-1 overflow-hidden p-4">
          <ReactQuill
            theme="snow"
            value={content}
            onChange={setContent}
            modules={modules}
            className="h-full"
          />
        </div>
      </div>
    </div>
  );
}
