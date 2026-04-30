import { useState, useMemo, useEffect } from 'react'
import { useStore } from '../../store/useStore'
import { Settings, Plus, Search, Check, Upload, FileText, X, Pencil, MessageCircle, Folder, Archive, ArchiveRestore, Trash2 } from 'lucide-react'
import { ChatMenu } from '../shared/ChatMenu'
import type { ProjectFile } from '../../types'

const PROJECT_COLORS = [
  { value: '#64748b' }, { value: '#ef4444' }, { value: '#f97316' }, { value: '#f59e0b' },
  { value: '#22c55e' }, { value: '#10b981' }, { value: '#14b8a6' }, { value: '#06b6d4' },
  { value: '#0ea5e9' }, { value: '#3b82f6' }, { value: '#6366f1' }, { value: '#8b5cf6' },
  { value: '#a855f7' }, { value: '#d946ef' }, { value: '#ec4899' }, { value: '#f43f5e' },
]

const PROJECT_ICONS = ['Folder', 'Briefcase', 'Code', 'Rocket', 'Lightbulb', 'Star', 'Heart', 'Target', 'Globe', 'BookOpen', 'Palette', 'Zap']

export function ProjectDetailView() {
  const {
    projects,
    activeProjectId,
    chats,
    setActiveView,
    setActiveChatId,
    updateChat,
    removeChat,
    toggleSaved,
    updateProjectInstructions,
    removeProjectFile,
    addProjectFile,
    setActiveProjectId,
    updateProject,
    archiveProject,
    unarchiveProject,
    removeProject,
  } = useStore()

  const project = projects.find((p) => p.id === activeProjectId)
  const [searchQuery, setSearchQuery] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')
  const [editingInstructions, setEditingInstructions] = useState(false)
  const [instructionsText, setInstructionsText] = useState('')
  const [showSettings, setShowSettings] = useState(false)
  const [settingsName, setSettingsName] = useState('')
  const [settingsDesc, setSettingsDesc] = useState('')
  const [settingsColor, setSettingsColor] = useState('')
  const [settingsIcon, setSettingsIcon] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(false)

  useEffect(() => {
    if (showSettings && project) {
      setSettingsName(project.name)
      setSettingsDesc(project.description)
      setSettingsColor(project.color)
      setSettingsIcon(project.icon)
      setConfirmDelete(false)
    }
  }, [showSettings, project])

  const formatDate = (timestamp: number) => {
    const now = Date.now()
    const diff = now - timestamp
    const dayMs = 24 * 60 * 60 * 1000
    if (diff < dayMs) {
      return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } else if (diff < 2 * dayMs) {
      return 'Yesterday'
    } else if (diff < 7 * dayMs) {
      return new Date(timestamp).toLocaleDateString([], { weekday: 'short' })
    } else {
      return new Date(timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })
    }
  }

  const projectChats = useMemo(() => {
    if (!project) return []
    return chats.filter((c) => project.chatIds.includes(c.id))
  }, [project, chats])

  const filteredChats = useMemo(() => {
    if (!searchQuery) return projectChats
    const q = searchQuery.toLowerCase()
    return projectChats.filter((c) => c.title?.toLowerCase().includes(q))
  }, [projectChats, searchQuery])

  const sortedChats = useMemo(() =>
    [...filteredChats].sort((a, b) => b.updatedAt - a.updatedAt)
  , [filteredChats])

  const handleChatClick = (chatId: string) => {
    setActiveChatId(chatId)
    setActiveView('chat')
  }

  const handleNewChat = () => {
    if (!project) return
    setActiveProjectId(project.id)
    setActiveView('home')
  }

  const handleDelete = (chatId: string) => {
    removeChat(chatId)
  }

  const handleStar = (chatId: string) => {
    toggleSaved(chatId)
  }

  const handleRename = (chat: { id: string; title: string }) => {
    setEditingId(chat.id)
    setEditingName(chat.title || '')
  }

  const handleRenameSubmit = (chatId: string) => {
    if (editingName.trim()) {
      updateChat(chatId, { title: editingName.trim() })
    }
    setEditingId(null)
  }

  const handleRenameKeyDown = (e: React.KeyboardEvent, chatId: string) => {
    if (e.key === 'Enter') {
      handleRenameSubmit(chatId)
    } else if (e.key === 'Escape') {
      setEditingId(null)
    }
  }

  const handleInstructionsSave = () => {
    if (project) {
      updateProjectInstructions(project.id, instructionsText)
    }
    setEditingInstructions(false)
  }

  const handleEditInstructions = () => {
    if (project) {
      setInstructionsText(project.customInstructions)
      setEditingInstructions(true)
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!project || !e.target.files?.length) return
    const file = e.target.files[0]
    const arrayBuffer = await file.arrayBuffer()
    const bytes = new Uint8Array(arrayBuffer)

    try {
      const { invoke } = await import('@tauri-apps/api/core')
      const path: string = await invoke('save_project_file', {
        projectId: project.id,
        fileName: file.name,
        fileData: Array.from(bytes),
      })

      const projectFile: ProjectFile = {
        id: crypto.randomUUID(),
        name: file.name,
        path,
        type: file.type || 'application/octet-stream',
        size: file.size,
        addedAt: Date.now(),
      }
      addProjectFile(project.id, projectFile)
    } catch (err) {
      console.error('[Byte] File upload failed:', err)
    }
  }

  const handleFileDelete = (file: ProjectFile) => {
    if (!project) return
    try {
      import('@tauri-apps/api/core').then(({ invoke }) => {
        invoke('delete_project_file', {
          projectId: project.id,
          fileName: file.name,
        }).catch(() => {})
      })
    } catch {}
    removeProjectFile(project.id, file.id)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const handleSettingsSave = () => {
    if (!project || !settingsName.trim()) return
    updateProject(project.id, {
      name: settingsName.trim(),
      description: settingsDesc.trim(),
      color: settingsColor,
      icon: settingsIcon,
    })
    setShowSettings(false)
  }

  const handleArchiveToggle = () => {
    if (!project) return
    if (project.status === 'active') {
      archiveProject(project.id)
    } else {
      unarchiveProject(project.id)
    }
    setShowSettings(false)
  }

  const handleDeleteProject = () => {
    if (!project) return
    removeProject(project.id)
    setActiveProjectId(null)
    setActiveView('projects')
  }

  if (!project) {
    return (
      <div className="view on" style={{ flexDirection: 'column' }}>
        <div className="home-stage">
          <div className="home-name">Project not found</div>
        </div>
      </div>
    )
  }

  return (
    <div className="view on" style={{ flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ padding: '20px 24px 0', maxWidth: 1200, margin: '0 auto', width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <span
              style={{
                width: 42,
                height: 42,
                borderRadius: 10,
                backgroundColor: project.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <FileText size={22} color="white" strokeWidth={2} />
            </span>
            <div>
              <div style={{ fontSize: 'calc(var(--fs) + 6px)', fontWeight: 600, color: 'var(--tx)' }}>{project.name}</div>
              {project.description && (
                <div style={{ fontSize: 'calc(var(--fs) - 1px)', color: 'var(--tx3)', marginTop: 2 }}>{project.description}</div>
              )}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button className="btn btn-sm" onClick={handleNewChat} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <Plus size={11} />
              New chat
            </button>
            <button
              className="btn btn-sm"
              onClick={() => setShowSettings(true)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
            >
              <Settings size={11} />
              Settings
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div style={{ flex: 1, display: 'flex', gap: 20, maxWidth: 1200, margin: '0 auto', width: '100%', padding: '0 24px 24px', overflow: 'hidden' }}>
        {/* Left: Chat list */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'var(--sf)', border: '1px solid var(--bd)', borderRadius: 'var(--r-lg)', padding: '10px 16px', marginBottom: 12 }}>
            <Search size={13} style={{ color: 'var(--tx3)' }} />
            <input
              type="text"
              placeholder="Search chats in this project…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', fontSize: 'var(--fs)', color: 'var(--tx)', fontFamily: 'var(--font)' }}
            />
          </div>

          <div style={{ flex: 1, overflow: 'auto' }}>
            {sortedChats.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--tx4)' }}>
                <div style={{ marginBottom: 12 }}><MessageCircle size={28} /></div>
                No chats in this project yet.
              </div>
            ) : (
              sortedChats.map((chat) => (
                <div
                  key={chat.id}
                  className="chat-list-item"
                  onClick={() => handleChatClick(chat.id)}
                >
                  <div className="cli-content" style={{ flex: 1, minWidth: 0 }}>
                    {editingId === chat.id ? (
                      <input
                        type="text"
                        className="cli-edit-input"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        onBlur={() => handleRenameSubmit(chat.id)}
                        onKeyDown={(e) => handleRenameKeyDown(e, chat.id)}
                        onClick={(e) => e.stopPropagation()}
                        autoFocus
                      />
                    ) : (
                      <>
                        <div className="cli-title">{chat.title || 'New chat'}</div>
                        <div className="cli-meta">
                          {chat.messages.length > 0
                            ? chat.messages[0].content.split('\n')[0].slice(0, 45) + '...'
                            : 'No messages'}
                          {' · '}
                          {formatDate(chat.updatedAt)}
                        </div>
                      </>
                    )}
                  </div>
                  <ChatMenu
                    onStar={() => handleStar(chat.id)}
                    onRename={() => handleRename(chat)}
                    onDelete={() => handleDelete(chat.id)}
                    isSaved={chat.saved}
                  />
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right: Instructions + Files */}
        <div style={{ width: 320, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 16, overflow: 'hidden' }}>
          <div style={{ background: 'var(--sf)', border: '1px solid var(--bd)', borderRadius: 'var(--r-lg)', padding: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <div style={{ fontSize: 'calc(var(--fs) - 1px)', fontWeight: 600, color: 'var(--tx2)' }}>Custom Instructions</div>
              {!editingInstructions && (
                <button className="btn btn-sm" onClick={handleEditInstructions} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  <Pencil size={10} />
                  Edit
                </button>
              )}
            </div>
            {editingInstructions ? (
              <div>
                <textarea
                  value={instructionsText}
                  onChange={(e) => setInstructionsText(e.target.value)}
                  placeholder="How should the AI behave in this project?"
                  style={{
                    width: '100%',
                    minHeight: 120,
                    background: 'var(--sf2)',
                    border: '1px solid var(--bd)',
                    borderRadius: 'var(--r-sm)',
                    padding: 10,
                    fontSize: 'var(--fs)',
                    color: 'var(--tx)',
                    fontFamily: 'var(--font)',
                    resize: 'vertical',
                    outline: 'none',
                  }}
                />
                <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                  <button className="btn btn-sm" onClick={handleInstructionsSave} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    <Check size={10} />
                    Save
                  </button>
                  <button className="btn btn-sm" onClick={() => setEditingInstructions(false)} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    <X size={10} />
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ fontSize: 'var(--fs)', color: project.customInstructions ? 'var(--tx)' : 'var(--tx4)', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
                {project.customInstructions || 'No custom instructions set. Click Edit to add some.'}
              </div>
            )}
          </div>

          <div style={{ flex: 1, background: 'var(--sf)', border: '1px solid var(--bd)', borderRadius: 'var(--r-lg)', padding: 16, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <div style={{ fontSize: 'calc(var(--fs) - 1px)', fontWeight: 600, color: 'var(--tx2)' }}>Files</div>
              <label className="btn btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}>
                <Upload size={10} />
                Upload
                <input
                  type="file"
                  onChange={handleFileUpload}
                  style={{ display: 'none' }}
                />
              </label>
            </div>
            <div style={{ flex: 1, overflow: 'auto' }}>
              {project.files.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '30px 10px', color: 'var(--tx4)', fontSize: 'calc(var(--fs) - 1px)' }}>
                  No files uploaded yet.
                </div>
              ) : (
                project.files.map((file) => (
                  <div
                    key={file.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '8px 10px',
                      borderRadius: 'var(--r-sm)',
                      marginBottom: 4,
                    }}
                  >
                    <FileText size={14} style={{ color: 'var(--tx3)', flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 'var(--fs)', color: 'var(--tx)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file.name}</div>
                      <div style={{ fontSize: 'calc(var(--fs) - 2px)', color: 'var(--tx4)' }}>{formatFileSize(file.size)}</div>
                    </div>
                    <button
                      onClick={() => handleFileDelete(file)}
                      style={{ background: 'none', border: 'none', color: 'var(--tx4)', cursor: 'pointer', padding: 2 }}
                      title="Remove file"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="modal-overlay" onClick={() => setShowSettings(false)}>
          <div className="modal modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Project Settings</h3>
              <button className="modal-close" onClick={() => setShowSettings(false)}>
                <X size={18} />
              </button>
            </div>

            <div className="form-group">
              <label>Name</label>
              <input
                type="text"
                className="modal-input"
                placeholder="Project name"
                value={settingsName}
                onChange={(e) => setSettingsName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                className="modal-textarea"
                placeholder="What is this project about?"
                value={settingsDesc}
                onChange={(e) => setSettingsDesc(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Color</label>
              <div className="proj-color-grid">
                {PROJECT_COLORS.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    className={`proj-color-option ${settingsColor === c.value ? 'selected' : ''}`}
                    style={{ backgroundColor: c.value }}
                    onClick={() => setSettingsColor(c.value)}
                  >
                    {settingsColor === c.value && <Check size={14} color="white" />}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label>Icon</label>
              <div className="proj-icon-grid">
                {PROJECT_ICONS.map((name) => (
                  <button
                    key={name}
                    type="button"
                    className={`proj-icon-option ${settingsIcon === name ? 'selected' : ''}`}
                    onClick={() => setSettingsIcon(name)}
                    title={name}
                  >
                    <Folder size={20} />
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 20 }}>
              <button className="modal-btn primary" onClick={handleSettingsSave} disabled={!settingsName.trim()}>
                Save Changes
              </button>
              <button className="modal-btn secondary" onClick={() => setShowSettings(false)}>
                Cancel
              </button>
            </div>

            <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid var(--bd)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <button
                  className="btn btn-sm"
                  onClick={handleArchiveToggle}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}
                >
                  {project.status === 'active' ? <Archive size={11} /> : <ArchiveRestore size={11} />}
                  {project.status === 'active' ? 'Archive Project' : 'Unarchive Project'}
                </button>

                {confirmDelete ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 'calc(var(--fs) - 1px)', color: 'var(--tx3)' }}>Delete this project and remove all associations?</span>
                    <button
                      className="btn btn-sm"
                      onClick={handleDeleteProject}
                      style={{ color: 'var(--danger-fill)', borderColor: 'var(--danger-border)' }}
                    >
                      Confirm Delete
                    </button>
                    <button className="btn btn-sm" onClick={() => setConfirmDelete(false)}>
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    className="btn btn-sm"
                    onClick={() => setConfirmDelete(true)}
                    style={{ color: 'var(--danger-fill)', borderColor: 'var(--danger-border)', display: 'inline-flex', alignItems: 'center', gap: 5 }}
                  >
                    <Trash2 size={11} />
                    Delete Project
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
