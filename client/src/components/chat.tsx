import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare, Send, X, User, Shield } from "lucide-react";
import { isUnauthorizedError } from "@/lib/authUtils";

export default function Chat() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: messages, isLoading } = useQuery({
    queryKey: ['/api/chat', user?.id],
    enabled: isAuthenticated && !!user?.id,
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Требуется авторизация",
          description: "Войдите в систему для использования чата",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
      }
    },
  });

  // WebSocket connection
  useEffect(() => {
    if (!isAuthenticated || !user?.id) return;

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      setIsConnected(true);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'chat') {
          // Invalidate queries to refresh messages
          queryClient.invalidateQueries({ queryKey: ['/api/chat', user.id] });
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    ws.onclose = () => {
      setIsConnected(false);
    };

    ws.onerror = () => {
      setIsConnected(false);
      toast({
        title: "Ошибка соединения",
        description: "Не удалось подключиться к чату",
        variant: "destructive",
      });
    };

    return () => {
      ws.close();
    };
  }, [isAuthenticated, user?.id, queryClient, toast]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (!message.trim() || !wsRef.current || !user?.id) return;

    const messageData = {
      type: 'chat',
      data: {
        userId: user.id,
        message: message.trim(),
        isFromAdmin: user.isAdmin || false,
      }
    };

    try {
      wsRef.current.send(JSON.stringify(messageData));
      setMessage("");
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось отправить сообщение",
        variant: "destructive",
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Chat Widget */}
      {isOpen && (
        <Card className="w-80 h-96 mb-4 shadow-2xl border-forest-dark/20">
          <CardHeader className="bg-forest-dark text-white p-4 rounded-t-xl">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-amber rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-forest-dark" />
                </div>
                <div>
                  <CardTitle className="text-sm font-semibold">
                    Чат с администратором
                  </CardTitle>
                  <div className="flex items-center space-x-1">
                    <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`} />
                    <span className="text-xs">
                      {isConnected ? 'онлайн' : 'не в сети'}
                    </span>
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="text-white hover:text-amber h-6 w-6"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="p-0 flex flex-col h-80">
            {/* Messages Area */}
            <ScrollArea className="flex-1 p-4 bg-gray-50">
              {isLoading ? (
                <div className="text-center text-gray-500 py-8">
                  Загрузка сообщений...
                </div>
              ) : messages && messages.length > 0 ? (
                <div className="space-y-3">
                  {messages.map((msg: any) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.isFromAdmin ? 'justify-start' : 'justify-end'}`}
                    >
                      <div
                        className={`max-w-xs p-3 rounded-lg ${
                          msg.isFromAdmin
                            ? 'bg-white border border-gray-200'
                            : 'bg-forest-dark text-white'
                        }`}
                      >
                        <div className="flex items-center space-x-2 mb-1">
                          {msg.isFromAdmin && (
                            <Shield className="h-3 w-3 text-amber" />
                          )}
                          <span className="text-xs font-medium">
                            {msg.isFromAdmin ? 'Администратор' : 'Вы'}
                          </span>
                        </div>
                        <p className="text-sm">{msg.message}</p>
                        <span className="text-xs opacity-70 mt-1 block">
                          {new Date(msg.createdAt).toLocaleTimeString('ru-RU', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              ) : (
                <div className="text-center text-gray-500 py-8">
                  <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Начните разговор!</p>
                  <p className="text-xs mt-1">
                    Наши специалисты готовы помочь
                  </p>
                </div>
              )}
            </ScrollArea>
            
            {/* Message Input */}
            <div className="p-4 border-t bg-white">
              <div className="flex space-x-2">
                <Input
                  placeholder="Введите сообщение..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1 text-sm"
                  disabled={!isConnected}
                />
                <Button
                  onClick={sendMessage}
                  disabled={!message.trim() || !isConnected}
                  size="icon"
                  className="bg-forest-dark hover:bg-forest-light text-white"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              {!isConnected && (
                <p className="text-xs text-red-500 mt-1">
                  Нет соединения с сервером
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Toggle Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-forest-dark hover:bg-forest-light text-white w-14 h-14 rounded-full shadow-2xl transition-all transform hover:scale-110"
        size="icon"
      >
        <MessageSquare className="h-6 w-6" />
      </Button>
    </div>
  );
}
