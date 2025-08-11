import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

import { generateRoomKey } from '@/lib/encryption';
import { useToast } from '@/hooks/use-toast';
import { ThemeToggle } from '@/components/theme-toggle';
import { supabase } from '@/integrations/supabase/client';
import { Logo } from '@/components/Logo';
import { getClientId } from '@/lib/client';
import { Mail } from 'lucide-react';

const Index = () => {
  const [roomKey, setRoomKey] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleCreateRoom = async () => {
    setLoading(true);
    try {
      const newRoomKey = generateRoomKey();
      
      // Create room in database
      const { error } = await supabase
        .from('rooms')
        .insert({ id: newRoomKey, creator_id: getClientId() });

      if (error) {
        console.error('Error creating room:', error);
        toast({
          title: "Error",
          description: "Failed to create room. Please try again.",
          variant: "destructive"
        });
        return;
      }

      navigate(`/room/${newRoomKey}`);
    } catch (error) {
      console.error('Error creating room:', error);
      toast({
        title: "Error",
        description: "Failed to create room. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleJoinRoom = () => {
    if (!roomKey.trim()) {
      toast({
        title: "Invalid Room Key",
        description: "Please enter a valid room key.",
        variant: "destructive"
      });
      return;
    }
    navigate(`/room/${roomKey.trim()}`);
  };

  return (
    <div className="min-h-screen bg-background relative">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-lg md:max-w-2xl space-y-8">
          {/* Header */}
          <div className="text-center">
            <div className="flex items-center justify-center mb-6">
              <Logo showText size={64} />
            </div>
            <h1 className="sr-only">OneTC - One-Time End-to-End Encrypted Chat</h1>
          </div>

          {/* Actions */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-center">Create New Room</CardTitle>
                <CardDescription className="text-center">
                  Start a new encrypted chat room
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={handleCreateRoom} 
                  className="w-full" 
                  size="lg"
                  disabled={loading}
                >
                  {loading ? "Creating..." : "Create a New Room"}
                </Button>
              </CardContent>
            </Card>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or</span>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-center">Join Existing Room</CardTitle>
                <CardDescription className="text-center">
                  Enter a room key to join an existing chat
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  type="text"
                  placeholder="Enter room key..."
                  value={roomKey}
                  onChange={(e) => setRoomKey(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleJoinRoom()}
                />
                <Button 
                  onClick={handleJoinRoom} 
                  variant="outline" 
                  className="w-full" 
                  size="lg"
                  disabled={!roomKey.trim()}
                >
                  Join Room
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Security Notice */}
          <div className="text-center text-xs text-muted-foreground space-y-1">
            <p>🔒 Messages are encrypted end-to-end</p>
            <p>🗑️ Rooms self-destruct when empty</p>
            <p>👤 No registration required</p>
          </div>

          <footer className="mt-6 flex justify-center">
            <Button asChild variant="ghost" size="sm" className="gap-2">
              <a href="mailto:arunthomas04042001@gmail.com" aria-label="Reach out to the developer via email">
                <Mail className="h-4 w-4" />
                Reach out to the developer
              </a>
            </Button>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default Index;
