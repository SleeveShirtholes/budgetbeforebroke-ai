import { useState, useEffect } from "react";
import { getCategories, type Category } from "@/app/actions/category";

/**
 * Hook to fetch categories for a budget account
 * @param accountId - The budget account ID to fetch categories for
 * @returns Object containing categories, loading state, and error state
 */
export function useCategories(accountId?: string) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!accountId) {
      setCategories([]);
      return;
    }

    const fetchCategories = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const fetchedCategories = await getCategories(accountId);
        setCategories(fetchedCategories);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch categories",
        );
        console.error("Error fetching categories:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, [accountId]);

  return { categories, isLoading, error };
}
