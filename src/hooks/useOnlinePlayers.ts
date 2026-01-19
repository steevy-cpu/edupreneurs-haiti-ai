import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';

const JUDE_USER_ID = '68f2f959-e14a-47f9-8277-07df3a6fcd79';

export interface OnlinePlayer {
  id: string;
  user_id: string;
  nickname: string;
  avatar_url: string | null;
  academic_grade: string | null;
  isOnline: true;
}

interface UseOnlinePlayersOptions {
  excludeUserId?: string;
  searchQuery?: string;
}

export const useOnlinePlayers = ({ excludeUserId, searchQuery }: UseOnlinePlayersOptions = {}) => {
  const [onlineUserIds, setOnlineUserIds] = useState<string[]>([]);
  const [profiles, setProfiles] = useState<Map<string, OnlinePlayer>>(new Map());
  const [isLoading, setIsLoading] = useState(true);

  // Subscribe to online-users presence channel
  useEffect(() => {
    const channel = supabase.channel('online-users');
    
    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const userIds = Object.keys(state).filter(
          id => id !== excludeUserId && id !== JUDE_USER_ID
        );
        setOnlineUserIds(userIds);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          // Get initial state
          const state = channel.presenceState();
          const userIds = Object.keys(state).filter(
            id => id !== excludeUserId && id !== JUDE_USER_ID
          );
          setOnlineUserIds(userIds);
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [excludeUserId]);

  // Fetch profiles for online users
  useEffect(() => {
    const fetchProfiles = async () => {
      if (onlineUserIds.length === 0) {
        setProfiles(new Map());
        setIsLoading(false);
        return;
      }

      setIsLoading(true);

      const { data, error } = await supabase
        .from('profiles')
        .select('id, user_id, nickname, avatar_url, academic_grade')
        .in('user_id', onlineUserIds);

      if (error) {
        console.error('Error fetching online player profiles:', error);
        setIsLoading(false);
        return;
      }

      const profileMap = new Map<string, OnlinePlayer>();
      data?.forEach(profile => {
        profileMap.set(profile.user_id, {
          id: profile.id,
          user_id: profile.user_id,
          nickname: profile.nickname,
          avatar_url: profile.avatar_url,
          academic_grade: profile.academic_grade,
          isOnline: true,
        });
      });

      setProfiles(profileMap);
      setIsLoading(false);
    };

    fetchProfiles();
  }, [onlineUserIds]);

  // Filter players based on search query
  const filteredPlayers = useMemo(() => {
    const players = Array.from(profiles.values());
    
    if (!searchQuery || searchQuery.trim() === '') {
      return players;
    }

    const query = searchQuery.toLowerCase().trim();
    return players.filter(player => 
      player.nickname.toLowerCase().includes(query)
    );
  }, [profiles, searchQuery]);

  const refreshPlayers = useCallback(() => {
    // Trigger a re-fetch by getting current presence state
    const channel = supabase.channel('online-users');
    const state = channel.presenceState();
    const userIds = Object.keys(state).filter(
      id => id !== excludeUserId && id !== JUDE_USER_ID
    );
    setOnlineUserIds(userIds);
  }, [excludeUserId]);

  return {
    players: filteredPlayers,
    totalOnline: profiles.size,
    isLoading,
    refreshPlayers,
  };
};
