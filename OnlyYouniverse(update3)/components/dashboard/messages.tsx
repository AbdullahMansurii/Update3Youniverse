"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useMessages } from "@/hooks/use-messages";
import { useAuth } from "@/contexts/auth-context";
import { Send, Search, MoreVertical } from "lucide-react";
import { formatDateToNow } from "@/lib/utils";
import { toast } from "sonner";

export function Messages() {
  const { user } = useAuth();
  const { chats, messages, loading, sendMessage, fetchMessagesWithUser } = useMessages();
  const [selectedChat, setSelectedChat] = useState<any>(null);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const handleSendMessage = async () => {
    if (newMessage.trim() && selectedChat) {
      try {
        await sendMessage(selectedChat.participant.id, newMessage);
        setNewMessage("");
      } catch (error) {
        toast.error("Failed to send message");
      }
    }
  };

  const handleChatSelect = async (chat: any) => {
    setSelectedChat(chat);
    if (chat.participant.id) {
      await fetchMessagesWithUser(chat.participant.id);
    }
  };

  useEffect(() => {
    if (chats.length > 0 && !selectedChat) {
      handleChatSelect(chats[0]);
    }
  }, [chats]);

  const filteredChats = chats.filter(chat =>
    chat.participant.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Messages</h1>
          <p className="text-muted-foreground">Chat with your connections</p>
        </div>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Messages</h1>
        <p className="text-muted-foreground">Chat with your connections</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 h-[600px]">
        {/* Chat List */}
        <Card>
          <CardHeader>
            <CardTitle>Chats</CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[400px]">
              {filteredChats.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">
                  No conversations yet
                </div>
              ) : (
                filteredChats.map((chat) => (
                  <div
                    key={chat.participant.id}
                    className={`p-4 cursor-pointer hover:bg-muted/50 border-b ${
                      selectedChat?.participant.id === chat.participant.id ? "bg-muted" : ""
                    }`}
                    onClick={() => handleChatSelect(chat)}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={chat.participant.image_url} />
                          <AvatarFallback>{chat.participant.name[0]}</AvatarFallback>
                        </Avatar>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-semibold text-sm truncate">{chat.participant.name}</p>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs text-muted-foreground">
                              {formatDateToNow(chat.lastMessage.created_at)}
                            </span>
                            {chat.unreadCount > 0 && (
                              <Badge className="h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                                {chat.unreadCount}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground truncate mt-1">
                          {chat.lastMessage.content}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Chat Window */}
        <Card className="lg:col-span-2">
          {selectedChat ? (
            <>
              <CardHeader className="border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={selectedChat.participant.image_url} />
                      <AvatarFallback>{selectedChat.participant.name[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold">{selectedChat.participant.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {selectedChat.participant.university || 'University not specified'}
                      </p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[400px] p-4">
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${
                          message.sender_id === user?.id ? "justify-end" : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                            message.sender_id === user?.id
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted"
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                          <p className="text-xs opacity-70 mt-1">
                            {formatDateToNow(message.created_at)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
                <div className="border-t p-4">
                  <div className="flex space-x-2">
                    <Input
                      placeholder="Type a message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                    />
                    <Button onClick={handleSendMessage}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground">Select a chat to start messaging</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}