import { Skeleton } from "@/components/ui/Skeleton";

interface GreetingHeaderProps {
    name: string;
}

export function GreetingHeader({ name }: GreetingHeaderProps) {
    return (
        <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                Welcome back, {name.split(' ')[0]}!
            </h1>
            <p className="text-gray-500 mt-2 text-lg">
                Let’s find the best colleges for your future.
            </p>
        </div>
    );
}

export function GreetingSkeleton() {
    return (
        <div className="mb-8 space-y-3">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-6 w-96" />
        </div>
    );
}
