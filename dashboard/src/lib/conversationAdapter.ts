import { useState, useEffect } from 'react';
import { Conversation } from './types';
import { fetchConversations, fetchConversationDetails } from './api';

export function useConversations(selectedId?: string | null) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    const loadData = async () => {
      try {
        const { conversations: summaries } = await fetchConversations();
        
        if (selectedId) {
          try {
            const { conversation: details } = await fetchConversationDetails(selectedId);
            // Merge details into the corresponding summary
            const merged = summaries.map(c => 
              c.id === selectedId 
                ? { ...c, messages: details.messages || [] } 
                : { ...c, messages: c.messages || [] } // Preserve existing messages if any
            );
            setConversations(merged);
          } catch (e) {
            console.error(`Failed to fetch details for ${selectedId}`, e);
          }
        } else {
          // Initialize summaries with empty messages arrays if they don't have them
          setConversations(prev => {
            return summaries.map(c => {
              const existing = prev.find(p => p.id === c.id);
              return { ...c, messages: existing?.messages || [] };
            });
          });
        }
      } catch (error) {
        console.error('Failed to fetch conversations:', error);
      } finally {
        setIsLoading(false);
      }
    };

    // Initial load
    loadData();

    // Poll every 5 seconds
    interval = setInterval(loadData, 5000);

    return () => clearInterval(interval);
  }, [selectedId]);

  return { conversations, isLoading };
}
