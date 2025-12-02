'use client';

import { useState, useCallback } from 'react';

interface ResourceVersion {
    id: number;
    resource_id: number;
    content: unknown;
    version_number: number;
    created_at: string;
    updated_at: string;
}

interface ResourceWithVersions {
    id: number;
    title: string;
    subtitle?: string;
    thumbnail?: string;
    category_id: number;
    author_id: string;
    status: 'draft' | 'published';
    visibility: 'public' | 'private' | 'unlisted';
    latest_version_id?: number;
    published_version_id?: number;
    latest_version?: ResourceVersion;
    published_version?: ResourceVersion;
    created_at: string;
    updated_at: string;
}

interface UseResourceVersionsProps {
    resourceId?: number;
    isDraft?: boolean; // true면 latest, false면 published
}

export function useResourceVersions({ resourceId, isDraft = false }: UseResourceVersionsProps) {
    const [resource, setResource] = useState<ResourceWithVersions | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchResource = useCallback(async () => {
        if (!resourceId) return;
        
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(
                `/api/resources/${resourceId}?version=${isDraft ? 'latest' : 'published'}`
            );
            
            if (!response.ok) {
                throw new Error('Failed to fetch resource');
            }

            const data = await response.json();
            setResource(data.resource);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
        } finally {
            setLoading(false);
        }
    }, [resourceId, isDraft]);

    const saveDraft = useCallback(async (content: unknown) => {
        if (!resourceId) return { success: false, error: 'No resource ID' };

        try {
            const response = await fetch(`/api/resources/${resourceId}/draft`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content })
            });

            if (!response.ok) {
                throw new Error('Failed to save draft');
            }

            await fetchResource();
            return { success: true };
        } catch (err) {
            return { 
                success: false, 
                error: err instanceof Error ? err.message : 'Unknown error' 
            };
        }
    }, [resourceId, fetchResource]);

    const publish = useCallback(async () => {
        if (!resourceId) return { success: false, error: 'No resource ID' };

        try {
            const response = await fetch(`/api/resources/${resourceId}/publish`, {
                method: 'POST'
            });

            if (!response.ok) {
                throw new Error('Failed to publish');
            }

            await fetchResource();
            return { success: true };
        } catch (err) {
            return { 
                success: false, 
                error: err instanceof Error ? err.message : 'Unknown error' 
            };
        }
    }, [resourceId, fetchResource]);

    const updateVisibility = useCallback(async (visibility: 'public' | 'private' | 'unlisted') => {
        if (!resourceId) return { success: false, error: 'No resource ID' };

        try {
            const response = await fetch(`/api/resources/${resourceId}/visibility`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ visibility })
            });

            if (!response.ok) {
                throw new Error('Failed to update visibility');
            }

            await fetchResource();
            return { success: true };
        } catch (err) {
            return { 
                success: false, 
                error: err instanceof Error ? err.message : 'Unknown error' 
            };
        }
    }, [resourceId, fetchResource]);

    return {
        resource,
        loading,
        error,
        fetchResource,
        saveDraft,
        publish,
        updateVisibility
    };
}

// Published resources only
export function usePublishedResource(resourceId?: number) {
    return useResourceVersions({ resourceId, isDraft: false });
}

// Latest (draft) resource only  
export function useLatestResource(resourceId?: number) {
    return useResourceVersions({ resourceId, isDraft: true });
}














