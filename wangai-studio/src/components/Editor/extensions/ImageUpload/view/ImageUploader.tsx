import { Spinner } from '@/components/ui/Spinner'
import { useDropZone, useFileUpload, useUploader } from './hooks'
import { Button } from '@/components/ui/button'
import { Icon } from '@/components/Icon'
import { cn } from '@/lib/utils'
import { ChangeEvent, useCallback } from 'react'

export const ImageUploader = ({ onUpload }: { onUpload: (url: string) => void }) => {
    const { loading, uploadFile } = useUploader({ onUpload })
    const { handleUploadClick, ref } = useFileUpload()
    const { draggedInside, onDrop, onDragEnter, onDragLeave } = useDropZone({ uploader: uploadFile })

    const onFileChange = useCallback(
        // @ts-ignore
        (e: ChangeEvent<HTMLInputElement>) => (e.target.files ? uploadFile(e.target.files[0]) : null),
        [uploadFile],
    )

    if (loading) {
        return (
            <div className="flex items-center justify-center p-8 rounded-lg min-h-40 bg-opacity-80">
                <Spinner className="text-gray-500" size={1.5} />
            </div>
        )
    }

    const wrapperClass = cn(
        'flex flex-col items-center justify-center px-8 py-10 rounded-lg bg-opacity-80',
        draggedInside && 'bg-gray-100',
    )

    return (
        <div
            className={wrapperClass}
            onDrop={onDrop}
            onDragOver={onDragEnter}
            onDragLeave={onDragLeave}
            contentEditable={false}
        >
            <Icon name="Image" className="w-12 h-12 mb-4 text-gray-900 opacity-20" />
            <div className="flex flex-col items-center justify-center gap-2">
                <div className="text-sm font-medium text-center text-gray-400">
                    {draggedInside ? 'Drop image here' : 'Drag and drop or'}
                </div>
                <div>
                    {/*  @ts-ignore */}
                    <Button disabled={draggedInside} onClick={handleUploadClick} variant="primary" buttonSize="small">
                        <Icon name="Upload" />
                        Upload an image
                    </Button>
                </div>
            </div>
            <input
                className="w-0 h-0 overflow-hidden opacity-0"
                ref={ref}
                type="file"
                accept=".jpg,.jpeg,.png,.webp,.gif"
                onChange={onFileChange}
            />
        </div>
    )
}

export default ImageUploader
