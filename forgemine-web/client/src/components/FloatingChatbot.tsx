import { useState, useRef, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { MessageSquare, X, Send, Loader2, Sparkles, User, Minimize2 } from "lucide-react";
import { Streamdown } from "streamdown";
import { trackConversion } from "@/lib/tracking";

type Message = {
  role: "system" | "user" | "assistant";
  content: string;
};

const SUGGESTED_PROMPTS = [
  "¿Qué servicios ofrecen?",
  "¿Cuánto cuesta reparar un balde?",
  "¿Trabajan con Komatsu PC7000?",
  "¿Conviene reparar o comprar nuevo?",
];

export default function FloatingChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [hasInteracted, setHasInteracted] = useState(false);

  const chatMutation = trpc.chatbot.chat.useMutation({
    onSuccess: (data) => {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.response },
      ]);
    },
    onError: () => {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Disculpa, estoy teniendo problemas técnicos. Por favor, contáctanos por WhatsApp al **+56 9 9277 9872**.",
        },
      ]);
    },
  });

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      const viewport = scrollAreaRef.current.querySelector(
        "[data-radix-scroll-area-viewport]"
      ) as HTMLDivElement;
      if (viewport) {
        requestAnimationFrame(() => {
          viewport.scrollTo({
            top: viewport.scrollHeight,
            behavior: "smooth",
          });
        });
      }
    }
  }, [messages, chatMutation.isPending]);

  // Focus textarea when chat opens
  useEffect(() => {
    if (isOpen && textareaRef.current) {
      setTimeout(() => textareaRef.current?.focus(), 300);
    }
  }, [isOpen]);

  const handleOpen = () => {
    if (!isOpen) {
      trackConversion({
        event_name: 'chatbot_open',
        event_category: 'engagement',
        event_label: 'floating_chatbot',
      });
    }
    setIsOpen(!isOpen);
  };

  const sendMessage = (content: string) => {
    if (!content.trim() || chatMutation.isPending) return;

    trackConversion({
      event_name: 'chatbot_message',
      event_category: 'engagement',
      event_label: content.trim().substring(0, 50),
    });

    setHasInteracted(true);
    const newMessages: Message[] = [
      ...messages,
      { role: "user", content: content.trim() },
    ];
    setMessages(newMessages);
    setInput("");

    chatMutation.mutate({ messages: newMessages });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const displayMessages = messages.filter((msg) => msg.role !== "system");

  return (
    <>
      {/* Chat Window */}
      <div
        className={cn(
          "fixed bottom-24 right-4 z-50 w-[380px] max-w-[calc(100vw-2rem)] transition-all duration-300 ease-in-out",
          isOpen
            ? "opacity-100 translate-y-0 pointer-events-auto"
            : "opacity-0 translate-y-4 pointer-events-none"
        )}
      >
        <div className="flex flex-col h-[520px] bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-[oklch(0.35_0.05_70)] to-[oklch(0.25_0.03_70)] border-b border-border">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-primary" />
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-card" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground font-display tracking-wide">
                  Asesor FORGEMINE
                </h3>
                <p className="text-xs text-muted-foreground">
                  Experto en baldes mineros
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
            >
              <Minimize2 className="w-4 h-4" />
            </Button>
          </div>

          {/* Messages Area */}
          <div ref={scrollAreaRef} className="flex-1 overflow-hidden">
            {displayMessages.length === 0 && !hasInteracted ? (
              <div className="flex h-full flex-col p-4">
                <div className="flex flex-1 flex-col items-center justify-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <Sparkles className="w-8 h-8 text-primary opacity-60" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-foreground mb-1">
                      ¡Hola! Soy tu asesor técnico
                    </p>
                    <p className="text-xs text-muted-foreground max-w-[260px]">
                      Pregúntame sobre reparación, blindaje o reconstrucción de
                      baldes mineros
                    </p>
                  </div>

                  <div className="flex flex-col gap-2 w-full mt-2">
                    {SUGGESTED_PROMPTS.map((prompt, index) => (
                      <button
                        key={index}
                        onClick={() => sendMessage(prompt)}
                        disabled={chatMutation.isPending}
                        className="text-left px-3 py-2 text-xs rounded-lg border border-border bg-secondary/30 hover:bg-secondary/60 hover:border-primary/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-muted-foreground hover:text-foreground"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <ScrollArea className="h-full">
                <div className="flex flex-col space-y-3 p-4">
                  {displayMessages.map((message, index) => (
                    <div
                      key={index}
                      className={cn(
                        "flex gap-2",
                        message.role === "user"
                          ? "justify-end items-start"
                          : "justify-start items-start"
                      )}
                    >
                      {message.role === "assistant" && (
                        <div className="w-7 h-7 shrink-0 mt-1 rounded-full bg-primary/10 flex items-center justify-center">
                          <Sparkles className="w-3.5 h-3.5 text-primary" />
                        </div>
                      )}

                      <div
                        className={cn(
                          "max-w-[80%] rounded-xl px-3 py-2",
                          message.role === "user"
                            ? "bg-primary text-primary-foreground"
                            : "bg-secondary/50 text-foreground"
                        )}
                      >
                        {message.role === "assistant" ? (
                          <div className="prose prose-sm dark:prose-invert max-w-none [&_p]:text-xs [&_p]:leading-relaxed [&_p]:mb-2 [&_p:last-child]:mb-0 [&_strong]:text-primary [&_ul]:text-xs [&_ol]:text-xs [&_li]:text-xs">
                            <Streamdown>{message.content}</Streamdown>
                          </div>
                        ) : (
                          <p className="whitespace-pre-wrap text-xs leading-relaxed">
                            {message.content}
                          </p>
                        )}
                      </div>

                      {message.role === "user" && (
                        <div className="w-7 h-7 shrink-0 mt-1 rounded-full bg-secondary flex items-center justify-center">
                          <User className="w-3.5 h-3.5 text-secondary-foreground" />
                        </div>
                      )}
                    </div>
                  ))}

                  {chatMutation.isPending && (
                    <div className="flex items-start gap-2">
                      <div className="w-7 h-7 shrink-0 mt-1 rounded-full bg-primary/10 flex items-center justify-center">
                        <Sparkles className="w-3.5 h-3.5 text-primary" />
                      </div>
                      <div className="rounded-xl bg-secondary/50 px-3 py-2">
                        <div className="flex items-center gap-1.5">
                          <div className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce [animation-delay:0ms]" />
                          <div className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce [animation-delay:150ms]" />
                          <div className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce [animation-delay:300ms]" />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>
            )}
          </div>

          {/* Input Area */}
          <form
            onSubmit={handleSubmit}
            className="flex gap-2 p-3 border-t border-border bg-background/50"
          >
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Escribe tu consulta..."
              className="flex-1 max-h-20 resize-none min-h-9 text-xs rounded-xl bg-secondary/30 border-border focus:border-primary/50"
              rows={1}
            />
            <Button
              type="submit"
              size="icon"
              disabled={!input.trim() || chatMutation.isPending}
              className="shrink-0 h-9 w-9 rounded-xl bg-primary hover:bg-primary/90"
            >
              {chatMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </form>
        </div>
      </div>

      {/* Floating Button */}
      <button
        onClick={handleOpen}
        className={cn(
          "fixed bottom-6 right-24 z-50 w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all duration-300",
          isOpen
            ? "bg-muted hover:bg-muted/80 text-muted-foreground scale-90"
            : "bg-primary hover:bg-primary/90 text-primary-foreground shadow-[0_0_30px_oklch(0.75_0.18_70/0.3)] hover:shadow-[0_0_40px_oklch(0.75_0.18_70/0.5)] hover:scale-105"
        )}
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <MessageSquare className="w-6 h-6" />
        )}
      </button>

      {/* Notification badge when closed */}
      {!isOpen && !hasInteracted && (
        <div className="fixed bottom-[72px] right-[88px] z-50 pointer-events-none">
          <div className="bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse">
            IA
          </div>
        </div>
      )}
    </>
  );
}
