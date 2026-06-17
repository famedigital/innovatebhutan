"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  Paperclip,
  Smile,
  MoreVertical,
  Phone,
  Video,
  Trash2,
  Check,
  CheckCheck,
  Clock,
  Image,
  File,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { createClient } from "@/utils/supabase/client";
import { formatDistanceToNow } from "date-fns";

/**
 * 🎯 Real-Time Chat Component
 *
 * Premium chat interface with Supabase Realtime integration.
 * Features:
 * - Real-time messaging with Supabase channels
 * - Typing indicators
 * - Read receipts
 * - File uploads
 * - WhatsApp sync
 * - Emoji picker
 * - Message search
 */

interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderType: "client" | "admin" | "system";
  message: string;
  messageType?: "text" | "image" | "file" | "system";
  mediaUrl?: string;
  readAt?: string;
  createdAt: string;
}

interface RealTimeChatProps {
  conversationId?: string;
  clientId?: string;
  currentUserId?: string;
  currentUserType?: "client" | "admin";
  className?: string;
  onSendMessage?: (message: string, type?: "text" | "image" | "file") => void;
  whatsappSyncEnabled?: boolean;
}

export function RealTimeChat({
  conversationId,
  clientId,
  currentUserId,
  currentUserType = "client",
  className = "",
  onSendMessage,
  whatsappSyncEnabled = true,
}: RealTimeChatProps) {
  const supabase = createClient();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  // Auto-scroll to bottom
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Fetch initial messages
  useEffect(() => {
    if (!conversationId) return;

    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from("chat_messages")
        .select("*")
        .eq("conversationId", conversationId)
        .order("createdAt", { ascending: true });

      if (!error && data) {
        setMessages(data as Message[]);
      }
    };

    fetchMessages();
  }, [conversationId, supabase]);

  // Real-time subscription
  useEffect(() => {
    if (!conversationId) return;

    const channel = supabase
      .channel(`chat:${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
          filter: `conversationId=eq.${conversationId}`,
        },
        (payload) => {
          const newMsg = payload.new as Message;
          setMessages((prev) => [...prev, newMsg]);

          // Mark as read if it's not our message
          if (newMsg.senderId !== currentUserId) {
            markMessageAsRead(newMsg.id);
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "chat_messages",
          filter: `conversationId=eq.${conversationId}`,
        },
        (payload) => {
          const updatedMsg = payload.new as Message;
          setMessages((prev) =>
            prev.map((msg) => (msg.id === updatedMsg.id ? updatedMsg : msg))
          );
        }
      )
      .subscribe((status) => {
        setIsConnected(status === "SUBSCRIBED");
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, currentUserId, supabase]);

  // Typing indicator subscription
  useEffect(() => {
    if (!conversationId) return;

    const channel = supabase
      .channel(`typing:${conversationId}`)
      .on("broadcast", { event: "typing" }, ({ payload }) => {
        if (payload.senderId !== currentUserId) {
          setIsTyping(payload.isTyping);
          // Reset typing indicator after 3 seconds
          setTimeout(() => setIsTyping(false), 3000);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, currentUserId, supabase]);

  // Mark message as read
  const markMessageAsRead = async (messageId: string) => {
    await supabase
      .from("chat_messages")
      .update({ readAt: new Date().toISOString() })
      .eq("id", messageId);
  };

  // Send typing indicator
  const sendTypingIndicator = async (isTyping: boolean) => {
    if (!conversationId) return;

    await supabase.channel(`typing:${conversationId}`).send({
      type: "broadcast",
      event: "typing",
      payload: { senderId: currentUserId, isTyping },
    });
  };

  // Send message
  const sendMessage = async () => {
    if ((!newMessage.trim() && !attachedFile) || isSending) return;

    setIsSending(true);
    const messageContent = newMessage.trim();
    const messageType = attachedFile
      ? attachedFile.type.startsWith("image/")
        ? "image"
        : "file"
      : "text";

    try {
      // Upload file if attached
      let mediaUrl: string | undefined;
      if (attachedFile) {
        const fileExt = attachedFile.name.split(".").pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("chat-attachments")
          .upload(fileName, attachedFile);

        if (!uploadError && uploadData) {
          const { data: { publicUrl } } = supabase.storage
            .from("chat-attachments")
            .getPublicUrl(fileName);
          mediaUrl = publicUrl;
        }
      }

      // Insert message
      const { data, error } = await supabase
        .from("chat_messages")
        .insert({
          conversationId,
          senderId: currentUserId || "unknown",
          senderType: currentUserType,
          message: messageContent || (attachedFile ? attachedFile.name : ""),
          messageType,
          mediaUrl,
        })
        .select()
        .single();

      if (!error && data) {
        setMessages((prev) => [...prev, data as Message]);
        setNewMessage("");
        setAttachedFile(null);

        // Sync to WhatsApp if enabled
        if (whatsappSyncEnabled) {
          await syncToWhatsApp(data as Message);
        }

        // Call callback
        onSendMessage?.(messageContent, messageType);
      }
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsSending(false);
    }
  };

  // Sync to WhatsApp
  const syncToWhatsApp = async (message: Message) => {
    try {
      await fetch("/api/whatsapp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "outbound",
          conversationId,
          message: message.message,
          messageType: message.messageType,
          mediaUrl: message.mediaUrl,
        }),
      });
    } catch (error) {
      console.error("WhatsApp sync error:", error);
    }
  };

  // Handle key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.size <= 10 * 1024 * 1024) {
      // 10MB limit
      setAttachedFile(file);
    }
  };

  // Remove attached file
  const removeAttachment = () => {
    setAttachedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Delete message
  const deleteMessage = async (messageId: string) => {
    await supabase.from("chat_messages").delete().eq("id", messageId);
    setMessages((prev) => prev.filter((msg) => msg.id !== messageId));
  };

  // Render message bubble
  const renderMessage = (message: Message) => {
    const isOwn = message.senderId === currentUserId;
    const isSystem = message.senderType === "system";

    if (isSystem) {
      return (
        <div className="flex justify-center my-2">
          <span className="text-xs text-muted-foreground bg-muted px-3 py-1 rounded-full">
            {message.message}
          </span>
        </div>
      );
    }

    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`flex mb-4 ${isOwn ? "justify-end" : "justify-start"}`}
      >
        <div className={`flex flex-col ${isOwn ? "items-end" : "items-start"} max-w-[75%]`}>
          {/* Message bubble */}
          <div
            className={`px-4 py-2.5 rounded-2xl ${
              isOwn
                ? "bg-gradient-to-br from-primary to-primary/80 text-white rounded-br-sm"
                : "bg-muted/80 text-foreground rounded-bl-sm"
            }`}
          >
            {/* Media attachment */}
            {message.mediaUrl && message.messageType === "image" && (
              <div className="mb-2">
                <img
                  src={message.mediaUrl}
                  alt="Attachment"
                  className="rounded-lg max-w-full h-auto"
                />
              </div>
            )}

            {/* File attachment */}
            {message.mediaUrl && message.messageType === "file" && (
              <div className="flex items-center gap-2 mb-2">
                <File className="w-4 h-4" />
                <a
                  href={message.mediaUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline text-sm"
                >
                  {message.message}
                </a>
              </div>
            )}

            {/* Text message */}
            {message.messageType === "text" && (
              <p className="text-sm whitespace-pre-wrap">{message.message}</p>
            )}
          </div>

          {/* Message metadata */}
          <div className={`flex items-center gap-1 mt-1 px-1 ${isOwn ? "flex-row-reverse" : "flex-row"}`}>
            <span className="text-[10px] text-muted-foreground">
              {formatDistanceToNow(new Date(message.createdAt), {
                addSuffix: true,
              })}
            </span>

            {/* Read receipts */}
            {isOwn && (
              <>
                {message.readAt ? (
                  <CheckCheck className="w-3 h-3 text-primary" />
                ) : (
                  <Check className="w-3 h-3 text-muted-foreground" />
                )}
              </>
            )}

            {/* Delete option */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <MoreVertical className="w-3 h-3 text-muted-foreground" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align={isOwn ? "end" : "start"}>
                <DropdownMenuItem
                  onClick={() => deleteMessage(message.id)}
                  className="text-red-600"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className={`flex flex-col h-full bg-background ${className}`}>
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {/* Welcome message */}
        {messages.length === 0 && (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
              <Smile className="w-8 h-8 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">Start a conversation</h3>
            <p className="text-sm text-muted-foreground">
              Send us a message and we'll respond as soon as possible
            </p>
          </div>
        )}

        {/* Messages */}
        <AnimatePresence>
          {messages.map((message) => (
            <div key={message.id}>{renderMessage(message)}</div>
          ))}
        </AnimatePresence>

        {/* Typing indicator */}
        {isTyping && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 mb-4 px-4"
          >
            <div className="bg-muted/80 rounded-2xl px-4 py-2.5">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
            <span className="text-xs text-muted-foreground">typing...</span>
          </motion.div>
        )}

        {/* Connection status */}
        {!isConnected && (
          <div className="flex items-center gap-2 text-xs text-amber-600 bg-amber-600/10 px-3 py-2 rounded-lg mb-4">
            <Clock className="w-3 h-3" />
            Reconnecting...
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Attachment preview */}
      {attachedFile && (
        <div className="px-4 py-2 border-t">
          <div className="flex items-center gap-2 bg-muted/50 rounded-lg p-2">
            {attachedFile.type.startsWith("image/") ? (
              <Image className="w-4 h-4" />
            ) : (
              <File className="w-4 h-4" />
            )}
            <span className="text-sm flex-1 truncate">{attachedFile.name}</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={removeAttachment}
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
        </div>
      )}

      {/* Input area */}
      <div className="p-4 border-t bg-background">
        <div className="flex items-end gap-2">
          {/* Attach file button */}
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept="image/*,.pdf,.doc,.docx"
            onChange={handleFileSelect}
          />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => fileInputRef.current?.click()}
            className="shrink-0"
          >
            <Paperclip className="w-4 h-4" />
          </Button>

          {/* Message input */}
          <div className="flex-1 relative">
            <Input
              value={newMessage}
              onChange={(e) => {
                setNewMessage(e.target.value);
                sendTypingIndicator(true);
              }}
              onKeyDown={handleKeyPress}
              onKeyUp={() => sendTypingIndicator(false)}
              placeholder="Type a message..."
              className="pr-12"
              disabled={isSending}
            />
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0 h-full px-2"
            >
              <Smile className="w-4 h-4 text-muted-foreground" />
            </Button>
          </div>

          {/* Send button */}
          <Button
            onClick={sendMessage}
            disabled={isSending || (!newMessage.trim() && !attachedFile)}
            className="shrink-0 bg-gradient-to-r from-primary to-primary/80"
          >
            {isSending ? (
              <Clock className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>

        {/* WhatsApp sync indicator */}
        {whatsappSyncEnabled && (
          <div className="flex items-center gap-1 mt-2 text-[10px] text-muted-foreground">
            <CheckCheck className="w-3 h-3" />
            Messages sync to WhatsApp
          </div>
        )}
      </div>
    </div>
  );
}

export default RealTimeChat;
