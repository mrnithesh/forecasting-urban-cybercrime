import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, X, Send, Bot, User } from "lucide-react";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Hello! I'm your Cyber Awareness Assistant. How can I help you today? I can guide you on reporting cybercrimes or answer security questions." }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage }),
      });

      const data = await response.json();
      
      if (data.error) throw new Error(data.error);

      setMessages(prev => [...prev, { role: "assistant", content: data.response }]);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, { role: "assistant", content: "Sorry, I encountered an error. Please try again later." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!isOpen && (
        <Button 
          onClick={() => setIsOpen(true)} 
          className="rounded-full h-14 w-14 shadow-lg bg-primary hover:bg-primary/90 transition-transform hover:scale-105"
        >
          <MessageCircle className="h-6 w-6 text-white" />
        </Button>
      )}

      {isOpen && (
        <Card className="w-[350px] sm:w-[400px] h-[500px] flex flex-col shadow-xl border-primary/20 animate-in fade-in slide-in-from-bottom-5 duration-300">
          <CardHeader className="p-4 border-b flex flex-row items-center justify-between bg-primary/5">
            <div className="flex items-center gap-2">
                <div className="bg-primary/10 p-1.5 rounded-full">
                    <Bot className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="text-sm font-medium">Cyber Awareness Assistant</CardTitle>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="h-8 w-8 hover:bg-primary/10">
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          
          <CardContent className="flex-1 p-0 overflow-hidden bg-background/50 backdrop-blur-sm">
            <ScrollArea className="h-full p-4">
              <div className="flex flex-col gap-4">
                {messages.map((msg, i) => (
                  <div
                    key={i}
                    className={cn(
                      "flex gap-2 max-w-[85%]",
                      msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
                    )}
                  >
                    <div className={cn(
                        "h-8 w-8 rounded-full flex items-center justify-center shrink-0 shadow-sm",
                        msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-card border"
                    )}>
                        {msg.role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4 text-primary" />}
                    </div>
                    <div
                      className={cn(
                        "rounded-2xl p-3 text-sm shadow-sm",
                        msg.role === "user"
                          ? "bg-primary text-primary-foreground rounded-tr-none"
                          : "bg-card border rounded-tl-none"
                      )}
                    >
                        {msg.role === "assistant" ? (
                             <div className="prose prose-sm dark:prose-invert max-w-none">
                                <ReactMarkdown>{msg.content}</ReactMarkdown>
                             </div>
                        ) : (
                            msg.content
                        )}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex gap-2 mr-auto max-w-[85%]">
                     <div className="h-8 w-8 rounded-full flex items-center justify-center shrink-0 bg-card border shadow-sm">
                        <Bot className="h-4 w-4 text-primary" />
                    </div>
                    <div className="bg-card border rounded-2xl rounded-tl-none p-3 text-sm shadow-sm flex items-center">
                      <div className="flex gap-1">
                        <span className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce"></span>
                        <span className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce delay-75"></span>
                        <span className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce delay-150"></span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
          </CardContent>

          <CardFooter className="p-3 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <form onSubmit={handleSubmit} className="flex w-full gap-2">
              <Input
                placeholder="Type your message..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={isLoading}
                className="flex-1"
              />
              <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}

