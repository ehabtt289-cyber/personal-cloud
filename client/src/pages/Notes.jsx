import { useEffect, useState } from "react";
import api from "../api/axios";
import toast from "react-hot-toast";
import NoteEditor from "../components/NoteEditor";
import { HiPlus, HiPencil, HiTrash, HiBookmark, HiSearch, HiDocumentText } from "react-icons/hi";

function NoteCard({ note, onEdit, onDelete, onPin }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-indigo-500/40 transition-all group relative animate-fadeIn">
      {note.pinned && (
        <div className="absolute top-3 right-3 text-indigo-400">
          <HiBookmark size={16} />
        </div>
      )}
      <h3 className="font-semibold text-white truncate mb-2 pr-6">{note.title}</h3>
      <div
        className="text-sm text-gray-400 line-clamp-3 mb-3"
        dangerouslySetInnerHTML={{ __html: note.content?.replace(/<[^>]*>/g, "") || "Empty note" }}
      />
      {note.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {note.tags.map((t) => (
            <span key={t} className="px-2 py-0.5 bg-gray-800 text-gray-400 rounded text-xs">#{t}</span>
          ))}
        </div>
      )}
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-600">{new Date(note.updatedAt).toLocaleDateString()}</span>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => onPin(note)} className={`p-1.5 rounded-lg hover:bg-gray-800 transition ${note.pinned ? "text-indigo-400" : "text-gray-500 hover:text-gray-300"}`}>
            <HiBookmark size={15} />
          </button>
          <button onClick={() => onEdit(note)} className="p-1.5 rounded-lg hover:bg-gray-800 text-gray-500 hover:text-indigo-400 transition">
            <HiPencil size={15} />
          </button>
          <button onClick={() => onDelete(note._id)} className="p-1.5 rounded-lg hover:bg-gray-800 text-gray-500 hover:text-red-400 transition">
            <HiTrash size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Notes() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editorNote, setEditorNote] = useState(null);
  const [showEditor, setShowEditor] = useState(false);
  const [search, setSearch] = useState("");

  const fetchNotes = async () => {
    try {
      const { data } = await api.get("/notes");
      setNotes(data);
    } catch {
      toast.error("Failed to load notes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchNotes(); }, []);

  const handleDelete = async (id) => {
    if (!confirm("Delete this note?")) return;
    try {
      await api.delete(`/notes/${id}`);
      toast.success("Note deleted");
      setNotes((prev) => prev.filter((n) => n._id !== id));
    } catch {
      toast.error("Failed to delete");
    }
  };

  const handlePin = async (note) => {
    try {
      const { data } = await api.put(`/notes/${note._id}`, { ...note, pinned: !note.pinned });
      setNotes((prev) => prev.map((n) => (n._id === data._id ? data : n)));
    } catch {
      toast.error("Failed to update");
    }
  };

  const handleEdit = (note) => {
    setEditorNote(note);
    setShowEditor(true);
  };

  const filtered = notes.filter(
    (n) =>
      n.title.toLowerCase().includes(search.toLowerCase()) ||
      n.content?.toLowerCase().includes(search.toLowerCase()) ||
      n.tags?.some((t) => t.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="animate-fadeIn max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Notes</h1>
          <p className="text-gray-400 text-sm mt-1">{notes.length} notes</p>
        </div>
        <button
          onClick={() => { setEditorNote(null); setShowEditor(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-xl transition shadow-lg shadow-indigo-500/20"
        >
          <HiPlus size={18} /> New Note
        </button>
      </div>

      <div className="relative mb-6">
        <HiSearch size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search notes..."
          className="w-full bg-gray-900 border border-gray-800 rounded-xl pl-10 pr-4 py-2.5 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <HiDocumentText size={48} className="mx-auto text-gray-700 mb-4" />
          <p className="text-gray-500 text-lg">No notes yet</p>
          <p className="text-gray-600 text-sm mt-1">Create your first note to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((note) => (
            <NoteCard
              key={note._id}
              note={note}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onPin={handlePin}
            />
          ))}
        </div>
      )}

      {showEditor && (
        <NoteEditor
          note={editorNote}
          onClose={() => setShowEditor(false)}
          onSaved={() => { setShowEditor(false); fetchNotes(); }}
        />
      )}
    </div>
  );
}
