import { Skeleton } from '@/components/ui/Skeleton'

export function WishlistPageSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 via-rose-50 to-sky-50 dark:from-[#120705] dark:via-[#0d0700] dark:to-[#030303]">
      <header className="bg-white/80 dark:bg-zinc-900/50 backdrop-blur-lg shadow-sm border-b border-white/30 dark:border-white/10 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <Skeleton className="h-10 w-48 my-3" />
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Bar Skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
        {/* Filter Bar Skeleton */}
        <div className="mb-6">
          <Skeleton className="h-12 w-full" />
        </div>
        {/* Item Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Skeleton className="h-56 w-full" />
          <Skeleton className="h-56 w-full" />
          <Skeleton className="h-56 w-full" />
          <Skeleton className="h-56 w-full" />
          <Skeleton className="h-56 w-full" />
          <Skeleton className="h-56 w-full" />
        </div>
      </main>
    </div>
  )
} 