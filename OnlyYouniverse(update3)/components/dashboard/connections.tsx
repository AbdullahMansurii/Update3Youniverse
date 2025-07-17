"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useConnections } from "@/hooks/use-connections";
import { Check, X, MessageCircle, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/auth-context";

export function Connections() {
  const { user } = useAuth();
  const { 
    connections, 
    pendingRequests, 
    loading, 
    acceptConnectionRequest, 
    rejectConnectionRequest 
  } = useConnections();

  const handleAcceptRequest = async (connectionId: string, requesterName: string) => {
    try {
      await acceptConnectionRequest(connectionId);
      toast.success(`Connected with ${requesterName}!`);
    } catch (error) {
      toast.error("Failed to accept connection request");
    }
  };

  const handleRejectRequest = async (connectionId: string) => {
    try {
      await rejectConnectionRequest(connectionId);
      toast.success("Connection request rejected");
    } catch (error) {
      toast.error("Failed to reject connection request");
    }
  };

  const handleMessage = (connectionName: string) => {
    toast.success(`Opening chat with ${connectionName}`);
  };

  const ConnectionCard = ({ connection, showActions = false }: { connection: any; showActions?: boolean }) => {
    const profile = user?.id === connection.requester_id ? connection.addressee : connection.requester;
    
    return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start space-x-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={profile.image_url} />
            <AvatarFallback>{profile.name[0]}</AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-2">
            <div>
              <h3 className="font-semibold text-lg">{profile.name}</h3>
              <p className="text-sm text-muted-foreground">{profile.university || 'University not specified'}</p>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary">{profile.course || 'Course not specified'}</Badge>
              <Badge variant="outline">{profile.country}</Badge>
            </div>
            <p className="text-sm text-muted-foreground">{profile.bio || 'No bio available'}</p>
            
            {showActions ? (
              <div className="flex space-x-2 pt-2">
                <Button 
                  size="sm" 
                  onClick={() => handleAcceptRequest(connection.id, profile.name)}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Check className="mr-2 h-4 w-4" />
                  Accept
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => handleRejectRequest(connection.id)}
                >
                  <X className="mr-2 h-4 w-4" />
                  Reject
                </Button>
              </div>
            ) : (
              <div className="pt-2">
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => handleMessage(profile.name)}
                >
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Message
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Connections</h1>
        <p className="text-muted-foreground">Manage your network of student connections</p>
      </div>

      <Tabs defaultValue="connections" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="connections" className="flex items-center space-x-2">
            <UserPlus className="h-4 w-4" />
            <span>My Connections ({connections.length})</span>
          </TabsTrigger>
          <TabsTrigger value="requests" className="flex items-center space-x-2">
            <Check className="h-4 w-4" />
            <span>Pending Requests ({pendingRequests.length})</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="connections" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>My Connections</CardTitle>
            </CardHeader>
            {loading && (
              <CardContent>
                <p className="text-center text-muted-foreground">Loading connections...</p>
              </CardContent>
            )}
            <CardContent>
              {connections.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No connections yet.</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Start by searching for students and sending connection requests.
                  </p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  {connections.map((connection) => (
                    <ConnectionCard key={connection.id} connection={connection} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="requests" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pending Connection Requests</CardTitle>
            </CardHeader>
            {loading && (
              <CardContent>
                <p className="text-center text-muted-foreground">Loading requests...</p>
              </CardContent>
            )}
            <CardContent>
              {pendingRequests.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No pending requests.</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    New connection requests will appear here.
                  </p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  {pendingRequests.map((request) => (
                    <ConnectionCard key={request.id} connection={request} showActions={true} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}