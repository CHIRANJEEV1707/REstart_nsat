"use client";

import * as React from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

const Dialog = ({
    children,
    open,
    onOpenChange,
}: {
    children: React.ReactNode
    open?: boolean
    onOpenChange?: (open: boolean) => void
}) => {
    // Simple state management if not controlled
    const [isOpen, setIsOpen] = React.useState(false)

    const show = open !== undefined ? open : isOpen
    const setShow = onOpenChange || setIsOpen

    if (!show) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
                onClick={() => setShow(false)}
            />
            {/* Content */}
            <div className="relative z-50 w-full max-w-lg scale-100 opacity-100 transition-all">
                {React.Children.map(children, (child) => {
                    // Pass close handler to children if needed
                    if (React.isValidElement(child)) {
                        return React.cloneElement(child as any, { onClose: () => setShow(false) });
                    }
                    return child;
                })}
            </div>
        </div>
    )
}

const DialogTrigger = React.forwardRef<
    HTMLButtonElement,
    React.ButtonHTMLAttributes<HTMLButtonElement> & { asChild?: boolean }
>(({ className, onClick, asChild, ...props }, ref) => {
    // In a real context usage we would toggle state here, 
    // but without context we rely on parent wrapper managing state or simplified logic.
    // For this custom shim, we assume the parent 'Dialog' or 'AddExamModal' handles the trigger logic 
    // OR we just use this for styling. 
    // Actually, AddExamModal controls the state. So this just renders children.

    // If we click this, we want to open the dialog. 
    // But since state is lifted, we might need a context.
    // To keep it simple and match Shadcn API usage in AddExamModal:
    // <Dialog open={show} onOpenChange={setShow}> <DialogTrigger>...</DialogTrigger> ... </Dialog>

    // We need a Context to share state between Trigger and Content if we want full Shadcn comp.
    // However, AddExamModal uses `open` prop on Dialog directly.
    return (
        <button
            ref={ref}
            className={cn(className)}
            onClick={(e) => {
                onClick?.(e);
                // Trigger open logic would go here if we had context
                // For now, we expect the parent AddExamModal to set `open={true}` via a separate state or 
                // we strictly use Controlled mode in AddExamModal.
            }}
            {...props}
        >
            {props.children}
        </button>
    )
})
DialogTrigger.displayName = "DialogTrigger"

const DialogContent = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => (
    <div
        ref={ref}
        className={cn(
            "bg-white p-6 shadow-lg rounded-xl border border-gray-100 w-full",
            className
        )}
        {...props}
    >
        {children}
        <button className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
            {/* Close Button would go here if we had access to setShow */}
        </button>
    </div>
))
DialogContent.displayName = "DialogContent"

const DialogHeader = ({
    className,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
    <div
        className={cn(
            "flex flex-col space-y-1.5 text-center sm:text-left mb-4",
            className
        )}
        {...props}
    />
)
DialogHeader.displayName = "DialogHeader"

const DialogFooter = ({
    className,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
    <div
        className={cn(
            "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
            className
        )}
        {...props}
    />
)
DialogFooter.displayName = "DialogFooter"

const DialogTitle = React.forwardRef<
    HTMLHeadingElement,
    React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
    <h3
        ref={ref}
        className={cn(
            "text-lg font-semibold leading-none tracking-tight",
            className
        )}
        {...props}
    />
))
DialogTitle.displayName = "DialogTitle"

const DialogDescription = React.forwardRef<
    HTMLParagraphElement,
    React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
    <p
        ref={ref}
        className={cn("text-sm text-muted-foreground", className)}
        {...props}
    />
))
DialogDescription.displayName = "DialogDescription"

export {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogFooter,
    DialogTitle,
    DialogDescription,
}
