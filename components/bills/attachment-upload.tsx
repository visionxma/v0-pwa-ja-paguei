'use client'

import { useState, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import {
  Camera,
  ImagePlus,
  FileText,
  X,
  Upload,
  Eye,
  Loader2,
  Paperclip,
  File,
} from 'lucide-react'

export interface PendingFile {
  id: string
  file: File
  preview: string | null
  name: string
  type: string
  size: number
}

interface AttachmentUploadProps {
  files: PendingFile[]
  onFilesChange: (files: PendingFile[]) => void
  maxFiles?: number
  maxSizeMB?: number
}

const ACCEPT_TYPES = 'image/jpeg,image/png,image/webp,image/heic,application/pdf'
const MAX_SIZE_DEFAULT = 10 // MB

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function getFileIcon(type: string) {
  if (type === 'application/pdf') return <FileText className="w-5 h-5 text-red-500" />
  if (type.startsWith('image/')) return <ImagePlus className="w-5 h-5 text-blue-500" />
  return <File className="w-5 h-5 text-muted-foreground" />
}

export function AttachmentUpload({
  files,
  onFilesChange,
  maxFiles = 5,
  maxSizeMB = MAX_SIZE_DEFAULT,
}: AttachmentUploadProps) {
  const [dragActive, setDragActive] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)

  const addFiles = useCallback(
    (newFiles: FileList | File[]) => {
      setError(null)
      const incoming = Array.from(newFiles)

      if (files.length + incoming.length > maxFiles) {
        setError(`Maximo de ${maxFiles} anexos permitidos`)
        return
      }

      const valid: PendingFile[] = []

      for (const file of incoming) {
        if (file.size > maxSizeMB * 1024 * 1024) {
          setError(`"${file.name}" excede o limite de ${maxSizeMB}MB`)
          continue
        }

        const preview = file.type.startsWith('image/')
          ? URL.createObjectURL(file)
          : null

        valid.push({
          id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
          file,
          preview,
          name: file.name,
          type: file.type,
          size: file.size,
        })
      }

      onFilesChange([...files, ...valid])
    },
    [files, onFilesChange, maxFiles, maxSizeMB],
  )

  const removeFile = useCallback(
    (id: string) => {
      const updated = files.filter((f) => f.id !== id)
      const removed = files.find((f) => f.id === id)
      if (removed?.preview) URL.revokeObjectURL(removed.preview)
      onFilesChange(updated)
    },
    [files, onFilesChange],
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragActive(false)
      if (e.dataTransfer.files.length > 0) {
        addFiles(e.dataTransfer.files)
      }
    },
    [addFiles],
  )

  return (
    <div className="space-y-3">
      {/* Upload area */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragActive(true) }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-[18px] p-5 text-center transition-all duration-400 ${
          dragActive
            ? 'border-primary/50 bg-primary/[0.04] scale-[1.01]'
            : 'border-border/50 hover:border-primary/30 hover:bg-muted/20'
        }`}
      >
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-[16px] bg-muted/60 flex items-center justify-center">
            <Paperclip className="w-5 h-5 text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">
              Arraste arquivos aqui
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              PDF, fotos (max {maxSizeMB}MB cada, ate {maxFiles} arquivos)
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-center gap-2 mt-4">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="rounded-[12px] gap-2 ios-press text-[12px] h-9"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="w-3.5 h-3.5" />
            Arquivo
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="rounded-[12px] gap-2 ios-press text-[12px] h-9"
            onClick={() => {
              // For gallery picker on mobile
              if (fileInputRef.current) {
                fileInputRef.current.accept = 'image/*'
                fileInputRef.current.click()
                // Reset accept after click
                setTimeout(() => {
                  if (fileInputRef.current) fileInputRef.current.accept = ACCEPT_TYPES
                }, 100)
              }
            }}
          >
            <ImagePlus className="w-3.5 h-3.5" />
            Galeria
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="rounded-[12px] gap-2 ios-press text-[12px] h-9"
            onClick={() => cameraInputRef.current?.click()}
          >
            <Camera className="w-3.5 h-3.5" />
            Camera
          </Button>
        </div>

        {/* Hidden inputs */}
        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPT_TYPES}
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files) addFiles(e.target.files)
            e.target.value = ''
          }}
        />
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => {
            if (e.target.files) addFiles(e.target.files)
            e.target.value = ''
          }}
        />
      </div>

      {/* Error */}
      {error && (
        <p className="text-xs text-destructive font-medium animate-fade-in-up">{error}</p>
      )}

      {/* File list */}
      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((f) => (
            <div
              key={f.id}
              className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 border border-border/50 group animate-fade-in-up"
            >
              {/* Thumbnail or icon */}
              {f.preview ? (
                <button
                  type="button"
                  onClick={() => setPreviewUrl(f.preview)}
                  className="w-10 h-10 rounded-lg overflow-hidden shrink-0 ring-1 ring-border/50 hover:ring-primary/50 transition-all"
                >
                  <img src={f.preview} alt={f.name} className="w-full h-full object-cover" />
                </button>
              ) : (
                <div className="w-10 h-10 rounded-lg bg-background flex items-center justify-center shrink-0 ring-1 ring-border/50">
                  {getFileIcon(f.type)}
                </div>
              )}

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{f.name}</p>
                <p className="text-xs text-muted-foreground">{formatFileSize(f.size)}</p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 shrink-0">
                {f.preview && (
                  <button
                    type="button"
                    onClick={() => setPreviewUrl(f.preview)}
                    className="p-1.5 rounded-lg hover:bg-background transition-colors"
                  >
                    <Eye className="w-4 h-4 text-muted-foreground" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => removeFile(f.id)}
                  className="p-1.5 rounded-lg hover:bg-destructive/10 transition-colors"
                >
                  <X className="w-4 h-4 text-destructive" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Image preview modal */}
      {previewUrl && (
        <div
          className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setPreviewUrl(null)}
        >
          <div className="relative max-w-2xl max-h-[80vh] animate-fade-in-up" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => setPreviewUrl(null)}
              className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-white dark:bg-gray-800 shadow-lg flex items-center justify-center z-10 hover:scale-110 transition-transform"
            >
              <X className="w-4 h-4" />
            </button>
            <img
              src={previewUrl}
              alt="Preview"
              className="max-w-full max-h-[80vh] rounded-2xl shadow-2xl object-contain"
            />
          </div>
        </div>
      )}
    </div>
  )
}

// Component for viewing existing attachments (after bill creation)
interface AttachmentListProps {
  attachments: Array<{
    id: string
    file_url: string
    file_name: string
    file_type: string | null
    created_at: string
  }>
  onDelete?: (id: string, url: string) => void
  deleting?: string | null
}

export function AttachmentList({ attachments, onDelete, deleting }: AttachmentListProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  if (attachments.length === 0) return null

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 mb-3">
        <Paperclip className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm font-semibold text-foreground">
          Anexos ({attachments.length})
        </span>
      </div>

      {attachments.map((a) => {
        const isImage = a.file_type?.startsWith('image/')
        const isPdf = a.file_type === 'application/pdf'

        return (
          <div
            key={a.id}
            className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 border border-border/50 group"
          >
            {isImage ? (
              <button
                type="button"
                onClick={() => setPreviewUrl(a.file_url)}
                className="w-10 h-10 rounded-lg overflow-hidden shrink-0 ring-1 ring-border/50 hover:ring-primary/50 transition-all"
              >
                <img src={a.file_url} alt={a.file_name} className="w-full h-full object-cover" />
              </button>
            ) : (
              <div className="w-10 h-10 rounded-lg bg-background flex items-center justify-center shrink-0 ring-1 ring-border/50">
                {isPdf ? <FileText className="w-5 h-5 text-red-500" /> : <File className="w-5 h-5 text-muted-foreground" />}
              </div>
            )}

            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{a.file_name}</p>
              <p className="text-xs text-muted-foreground">
                {new Date(a.created_at).toLocaleDateString('pt-BR')}
              </p>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <a
                href={a.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 rounded-lg hover:bg-background transition-colors"
              >
                <Eye className="w-4 h-4 text-muted-foreground" />
              </a>
              {onDelete && (
                <button
                  type="button"
                  disabled={deleting === a.id}
                  onClick={() => onDelete(a.id, a.file_url)}
                  className="p-1.5 rounded-lg hover:bg-destructive/10 transition-colors disabled:opacity-50"
                >
                  {deleting === a.id ? (
                    <Loader2 className="w-4 h-4 text-destructive animate-spin" />
                  ) : (
                    <X className="w-4 h-4 text-destructive" />
                  )}
                </button>
              )}
            </div>
          </div>
        )
      })}

      {/* Image preview modal */}
      {previewUrl && (
        <div
          className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setPreviewUrl(null)}
        >
          <div className="relative max-w-2xl max-h-[80vh] animate-fade-in-up" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => setPreviewUrl(null)}
              className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-white dark:bg-gray-800 shadow-lg flex items-center justify-center z-10 hover:scale-110 transition-transform"
            >
              <X className="w-4 h-4" />
            </button>
            <img
              src={previewUrl}
              alt="Preview"
              className="max-w-full max-h-[80vh] rounded-2xl shadow-2xl object-contain"
            />
          </div>
        </div>
      )}
    </div>
  )
}
