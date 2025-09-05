import { cn } from '@/lib/utils'

export const DropdownCategoryTitle = ({ children }: { children: React.ReactNode }) => {
    return (
        <div className="text-xs font-semibold mb-1 uppercase text-gray-500 px-1.5">
            {children}
        </div>
    )
}

export const DropdownButton = ({
    children,
    isActive,
    onClick,
    disabled,
    className,
}: {
    children: React.ReactNode
    isActive?: boolean
    onClick?: () => void
    disabled?: boolean
    className?: string
}) => {
    const buttonClass = cn(
        'flex items-center gap-2 p-1.5 text-sm font-medium text-gray-500 text-left bg-transparent w-full rounded',
        !isActive && !disabled,
        'hover:bg-gray-100 hover:text-gray-800',
        isActive && !disabled && 'bg-gray-100 text-gray-800',
        disabled && 'text-gray-400 cursor-not-allowed',
        className,
    )

    return (
        <button className={buttonClass} disabled={disabled} onClick={onClick}>
            {children}
        </button>
    )
}
