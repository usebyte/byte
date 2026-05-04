import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { Mic, Send, ChevronDown, Square, Folder, X } from "lucide-react";
import { useStore } from "../../store/useStore";
import { getDisplayName, makeModelKey, resolveModel } from "../../lib/api";
import { PlusMenu } from "./PlusMenu";
import { ModelPicker } from "./ModelPicker";
import { SlashCommandMenu } from "./SlashCommandMenu";
import type { SlashCommand } from "./SlashCommandMenu";
import type { ResponseStyleId, ImageAttachment, ImageMode } from "../../types";

interface InputBoxProps {
  variant: "home" | "chat";
  onSend: (text: string, attachments?: ImageAttachment[]) => void;
  isStreaming?: boolean;
  onStop?: () => void;
  value?: string;
  onChange?: (value: string) => void;
  responseStyle?: ResponseStyleId;
  onStyleChange?: (style: ResponseStyleId) => void;
  memoryEnabled?: boolean;
  onMemoryToggle?: (enabled: boolean) => void;
  webSearchEnabled?: boolean;
  onWebSearchToggle?: (enabled: boolean) => void;
}

export function InputBox({
  variant,
  onSend,
  isStreaming,
  onStop,
  value: externalValue,
  onChange,
  responseStyle = "normal",
  onStyleChange,
  memoryEnabled = false,
  onMemoryToggle,
  webSearchEnabled: extWebSearchEnabled,
  onWebSearchToggle,
}: InputBoxProps) {
  const [internalValue, setInternalValue] = useState("");
  const [isModelPickerOpen, setIsModelPickerOpen] = useState(false);
  const [showSlashMenu, setShowSlashMenu] = useState(false);
  const [slashQuery, setSlashQuery] = useState("");
  const [localWebSearch, setLocalWebSearch] = useState(false);
  const [attachments, setAttachments] = useState<ImageAttachment[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const modelChipRef = useRef<HTMLButtonElement>(null);
  const {
    selectedModelId,
    providers,
    enabledModelIds,
    langSearchApiKey,
    langSearchEnabled,
    projects,
    activeChatId,
    addChatToProject,
    removeChatFromProject,
    activeProjectId,
    setActiveProjectId,
    visionDefaultMode,
    ocrEnabled,
    imageDescriptionModelId,
  } = useStore();

  const effectiveLangSearchApiKey = langSearchEnabled ? langSearchApiKey : "";
  const navigateToConnections = () => {
    useStore.getState().setSettingsSection("connections");
    useStore.getState().setActiveView("settings");
  };

  const text = externalValue !== undefined ? externalValue : internalValue;

  const enabledModels = useMemo(() => {
    return providers.flatMap((p) =>
      p.models.filter((m) =>
        enabledModelIds.includes(makeModelKey(p.id, m.id)),
      ),
    );
  }, [providers, enabledModelIds]);

  const model =
    resolveModel(providers, selectedModelId).model || enabledModels[0];

  const modelCanWebSearch = model?.capabilities?.webSearch ?? false;

  const canOpenPicker = enabledModels.length >= 2;

  const handleTextChange = useCallback(
    (newValue: string) => {
      if (onChange) {
        onChange(newValue);
      } else {
        setInternalValue(newValue);
      }

      if (newValue.startsWith("/") && !newValue.includes(" ")) {
        setShowSlashMenu(true);
        setSlashQuery(newValue.slice(1));
      } else {
        setShowSlashMenu(false);
        setSlashQuery("");
      }
    },
    [onChange],
  );

  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height =
      Math.min(ta.scrollHeight, variant === "home" ? 180 : 140) + "px";
  }, [text, variant]);

  const handleSlashSelect = useCallback(
    (cmd: SlashCommand) => {
      setShowSlashMenu(false);
      setSlashQuery("");
      const insert = cmd.format ?? cmd.command + " ";
      handleTextChange(insert);
      textareaRef.current?.focus();
    },
    [handleTextChange],
  );

  const handleSend = useCallback(() => {
    if ((!text.trim() && attachments.length === 0) || isStreaming) return;
    onSend(text.trim(), attachments.length > 0 ? attachments : undefined);
    handleTextChange("");
    setAttachments([]);
    setShowSlashMenu(false);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  }, [text, attachments, isStreaming, onSend, handleTextChange]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (showSlashMenu) return;

      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [showSlashMenu, handleSend],
  );

  const handleAddFiles = () => {
    fileInputRef.current?.click();
  };

  const processImageFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUri = reader.result as string;

      // Smart default based on visionDefaultMode
      let defaultMode: ImageMode;

      if (visionDefaultMode === "changeable") {
        // Use existing smart logic: vision if model supports it, otherwise OCR
        defaultMode = model?.capabilities?.supportsVision ? "vision" : "ocr";
      } else if (visionDefaultMode === "vision") {
        defaultMode = "vision";
      } else if (visionDefaultMode === "ocr") {
        defaultMode = "ocr";
      } else if (visionDefaultMode === "describe") {
        defaultMode = "describe";
      } else {
        // Fallback
        defaultMode = model?.capabilities?.supportsVision ? "vision" : "ocr";
      }

      const newAttachment: ImageAttachment = {
        id: `${Date.now()}-${Math.random()}`,
        fileName: file.name,
        mimeType: file.type,
        dataUri,
        size: file.size,
        mode: defaultMode,
      };
      setAttachments((prev) => [...prev, newAttachment]);
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const imageFiles = Array.from(files).filter((file) =>
      file.type.startsWith("image/"),
    );

    for (const file of imageFiles) {
      processImageFile(file);
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files).filter((file) =>
      file.type.startsWith("image/"),
    );

    for (const file of files) {
      processImageFile(file);
    }
  };

  const handlePaste = async (e: React.ClipboardEvent) => {
    const items = Array.from(e.clipboardData.items);
    const imageItems = items.filter((item) => item.type.startsWith("image/"));

    if (imageItems.length > 0) {
      e.preventDefault();
      for (const item of imageItems) {
        const file = item.getAsFile();
        if (file) {
          processImageFile(file);
        }
      }
    }
  };

  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  const cycleAttachmentMode = (id: string) => {
    // If visionDefaultMode is not "changeable", don't allow cycling (mode is locked)
    if (visionDefaultMode !== "changeable") {
      return;
    }

    setAttachments((prev) =>
      prev.map((a) => {
        if (a.id !== id) return a;

        // Determine which modes are available
        const availableModes: ImageMode[] = [];

        if (model?.capabilities?.supportsVision) {
          availableModes.push("vision");
        }
        if (ocrEnabled) {
          availableModes.push("ocr");
        }
        if (imageDescriptionModelId) {
          availableModes.push("describe");
        }

        // If no modes available or only one mode, don't cycle
        if (availableModes.length <= 1) return a;

        // Find current mode index and cycle to next available mode
        const currentIndex = availableModes.indexOf(a.mode);
        const nextIndex = (currentIndex + 1) % availableModes.length;
        const newMode = availableModes[nextIndex];

        return { ...a, mode: newMode };
      }),
    );
  };

  const handleScreenshot = () => {};
  const handleSkills = () => {};
  const handleAddConnectors = () => {};
  const handleAddChatToProject = (projectId: string) => {
    if (activeChatId) {
      addChatToProject(projectId, activeChatId);
    } else {
      setActiveProjectId(projectId);
    }
  };
  const handleStyleChange = (style: ResponseStyleId) => {
    onStyleChange?.(style);
  };

  const [isProjectHovered, setIsProjectHovered] = useState(false);

  const activeProject = useMemo(() => {
    if (activeChatId) {
      return projects.find((p) => p.chatIds.includes(activeChatId)) || null;
    }
    if (activeProjectId) {
      return projects.find((p) => p.id === activeProjectId) || null;
    }
    return null;
  }, [activeChatId, activeProjectId, projects]);

  const hasText = text.trim().length > 0;
  const webSearchEnabled =
    extWebSearchEnabled !== undefined ? extWebSearchEnabled : localWebSearch;
  const handleWebSearchToggle = onWebSearchToggle || setLocalWebSearch;

  return (
    <div className={`in-wrap${variant === "home" ? "" : ""}`}>
      <div
        className={`in-box${variant === "home" ? " home-in-box" : ""}${isDragging ? " dragging" : ""}`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        style={{
          border: isDragging ? "2px dashed var(--acc)" : undefined,
          background: isDragging
            ? "rgba(var(--acc-r),var(--acc-g),var(--acc-b),.05)"
            : undefined,
          transition: "border 0.2s, background 0.2s",
        }}
      >
        {/* Attachment thumbnails - moved to top */}
        {attachments.length > 0 && (
          <div
            style={{
              display: "flex",
              gap: 8,
              padding: "8px 0",
              flexWrap: "wrap",
            }}
          >
            {attachments.map((att) => (
              <div
                key={att.id}
                style={{
                  position: "relative",
                  width: 72,
                  height: 72,
                  borderRadius: "var(--r-md)",
                  overflow: "hidden",
                  border: "1px solid var(--bd)",
                  background: "var(--sf2)",
                }}
              >
                <img
                  src={att.dataUri}
                  alt={att.fileName}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />

                {/* Remove button */}
                <button
                  onClick={() => removeAttachment(att.id)}
                  title="Remove image"
                  style={{
                    position: "absolute",
                    top: 4,
                    right: 4,
                    width: 20,
                    height: 20,
                    borderRadius: "50%",
                    background: "rgba(0,0,0,0.7)",
                    border: "1px solid rgba(255,255,255,0.2)",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#fff",
                    padding: 0,
                  }}
                >
                  <X size={12} />
                </button>

                {/* Mode badge - only show if changeable */}
                {visionDefaultMode === "changeable" && (
                  <button
                    onClick={() => cycleAttachmentMode(att.id)}
                    title={`Mode: ${att.mode === "vision" ? "Vision" : att.mode === "ocr" ? "OCR" : "Describe"} (click to cycle)`}
                    style={{
                      position: "absolute",
                      bottom: 4,
                      left: 4,
                      padding: "3px 6px",
                      borderRadius: "var(--r-sm)",
                      background:
                        att.mode === "vision"
                          ? "rgba(59, 130, 246, 0.9)" // Blue
                          : att.mode === "ocr"
                            ? "rgba(34, 197, 94, 0.9)" // Green
                            : "rgba(168, 85, 247, 0.9)", // Purple
                      border: "1px solid rgba(255,255,255,0.2)",
                      cursor: "pointer",
                      fontSize: "10px",
                      fontWeight: 600,
                      color: "#fff",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                    }}
                  >
                    {att.mode === "vision"
                      ? "Vision"
                      : att.mode === "ocr"
                        ? "OCR"
                        : "Describe"}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        <textarea
          ref={textareaRef}
          className={variant === "home" ? "byte-ta" : "small-ta"}
          placeholder={variant === "home" ? "Ask anything…" : "Reply…"}
          value={text}
          onChange={(e) => handleTextChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          rows={variant === "home" ? 3 : 1}
        />
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          style={{ display: "none" }}
          onChange={handleFileChange}
        />
        {showSlashMenu && (
          <SlashCommandMenu
            query={slashQuery}
            anchorRect={textareaRef.current?.getBoundingClientRect() ?? null}
            onSelect={handleSlashSelect}
            onClose={() => {
              setShowSlashMenu(false);
              setSlashQuery("");
            }}
            direction={variant === "chat" ? "up" : "down"}
          />
        )}

        <div
          className={variant === "home" ? "home-in-footer" : "in-row-bottom"}
        >
          <div className="in-tools">
            <PlusMenu
              onAddFiles={handleAddFiles}
              onScreenshot={handleScreenshot}
              onSkills={handleSkills}
              onAddConnectors={handleAddConnectors}
              onStyleChange={handleStyleChange}
              currentStyle={responseStyle}
              webSearchEnabled={webSearchEnabled}
              onWebSearchToggle={handleWebSearchToggle}
              memoryEnabled={memoryEnabled}
              onMemoryToggle={onMemoryToggle}
              direction="up"
              modelCanWebSearch={modelCanWebSearch}
              langSearchApiKey={effectiveLangSearchApiKey}
              onNavigateToConnections={navigateToConnections}
              projects={projects}
              activeChatId={activeChatId}
              onAddChatToProject={handleAddChatToProject}
              onRemoveChatFromProject={removeChatFromProject}
            />
            {activeProject && (
              <button
                className="t-btn"
                title={
                  isProjectHovered
                    ? "Remove from project"
                    : `Project: ${activeProject.name}`
                }
                onMouseEnter={() => setIsProjectHovered(true)}
                onMouseLeave={() => setIsProjectHovered(false)}
                onClick={() => {
                  if (activeChatId) {
                    removeChatFromProject(activeProject.id, activeChatId);
                  } else if (activeProjectId) {
                    setActiveProjectId(null);
                  }
                  setIsProjectHovered(false);
                }}
                style={{
                  width: 28,
                  height: 28,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "var(--r-sm)",
                  border: "none",
                  background: isProjectHovered
                    ? "rgba(var(--acc-r),var(--acc-g),var(--acc-b),.15)"
                    : activeProject.color + "22",
                  cursor: "pointer",
                  color: isProjectHovered ? "var(--tx)" : activeProject.color,
                  transition: "background 0.15s, color 0.15s",
                }}
              >
                {isProjectHovered ? <X size={14} /> : <Folder size={14} />}
              </button>
            )}
          </div>
          <div className="in-right">
            {model &&
              (canOpenPicker ? (
                <button
                  ref={modelChipRef}
                  className="model-chip"
                  onClick={() => setIsModelPickerOpen(!isModelPickerOpen)}
                  title="Change model"
                >
                  {model.name || getDisplayName(model.id)}
                  <ChevronDown size={12} style={{ marginLeft: "4px" }} />
                </button>
              ) : (
                <span className="model-chip">
                  {model.name || getDisplayName(model.id)}
                </span>
              ))}
            <ModelPicker
              isOpen={isModelPickerOpen}
              onClose={() => setIsModelPickerOpen(false)}
              triggerRef={modelChipRef}
              direction="up"
            />
            {isStreaming ? (
              <button
                className="send send-stopping"
                onClick={onStop}
                title="Stop generation"
                style={{
                  background: "var(--danger-fill)",
                  borderColor: "var(--danger-fill)",
                  color: "var(--white)",
                }}
              >
                <Square size={14} fill="currentColor" />
              </button>
            ) : (
              <button
                className={`send home-action-btn${hasText ? " has-text" : ""}`}
                onClick={handleSend}
                title={hasText ? "Send" : "Voice / Send"}
                disabled={!hasText && !isStreaming}
              >
                <span className="hab-voice">
                  <Mic size={14} />
                </span>
                <span className="hab-send">
                  <Send size={14} />
                </span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
