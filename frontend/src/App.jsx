
import { useCallback, useEffect, useState } from "react";
import Recorder from "./components/Recorder";
import {
  Activity,
  AudioLines,
  Clock3,
  FileText,
  Headphones,
  LoaderCircle,
  Mic,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  Pencil,
  Check,
  X,
} from "lucide-react";

import {
  getTranscriptions,
  createTranscription,
  updateTranscription,
  deleteTranscription,
} from "./services/api";

import "./App.css";

function App() {
  const [records, setRecords] = useState([]);
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [language, setLanguage] = useState("Auto-detected");
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadRecords = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = await getTranscriptions();
      setRecords(Array.isArray(data) ? data : data.results || []);
    } catch {
      setError(
        ""
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRecords();
  }, [loadRecords]);

  async function handleSave(event) {
    event.preventDefault();
    if (!text.trim()) {
      setError("Enter some transcription text before saving.");
      return;
    }

    setSaving(true);
    setError("");
    setNotice("");

    const payload = {
      title: title.trim() || "Untitled Transcription",
      text: text.trim(),
      language,
    };

    try {
      if (editingId !== null) {
        await updateTranscription(editingId, payload);
        setNotice("Transcription updated successfully.");
      } else {
        await createTranscription(payload);
        setNotice("Transcription saved successfully.");
      }

      setTitle("");
      setText("");
      setLanguage("Auto-detected");
      setEditingId(null);
      await loadRecords();
    } catch (err) {
      setError(`Unable to save transcription. ${err.message}`);
    } finally {
      setSaving(false);
    }
  }

  function handleEdit(record) {
    setEditingId(record.id);
    setTitle(record.title);
    setText(record.text);
    setLanguage(record.language || "Auto-detected");
    setError("");
    setNotice("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleCancelEdit() {
    setEditingId(null);
    setTitle("");
    setText("");
    setLanguage("Auto-detected");
    setError("");
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this transcription permanently?")) return;

    setError("");
    setNotice("");

    try {
      await deleteTranscription(id);

      if (editingId === id) handleCancelEdit();

      setNotice("Transcription deleted.");
      await loadRecords();
    } catch (err) {
      setError(`Unable to delete transcription. ${err.message}`);
    }
  }

  const filteredRecords = records.filter((record) =>
    `${record.title} ${record.text} ${record.language}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="#home">
          <span className="brand-icon">
            <AudioLines size={23} />
          </span>
          <span>
            <strong>VoxNote</strong>
            <small>Speech workspace</small>
          </span>
        </a>

        <div className="nav-label">WORKSPACE</div>
        <a className="nav-item active" href="#home">
          <Activity size={18} />
          Overview
        </a>
        <a className="nav-item" href="#recorder">
          <Mic size={18} />
          Transcribe
        </a>
        <a className="nav-item" href="#history">
          <FileText size={18} />
          My transcripts
        </a>

        <div className="sidebar-bottom">
          <div className="status-dot" />
          <div>
            <strong>Local workspace</strong>
            
          </div>
        </div>
      </aside>

      <main className="main-content" id="home">
        <header className="topbar">
          <div>
            <div className="eyebrow">YOUR PERSONAL WORKSPACE</div>
            <h1>Speech studio</h1>
            <p>Turn conversations into searchable text.</p>
          </div>
          <button className="refresh-button" onClick={loadRecords}>
            <RefreshCw size={16} />
            Refresh
          </button>
        </header>

        {error && (
          <div className="message error-message" role="alert">
            {error}
            <button onClick={() => setError("")} aria-label="Dismiss error">
              <X size={16} />
            </button>
          </div>
        )}

        {notice && (
          <div className="message success-message" role="status">
            {notice}
            <button onClick={() => setNotice("")} aria-label="Dismiss message">
              <X size={16} />
            </button>
          </div>
        )}

        <section className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon purple">
              <FileText size={20} />
            </div>
            <span>Total transcripts</span>
            <strong>{records.length}</strong>
            <small>Saved in your database</small>
          </div>

          <div className="stat-card">
            <div className="stat-icon blue">
              <Clock3 size={20} />
            </div>
            <span>Recently updated</span>
            <strong>
              {records.filter((r) => r.updated_at).length}
            </strong>
            <small>Records with update timestamps</small>
          </div>

          <div className="stat-card">
            <div className="stat-icon green">
              <Headphones size={20} />
            </div>
            <span>Language Support</span>
            <strong className="engine-label">Multilingual</strong>
            <small>Designed for diverse languages</small>
          </div>
        </section>

        <section className="workspace-grid">
          <div className="panel recorder-panel" id="recorder">
            <div className="panel-heading">
              <div>
                <div className="eyebrow">TRANSCRIPTION EDITOR</div>
                <h2>
                  {editingId !== null ? "Edit transcript" : "New transcript"}
                </h2>
              </div>
              <span className="draft-badge">
                <span />
                Text editor
              </span>
            </div>

            <Recorder onTranscript={setText} />

            <form onSubmit={handleSave} className="transcript-form">
              <label htmlFor="title">Transcript title</label>
              <input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Meeting notes"
                maxLength={200}
              />

              <div className="field-row">
                <label htmlFor="language">Language</label>
                <select
                  id="language"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                >
                  <option>Auto-detected</option>
                  <option>English</option>
                  <option>Hindi</option>
                  <option>Kannada</option>
                  <option>Hindi + English</option>
                  <option>Kannada + English</option>
                  <option>Other / Mixed</option>
                </select>
              </div>

              <label htmlFor="transcript-text">Transcript text</label>
              <textarea
                id="transcript-text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Enter some text to test the transcription workflow..."
                rows={7}
              />

              <div className="editor-footer">
                <span>{text.length} characters</span>
                <div className="editor-actions">
                  {editingId !== null && (
                    <button
                      type="button"
                      className="secondary-button"
                      onClick={handleCancelEdit}
                    >
                      Cancel
                    </button>
                  )}
                  <button
                    type="submit"
                    className="primary-button"
                    disabled={saving}
                  >
                    {saving ? (
                      <LoaderCircle className="spin" size={17} />
                    ) : editingId !== null ? (
                      <Check size={17} />
                    ) : (
                      <Plus size={17} />
                    )}
                    {saving
                      ? "Saving..."
                      : editingId !== null
                        ? "Update transcript"
                        : "Save transcript"}
                  </button>
                </div>
              </div>
            </form>
          </div>

          <div className="panel history-panel" id="history">
            <div className="panel-heading history-heading">
              <div>
                <div className="eyebrow">YOUR LIBRARY</div>
                <h2>Transcript history</h2>
              </div>
              <span className="count-badge">{records.length}</span>
            </div>

            <div className="search-box">
              <Search size={17} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search transcripts..."
                aria-label="Search transcripts"
              />
            </div>

            {loading ? (
              <div className="empty-state">
                <LoaderCircle className="spin" size={27} />
                <p>Loading your transcripts...</p>
              </div>
            ) : filteredRecords.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">
                  <FileText size={26} />
                </div>
                <strong>
                  {search ? "No matching transcripts" : "Nothing here yet"}
                </strong>
                <p>
                  {search
                    ? "Try another search term."
                    : "Save your first transcript using the editor."}
                </p>
              </div>
            ) : (
              <div className="transcript-list">
                {filteredRecords.map((record) => (
                  <article className="transcript-item" key={record.id}>
                    <div className="item-icon">
                      <FileText size={19} />
                    </div>
                    <div className="item-content">
                      <h3>{record.title}</h3>
                      <p className="item-preview">{record.text}</p>
                      <div className="item-meta">
                        <span>{record.language}</span>
                        <span>
                          {record.created_at
                            ? new Date(record.created_at).toLocaleDateString()
                            : "Saved"}
                        </span>
                      </div>
                    </div>
                    <div className="item-actions">
                      <button
                        onClick={() => handleEdit(record)}
                        aria-label={`Edit ${record.title}`}
                        title="Edit"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        className="delete-action"
                        onClick={() => handleDelete(record.id)}
                        aria-label={`Delete ${record.title}`}
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>

        <footer className="app-footer">
          <span>VoxNote · Real-time multilingual transcription</span>
         
        </footer>
      </main>
    </div>
  );
}

export default App;
