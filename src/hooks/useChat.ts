import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { encryptMessage, decryptMessage } from '@/lib/encryption';
import { useToast } from '@/hooks/use-toast';
import { getClientId, getDisplayName } from '@/lib/client';
export interface Message {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
  decrypted_content?: string;
}

export interface ChatUser {
  id: string;
  name: string;
  isHost?: boolean;
}

export function useChat(roomKey: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [users, setUsers] = useState<ChatUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [roomExists, setRoomExists] = useState(false);
  const [roomHost, setRoomHost] = useState<string>('');
  const [isCreator, setIsCreator] = useState(false);
  const [roomFull, setRoomFull] = useState(false);
  const userIdRef = useRef<string>('');
  const channelRef = useRef<any>(null);
  const presenceChannelRef = useRef<any>(null);
  const { toast } = useToast();

  // Generate stable client info on mount
  useEffect(() => {
    if (!userIdRef.current) {
      userIdRef.current = getClientId();
    }
  }, []);

  // Check if room exists and create real-time subscriptions
  useEffect(() => {
    let mounted = true;

    const initializeRoom = async () => {
      try {
        // Validate room key format (6 alphanumeric characters)
        if (!/^[A-Z0-9]{6}$/.test(roomKey)) {
          setRoomExists(false);
          setLoading(false);
          return;
        }

        // Check if room exists and get creator info
        const { data: room, error } = await supabase
          .from('rooms')
          .select('id, created_at, creator_id')
          .eq('id', roomKey)
          .maybeSingle();

        if (error) {
          console.error('Error checking room:', error);
          setRoomExists(false);
          setLoading(false);
          return;
        }

        if (!room) {
          setRoomExists(false);
          setLoading(false);
          return;
        }

        setRoomExists(true);

        if (room.creator_id) {
          setRoomHost(room.creator_id);
        }

        // Get the first message to identify the room creator/host if creator_id missing
        const { data: firstMessage } = await supabase
          .from('messages')
          .select('sender_id')
          .eq('room_id', roomKey)
          .order('created_at', { ascending: true })
          .limit(1)
          .maybeSingle();

        if (!room.creator_id && firstMessage) {
          setRoomHost(firstMessage.sender_id);
        }

        // Fetch existing messages
        const { data: messagesData, error: messagesError } = await supabase
          .from('messages')
          .select('*')
          .eq('room_id', roomKey)
          .order('created_at', { ascending: true });

        if (messagesError) {
          console.error('Error fetching messages:', messagesError);
        } else if (mounted && messagesData) {
          // Decrypt messages
          const decryptedMessages = messagesData.map(msg => ({
            ...msg,
            decrypted_content: decryptMessage(msg.content, roomKey)
          }));
          setMessages(decryptedMessages);
        }

        // Set up real-time subscription for messages
        channelRef.current = supabase
          .channel(`room:${roomKey}`)
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'messages',
              filter: `room_id=eq.${roomKey}`
            },
            (payload) => {
              if (mounted) {
                const newMessage = payload.new as Message;
                try {
                  const decryptedMessage = {
                    ...newMessage,
                    decrypted_content: decryptMessage(newMessage.content, roomKey)
                  };
                  setMessages(prev => [...prev, decryptedMessage]);
                } catch (error) {
                  console.error('Failed to decrypt incoming message:', error);
                }
              }
            }
          )
          .subscribe();

        // Set up presence tracking
        presenceChannelRef.current = supabase
          .channel(`presence:${roomKey}`, {
            config: {
              presence: {
                key: userIdRef.current,
              },
            },
          })
          .on('presence', { event: 'sync' }, () => {
            if (mounted) {
              const state = presenceChannelRef.current.presenceState();
              const userList = Object.entries(state).map(([key, metas]: any) => ({
                id: key as string,
                name: (Array.isArray(metas) && metas[0]?.name) ? metas[0].name as string : (key as string).substring(0, 8),
                isHost: key === roomHost
              }));
              setUsers(userList);
              const count = Object.keys(state).length;
              setRoomFull(count >= 50);
            }
          })
          .subscribe(async (status) => {
            if (status === 'SUBSCRIBED') {
              const state = presenceChannelRef.current.presenceState();
              const count = Object.keys(state).length;
              const isHostUser = !!roomHost && userIdRef.current === roomHost;
              if (count >= 50 && !isHostUser) {
                setRoomFull(true);
                toast({
                  title: 'Room is full',
                  description: 'This room has reached its 50-member limit.',
                  variant: 'destructive'
                });
                return;
              }
              await presenceChannelRef.current.track({
                user_id: userIdRef.current,
                name: getDisplayName(),
                online_at: new Date().toISOString(),
              });
            }
          });

        setLoading(false);
      } catch (error) {
        console.error('Error initializing room:', error);
        setLoading(false);
      }
    };

    initializeRoom();

    return () => {
      mounted = false;
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
      if (presenceChannelRef.current) {
        supabase.removeChannel(presenceChannelRef.current);
      }
    };
  }, [roomKey]);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || sending || !roomExists) return;

    setSending(true);
    try {
      // Encrypt the message
      const encryptedContent = encryptMessage(content, roomKey);

      // Send to database
      const { error } = await supabase
        .from('messages')
        .insert({
          room_id: roomKey,
          content: encryptedContent,
          sender_id: userIdRef.current
        });

      if (error) {
        console.error('Error sending message:', error);
        toast({
          title: "Error",
          description: "Failed to send message. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to encrypt or send message.",
        variant: "destructive"
      });
    } finally {
      setSending(false);
    }
  }, [roomKey, sending, roomExists, toast]);

  const createRoom = useCallback(async () => {
    // Validate room key format
    if (!/^[A-Z0-9]{6}$/.test(roomKey)) {
      toast({
        title: "Invalid Room Key",
        description: "Room key must be 6 alphanumeric characters.",
        variant: "destructive"
      });
      return false;
    }

    try {
      const { error } = await supabase
        .from('rooms')
        .insert({ id: roomKey, creator_id: userIdRef.current });

      if (error) {
        console.error('Error creating room:', error);
        throw error;
      }

      setRoomExists(true);
      setRoomHost(userIdRef.current);
      setIsCreator(true);
      return true;
    } catch (error) {
      console.error('Error creating room:', error);
      toast({
        title: "Error",
        description: "Failed to create room. Please try again.",
        variant: "destructive"
      });
      return false;
    }
  }, [roomKey, toast]);

  return {
    messages,
    users,
    loading,
    sending,
    roomExists,
    roomHost,
    roomFull,
    isCreator,
    currentUserId: userIdRef.current,
    sendMessage,
    createRoom
  };
}