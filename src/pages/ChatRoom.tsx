import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft, 
  Send, 
  Copy, 
  Users, 
  Shield, 
  Trash2,
  CheckCircle,
  Crown,
  AlertCircle,
  Plus
} from 'lucide-react';
import { useChat } from '@/hooks/useChat';
import { useToast } from '@/hooks/use-toast';
import { ThemeToggle } from '@/components/theme-toggle';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';

export default function ChatRoom() {
  const { roomKey } = useParams<{ roomKey: string }>();
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const [copied, setCopied] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const {
    messages,
    users,
    loading,
    sending,
    roomExists,
    roomHost,
    isCreator,
    currentUserId,
    sendMessage,
    createRoom
  } = useChat(roomKey || '');

  const isHost = currentUserId === roomHost;

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Don't auto-create rooms - let user explicitly decide

  const handleSendMessage = async () => {
    if (!message.trim()) return;
    
    await sendMessage(message);
    setMessage('');
  };

  const handleCreateRoom = async () => {
    const success = await createRoom();
    if (success) {
      toast({
        title: "Room Created!",
        description: "You are now the host of this room.",
      });
    }
  };

  const handleCopyRoomKey = async () => {
    if (!roomKey) return;
    
    try {
      await navigator.clipboard.writeText(roomKey);
      setCopied(true);
      toast({
        title: "Copied!",
        description: "Room key copied to clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy room key",
        variant: "destructive"
      });
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (!roomKey) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Invalid Room</h1>
          <Button onClick={() => navigate('/')}>Return Home</Button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Loading Room...</h1>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        </div>
      </div>
    );
  }

  if (!loading && !roomExists) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <AlertCircle className="h-16 w-16 mx-auto mb-4 text-destructive" />
          <h1 className="text-2xl font-bold mb-4">Room Not Found</h1>
          <p className="text-muted-foreground mb-6">
            The room key <span className="font-mono text-primary">{roomKey}</span> doesn't exist.
          </p>
          <div className="space-y-4">
            <Button onClick={handleCreateRoom} className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Create This Room
            </Button>
            <Button variant="outline" onClick={() => navigate('/')} className="w-full">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Return Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="icon" onClick={() => navigate('/')}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-lg font-semibold">OneTC Room</h1>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Shield className="h-3 w-3" />
                <span>End-to-End Encrypted</span>
                <Trash2 className="h-3 w-3" />
                <span>Self-Destructing</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <div className="flex items-center space-x-2">
                <Badge variant="secondary">{users.length} online</Badge>
                {users.map((user) => (
                  <Badge 
                    key={user.id} 
                    variant={user.isHost ? "default" : "outline"}
                    className="flex items-center gap-1"
                  >
                    {user.isHost && <Crown className="h-3 w-3" />}
                    {user.name}
                    {user.isHost && " (HOST)"}
                  </Badge>
                ))}
              </div>
            </div>
            <ThemeToggle />
          </div>
        </div>
        
        {/* Room Key Display */}
        <div className="px-4 pb-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Share this room key to invite others:
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center space-x-2">
                <div className="flex-1 bg-muted rounded-lg p-3 text-center">
                  <div className="font-mono text-2xl font-bold tracking-widest text-primary">
                    {roomKey}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Easy to share by voice or text
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={handleCopyRoomKey}
                  className="shrink-0"
                >
                  {copied ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 flex flex-col">
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>This room is secure and empty.</p>
                <p className="text-sm">Send the first encrypted message!</p>
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${
                    msg.sender_id === currentUserId ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-[70%] rounded-lg p-3 ${
                      msg.sender_id === currentUserId
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    <div className="text-xs opacity-75 mb-1 flex items-center gap-1">
                      {msg.sender_id === roomHost && <Crown className="h-3 w-3" />}
                      {msg.sender_id.substring(0, 8)}
                      {msg.sender_id === roomHost && " (HOST)"}
                      • {formatTime(msg.created_at)}
                    </div>
                    <div className="break-words">
                      {msg.decrypted_content || '[Decryption failed]'}
                    </div>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Message Input */}
        <div className="border-t bg-card p-4">
          <div className="flex space-x-2">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your encrypted message..."
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
              disabled={sending || (roomFull && !isHost)}
            />
            <Button 
              onClick={handleSendMessage} 
              disabled={!message.trim() || sending || (roomFull && !isHost)}
              size="icon"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <div className="text-xs text-muted-foreground mt-2 text-center">
            Messages are encrypted with room key • Room will self-destruct when empty
          </div>
        </div>
      </div>
    </div>
  );
}