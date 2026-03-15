import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useSearchParams } from 'react-router-dom';
import { messagingApi } from '@/lib/api';
import { getApiError } from '@/lib/api-client';
import { useAuth } from '@/lib/auth-context';
import { formatRelative, initials } from '@/lib/utils';
import { MessageCircle, ArrowLeft, Send, User, Loader2, Package } from 'lucide-react';
import Button from '@/components/ui/Button';
import type { Conversation, Message } from '@/lib/types';

function ConversationList({
  conversations,
  onSelect,
  selectedId,
}: {
  conversations: Conversation[];
  onSelect: (c: Conversation) => void;
  selectedId?: string;
}) {
  const { user } = useAuth();

  return (
    <div className="space-y-2">
      {conversations.map((conv) => {
        const other = conv.other_user || conv.participants?.find((p) => p.id !== user?.id) || conv.participants?.[0];
        const isSelected = conv.id === selectedId;
        const lastMsgText = conv.last_message?.content || conv.last_message?.message_text;

        return (
          <button
            key={conv.id}
            onClick={() => onSelect(conv)}
            className={`w-full text-left bg-card rounded-xl border p-4 transition-all ${
              isSelected ? 'border-primary shadow-md' : 'border-border hover:border-primary/30 hover:shadow-sm'
            }`}
          >
            <div className="flex items-center gap-3">
              {other?.avatar_url ? (
                <img src={other.avatar_url} alt="" className="w-10 h-10 rounded-full object-cover" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-semibold">
                  {other ? initials(other.first_name, other.last_name) : <User className="w-4 h-4" />}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium truncate">
                    {other ? `${other.first_name} ${other.last_name}` : 'Utilisateur'}
                  </p>
                  {conv.type === 'delivery' && (
                    <span className="px-1.5 py-0.5 rounded bg-accent/10 text-accent text-[10px] font-medium flex items-center gap-0.5 shrink-0">
                      <Package className="w-2.5 h-2.5" /> Colis
                    </span>
                  )}
                  {conv.has_unread && (
                    <span className="w-2 h-2 rounded-full bg-primary shrink-0" />
                  )}
                </div>
                {conv.trip_info && (
                  <p className="text-xs text-primary/70 truncate">
                    {conv.trip_info.from_city} → {conv.trip_info.to_city}
                  </p>
                )}
                {lastMsgText && (
                  <p className="text-xs text-muted-foreground truncate mt-0.5">
                    {lastMsgText}
                  </p>
                )}
              </div>
              {conv.last_message && (
                <span className="text-xs text-muted-foreground shrink-0">
                  {formatRelative(conv.last_message.created_at)}
                </span>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}

function ChatView({ conversation, onBack }: { conversation: Conversation; onBack: () => void }) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [message, setMessage] = useState('');
  const [sendError, setSendError] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const other = conversation.other_user || conversation.participants?.find((p) => p.id !== user?.id) || conversation.participants?.[0];

  const { data: messages, isLoading } = useQuery({
    queryKey: ['messages', conversation.id],
    queryFn: () => messagingApi.messages(conversation.id).then((r) => {
      const d = r.data;
      return Array.isArray(d) ? d : (d as any).data || [];
    }),
    refetchInterval: 5000,
  });

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages && messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const sendMutation = useMutation({
    mutationFn: () => messagingApi.send(conversation.id, message),
    onSuccess: () => {
      setMessage('');
      setSendError('');
      qc.invalidateQueries({ queryKey: ['messages', conversation.id] });
      qc.invalidateQueries({ queryKey: ['conversations'] });
    },
    onError: (err) => setSendError(getApiError(err).message),
  });

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    sendMutation.mutate();
  };

  // Sort messages oldest first for display
  const sortedMessages = messages ? [...messages].sort((a, b) => 
    new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  ) : [];

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-border">
        <button onClick={onBack} className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-5 h-5" />
        </button>
        {other?.avatar_url ? (
          <img src={other.avatar_url} alt="" className="w-9 h-9 rounded-full object-cover" />
        ) : (
          <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-semibold">
            {other ? initials(other.first_name, other.last_name) : <User className="w-4 h-4" />}
          </div>
        )}
        <div>
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium">{other ? `${other.first_name} ${other.last_name}` : 'Utilisateur'}</p>
            {conversation.type === 'delivery' && (
              <span className="px-1.5 py-0.5 rounded bg-accent/10 text-accent text-[10px] font-medium flex items-center gap-0.5">
                <Package className="w-2.5 h-2.5" /> Colis
              </span>
            )}
          </div>
          {conversation.trip_info && (
            <p className="text-xs text-muted-foreground">
              {conversation.trip_info.from_city} → {conversation.trip_info.to_city}
            </p>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto py-4 space-y-3">
        {isLoading && (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        )}

        {!isLoading && sortedMessages.length === 0 && (
          <div className="text-center py-8 text-muted-foreground text-sm">
            <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-30" />
            Aucun message. Commencez la conversation !
          </div>
        )}

        {sortedMessages.map((msg: Message) => {
          const isSystem = msg.message_type === 'system';
          const isMine = msg.sender_id === user?.id;
          const msgText = msg.content || msg.message_text || '';

          if (isSystem) {
            return (
              <div key={msg.id} className="flex justify-center">
                <p className="text-xs text-muted-foreground bg-secondary/50 px-3 py-1.5 rounded-full">
                  {msgText}
                </p>
              </div>
            );
          }

          return (
            <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm ${
                isMine
                  ? 'bg-primary text-white rounded-br-md'
                  : 'bg-secondary text-foreground rounded-bl-md'
              }`}>
                {!isMine && msg.sender && (
                  <p className="text-xs font-medium mb-1 opacity-70">
                    {msg.sender.first_name}
                  </p>
                )}
                <p>{msgText}</p>
                <p className={`text-xs mt-1 ${isMine ? 'text-white/60' : 'text-muted-foreground'}`}>
                  {formatRelative(msg.created_at)}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      {sendError && <div className="bg-destructive/10 text-destructive text-xs px-3 py-2 rounded-lg mb-2">{sendError}</div>}
      <form onSubmit={handleSend} className="flex items-center gap-2 pt-3 border-t border-border">
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Écrire un message..."
          className="flex-1 h-11 px-4 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-background"
          autoFocus
        />
        <Button type="submit" size="sm" loading={sendMutation.isPending} disabled={!message.trim()}>
          <Send className="w-4 h-4" />
        </Button>
      </form>
    </div>
  );
}

export default function MessagesPage() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [startingConv, setStartingConv] = useState(false);
  const [startError, setStartError] = useState('');

  const bookingId = searchParams.get('booking_id');
  const deliveryId = searchParams.get('delivery_id');

  const { data: conversations, isLoading } = useQuery({
    queryKey: ['conversations'],
    queryFn: () => messagingApi.conversations().then((r) => {
      const d = r.data;
      return Array.isArray(d) ? d : (d as any).data || [];
    }),
    enabled: !!user,
    refetchInterval: 10000,
  });

  // Auto-start conversation from query params (booking_id or delivery_id)
  useEffect(() => {
    if (!user || startingConv) return;
    if (!bookingId && !deliveryId) return;

    const startConv = async () => {
      setStartingConv(true);
      setStartError('');
      try {
        const body: { booking_id?: string; delivery_id?: string } = {};
        if (bookingId) body.booking_id = bookingId;
        if (deliveryId) body.delivery_id = deliveryId;

        const res = await messagingApi.start(body);
        const conv = (res.data as any).data || res.data;
        setSelectedConversation(conv);
        // Clear query params
        setSearchParams({}, { replace: true });
      } catch (err) {
        setStartError(getApiError(err).message);
      } finally {
        setStartingConv(false);
      }
    };

    startConv();
  }, [user, bookingId, deliveryId]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!user) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-6 text-center">
        <MessageCircle className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-30" />
        <p className="text-lg font-medium text-muted-foreground">Connectez-vous pour accéder à vos messages</p>
        <Link to="/login">
          <Button className="mt-4">Se connecter</Button>
        </Link>
      </div>
    );
  }

  // Loading state when starting a conversation from booking/delivery
  if (startingConv) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-6 text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-primary" />
        <p className="text-sm text-muted-foreground">Ouverture de la conversation...</p>
      </div>
    );
  }

  // Vue mobile : afficher soit la liste, soit le chat
  if (selectedConversation) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-4">
        <ChatView conversation={selectedConversation} onBack={() => setSelectedConversation(null)} />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Messages</h1>

      {startError && (
        <div className="bg-destructive/10 text-destructive text-sm px-4 py-3 rounded-xl mb-4">
          {startError}
        </div>
      )}

      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="skeleton h-20 rounded-xl" />)}
        </div>
      )}

      {!isLoading && conversations && conversations.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-lg font-medium">Aucune conversation</p>
          <p className="text-sm mt-1">Vos conversations avec les conducteurs et passagers apparaîtront ici.</p>
          <p className="text-sm mt-2">Réservez un trajet ou envoyez un colis pour démarrer une conversation.</p>
        </div>
      )}

      {!isLoading && conversations && conversations.length > 0 && (
        <ConversationList
          conversations={conversations}
          onSelect={setSelectedConversation}
        />
      )}
    </div>
  );
}
