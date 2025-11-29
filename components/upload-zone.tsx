'use client'

import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, FileText, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useUploadThing } from '@/lib/uploadthing'
import { cn } from '@/lib/utils'

interface UploadZoneProps {
  onUploadComplete: (fileUrl: string, fileName: string, fileType: string) => void
}

export function UploadZone({ onUploadComplete }: UploadZoneProps) {
  const [uploading, setUploading] = useState(false)
  const { startUpload } = useUploadThing('invoiceUploader')

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return

    const file = acceptedFiles[0]
    setUploading(true)

    try {
      const result = await startUpload([file])
      if (result && result[0]) {
        onUploadComplete(result[0].url, file.name, file.type)
      }
    } catch (error) {
      console.error('Upload error:', error)
      alert('Failed to upload file')
    } finally {
      setUploading(false)
    }
  }, [startUpload, onUploadComplete])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp'],
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    maxFiles: 1,
  })

  return (
    <Card
      {...getRootProps()}
      className={cn(
        'border-2 border-dashed cursor-pointer transition-colors p-12',
        isDragActive && 'border-blue-500 bg-blue-50',
        uploading && 'pointer-events-none opacity-50'
      )}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center justify-center gap-4 text-center">
        {uploading ? (
          <>
            <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
            <p className="text-sm text-slate-600">Uploading invoice...</p>
          </>
        ) : (
          <>
            <div className="rounded-full bg-slate-100 p-4">
              {isDragActive ? (
                <FileText className="h-8 w-8 text-blue-500" />
              ) : (
                <Upload className="h-8 w-8 text-slate-600" />
              )}
            </div>
            <div>
              <p className="text-lg font-semibold">
                {isDragActive ? 'Drop invoice here' : 'Upload invoice'}
              </p>
              <p className="text-sm text-slate-500 mt-1">
                Drag & drop or click to browse
              </p>
              <p className="text-xs text-slate-400 mt-2">
                PDF, JPG, PNG up to 10MB
              </p>
            </div>
            <Button type="button" variant="outline">
              Select File
            </Button>
          </>
        )}
      </div>
    </Card>
  )
}

