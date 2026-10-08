import { supabase, isSupabaseConfigured } from '../utils/supabaseClient';
import type { CareerRoadmapResponse } from '../types/roadmap';

export interface SavedRoadmapRecord {
  id: string;
  user_id: string;
  target_role: string;
  roadmap_data: CareerRoadmapResponse;
  created_at: string;
}

const LOCAL_STORAGE_KEY = 'pathcraft_local_roadmaps';

/**
 * Save or update a roadmap in Supabase 'roadmaps' table with strict user isolation.
 */
export async function saveRoadmapToSupabase(
  roadmap: CareerRoadmapResponse,
  userId?: string,
  existingId?: string
): Promise<SavedRoadmapRecord | null> {
  const targetRole = roadmap.targetSummary?.targetRole || 'Software Engineer';

  // 1. If Supabase is configured and user is logged in, write to Supabase
  if (isSupabaseConfigured() && userId) {
    try {
      if (existingId) {
        // Update existing record strictly matching user_id
        const { data, error } = await supabase
          .from('roadmaps')
          .update({
            target_role: targetRole,
            roadmap_data: roadmap,
          })
          .eq('id', existingId)
          .eq('user_id', userId)
          .select()
          .single();

        if (error) {
          console.error('Error updating roadmap in Supabase:', error);
          throw error;
        } else if (data) {
          return data as SavedRoadmapRecord;
        }
      } else {
        // Insert new record strictly attached to auth user_id
        const { data, error } = await supabase
          .from('roadmaps')
          .insert({
            user_id: userId,
            target_role: targetRole,
            roadmap_data: roadmap,
          })
          .select()
          .single();

        if (error) {
          console.error('Error inserting roadmap to Supabase:', error);
          throw error;
        } else if (data) {
          return data as SavedRoadmapRecord;
        }
      }
    } catch (err) {
      console.error('Failed to communicate with Supabase:', err);
    }
  }

  // 2. Local fallback storage for offline / unauthenticated state, scoped by userId
  try {
    const localRecords: SavedRoadmapRecord[] = JSON.parse(
      localStorage.getItem(LOCAL_STORAGE_KEY) || '[]'
    );

    const recordId = existingId || crypto.randomUUID();
    const effectiveUserId = userId || 'anonymous';
    const newRecord: SavedRoadmapRecord = {
      id: recordId,
      user_id: effectiveUserId,
      target_role: targetRole,
      roadmap_data: roadmap,
      created_at: new Date().toISOString(),
    };

    const existingIndex = localRecords.findIndex((r) => r.id === recordId && r.user_id === effectiveUserId);
    if (existingIndex >= 0) {
      localRecords[existingIndex] = newRecord;
    } else {
      localRecords.unshift(newRecord);
    }

    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(localRecords.slice(0, 30)));
    return newRecord;
  } catch (err) {
    console.error('Error saving roadmap locally:', err);
    return null;
  }
}

/**
 * Fetch saved roadmaps strictly isolated by user ID.
 */
export async function fetchUserRoadmaps(
  userId?: string
): Promise<SavedRoadmapRecord[]> {
  // If user is authenticated and Supabase is configured, fetch only their records
  if (isSupabaseConfigured() && userId) {
    try {
      const { data, error } = await supabase
        .from('roadmaps')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching user roadmaps from Supabase:', error);
      } else {
        // Return user's Supabase records directly (even if empty array) to prevent data leaking
        return (data || []) as SavedRoadmapRecord[];
      }
    } catch (err) {
      console.error('Failed to fetch from Supabase:', err);
    }
  }

  // Fallback to local storage (only filter records belonging to this user or anonymous)
  try {
    const localRecords: SavedRoadmapRecord[] = JSON.parse(
      localStorage.getItem(LOCAL_STORAGE_KEY) || '[]'
    );
    const targetUserId = userId || 'anonymous';
    return localRecords.filter((record) => record.user_id === targetUserId);
  } catch {
    return [];
  }
}

/**
 * Delete a saved roadmap strictly verified by ID and user ID.
 */
export async function deleteRoadmapFromSupabase(
  roadmapId: string,
  userId?: string
): Promise<boolean> {
  if (isSupabaseConfigured() && userId) {
    try {
      const { error } = await supabase
        .from('roadmaps')
        .delete()
        .eq('id', roadmapId)
        .eq('user_id', userId);

      if (error) {
        console.error('Error deleting roadmap from Supabase:', error);
      }
    } catch (err) {
      console.error('Failed to delete from Supabase:', err);
    }
  }

  // Clean up local storage for matching record
  try {
    const localRecords: SavedRoadmapRecord[] = JSON.parse(
      localStorage.getItem(LOCAL_STORAGE_KEY) || '[]'
    );
    const targetUserId = userId || 'anonymous';
    const filtered = localRecords.filter(
      (r) => !(r.id === roadmapId && r.user_id === targetUserId)
    );
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(filtered));
    return true;
  } catch {
    return false;
  }
}
