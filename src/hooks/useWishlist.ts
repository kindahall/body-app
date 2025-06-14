import {
  WishlistService,
  WishlistItem,
  WishlistStats,
} from '@/lib/supabase/wishlist';
import { useCallback, useMemo } from 'react';
import { useAuth } from '@/lib/auth/AuthHandlerMCP';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { logger } from '@/lib/logger'

// Hook pour récupérer les items de la wishlist
export function useWishlistItems() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: items, error, isLoading } = useQuery<WishlistItem[]>({
    queryKey: ['wishlistItems', user?.id],
    queryFn: () => WishlistService.getWishlistItems(),
    enabled: !!user,
    staleTime: 1000 * 60 * 5, // 5 minutes
    initialData: [],
  });

  const addItemMutation = useMutation({
    mutationFn: (item: Partial<WishlistItem>) => {
      if (!user) {
        logger.error('User not authenticated to add item');
        throw new Error('User not authenticated');
      }
      const newItem = {
        ...item,
        user_id: user.id,
      } as Omit<WishlistItem, 'id' | 'created_at' | 'is_completed'>;
      return WishlistService.createWishlistItem(newItem);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlistItems', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['wishlistStats', user?.id] });
    },
  });

  const updateItemMutation = useMutation({
    mutationFn: ({ id, item }: { id: string, item: Partial<WishlistItem> }) => 
      WishlistService.updateWishlistItem(id, item),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlistItems', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['wishlistStats', user?.id] });
    },
  });

  const deleteItemMutation = useMutation({
    mutationFn: (id: string) => WishlistService.deleteWishlistItem(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlistItems', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['wishlistStats', user?.id] });
    },
  });

  return {
    items: items || [],
    isLoading,
    isError: !!error,
    addItem: addItemMutation.mutateAsync,
    updateItem: updateItemMutation.mutateAsync,
    deleteItem: deleteItemMutation.mutateAsync,
  };
}

// Hook pour récupérer les statistiques de la wishlist
export function useWishlistStats() {
    const { user } = useAuth();
    const defaultStats: WishlistStats = {
        total: 0,
        completed: 0,
        byCategory: {
        experience: { total: 0, completed: 0 },
        person: { total: 0, completed: 0 },
        place: { total: 0, completed: 0 },
        goal: { total: 0, completed: 0 },
        },
        completionRate: 0,
        streak: 0,
    };

    const { data, error, isLoading } = useQuery<WishlistStats>({
      queryKey: ['wishlistStats', user?.id],
      queryFn: () => WishlistService.getWishlistStats(),
      enabled: !!user,
      initialData: defaultStats,
    });

    return {
        stats: data || defaultStats,
        isLoading: isLoading && !data,
        isError: !!error,
        mutate: () => {}, // Invalidation est gérée par les mutations
    };
} 