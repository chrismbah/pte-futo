/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

// ── Inline markdown renderer ──────────────────────────────────────────────────
function renderMarkdown(text: string): JSX.Element {
  const lines = text.split("\n");
  const elements: JSX.Element[] = [];

  const inlineFormat = (line: string, key: string): JSX.Element => {
    const parts = line.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g);
    return (
      <span key={key}>
        {parts.map((part, pi) => {
          if (part.startsWith("**") && part.endsWith("**"))
            return <strong key={pi} className="font-bold">{part.slice(2, -2)}</strong>;
          if (part.startsWith("*") && part.endsWith("*"))
            return <em key={pi} className="italic">{part.slice(1, -1)}</em>;
          if (part.startsWith("`") && part.endsWith("`"))
            return <code key={pi} className="bg-black/10 px-1 py-0.5 rounded text-xs font-mono">{part.slice(1, -1)}</code>;
          return <span key={pi}>{part}</span>;
        })}
      </span>
    );
  };

  lines.forEach((line, idx) => {
    const key = `md-${idx}`;
    if (/^### (.+)/.test(line)) {
      elements.push(<h3 key={key} className="text-xs font-bold mt-3 mb-0.5">{line.replace(/^### /, "")}</h3>);
    } else if (/^## (.+)/.test(line)) {
      elements.push(<h2 key={key} className="text-sm font-bold mt-3 mb-1 border-b border-current/20 pb-0.5">{line.replace(/^## /, "")}</h2>);
    } else if (/^# (.+)/.test(line)) {
      elements.push(<h1 key={key} className="text-sm font-extrabold mt-3 mb-1">{line.replace(/^# /, "")}</h1>);
    } else if (/^[-*•] (.+)/.test(line)) {
      elements.push(
        <li key={key} className="flex gap-1.5 text-sm leading-relaxed">
          <span className="font-bold flex-shrink-0 mt-0.5">•</span>
          <span>{inlineFormat(line.replace(/^[-*•] /, ""), key + "i")}</span>
        </li>
      );
    } else if (/^\d+\. (.+)/.test(line)) {
      const num = line.match(/^(\d+)\./)?.[1];
      elements.push(
        <li key={key} className="flex gap-1.5 text-sm leading-relaxed">
          <span className="font-bold flex-shrink-0 min-w-[16px]">{num}.</span>
          <span>{inlineFormat(line.replace(/^\d+\. /, ""), key + "i")}</span>
        </li>
      );
    } else if (line.trim() === "") {
      elements.push(<div key={key} className="h-1.5" />);
    } else {
      elements.push(<p key={key} className="text-sm leading-relaxed">{inlineFormat(line, key + "i")}</p>);
    }
  });

  return <div className="space-y-0.5">{elements}</div>;
}

// Declare puter as a global variable
declare global {
  interface Window {
    puter: {
      ai: {
        chat: (
          message: string | Array<{ role: string; content: string }>,
          imageOrOptions?: string | {
            model?: string;
            stream?: boolean;
            messages?: Array<{ role: string; content: any }>;
          },
          options?: {
            model?: string;
            stream?: boolean;
          }
        ) => Promise<any>;
        txt2img: (
          prompt: string,
          optionsOrTestMode?: boolean | { model?: string; testMode?: boolean }
        ) => Promise<HTMLImageElement>;
      };
    };
  }
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export const AIChatbot = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingContent]);

  // Hide chatbot on the premium package page
  const isPremiumPage = location.pathname === "/u/premium";
  if (isPremiumPage) {
    return null;
  }

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    const currentInput = input;
    setInput("");
    setIsLoading(true);
    setStreamingContent("");

    try {
      // Build conversation history for context
      const conversationHistory = [
        {
          role: "system",
          content:
            "You are a helpful assistant for EBSU (Ebonyi State University) medical students. You help with academic questions, course information, medical topics, and general guidance. Be friendly, knowledgeable, and concise. When answering medical questions, be accurate but remind students to always consult their professors and textbooks for exam-specific information.",
        },
        ...messages.map((m) => ({ role: m.role, content: m.content })),
        { role: "user", content: currentInput },
      ];

      // Use Puter.js AI chat with streaming - ChatGPT 5nano (best model)
      const response = await window.puter.ai.chat(conversationHistory, {
        model: "gpt-5-nano",
        stream: true,
      });

      let fullContent = "";

      // Handle streaming response
      for await (const part of response) {
        if (part?.text) {
          fullContent += part.text;
          setStreamingContent(fullContent);
        }
      }

      // Add the complete assistant message
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: fullContent,
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setStreamingContent("");
    } catch (error: any) {
      console.error("Chat error:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content:
          "Sorry, I encountered an error. Please try again in a moment.",
      };
      setMessages((prev) => [...prev, errorMessage]);
      setStreamingContent("");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([]);
    setStreamingContent("");
  };

  return (
    <>
      {/* Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-12 h-12 sm:w-14 sm:h-14 bg-green2 hover:bg-green1 text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-300"
      >
        {isOpen ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 sm:h-6 sm:w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 sm:h-6 sm:w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
        )}
      </button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-20 right-2 left-2 sm:left-auto sm:right-6 z-50 w-auto sm:w-[380px] h-[70vh] sm:h-[500px] max-h-[500px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-200"
          >
            {/* Header */}
            <div className="bg-green2 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-sm">EBSU AI Assistant</h3>
                  <p className="text-xs text-white/80">Powered by ChatGPT 5nano</p>
                </div>
              </div>
              <button
                onClick={clearChat}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
                title="Clear chat"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white">
              {messages.length === 0 && !streamingContent && (
                <div className="text-center text-gray-500 mt-16">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-12 w-12 mx-auto mb-3 text-gray-300"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                  <p className="text-sm font-medium text-gray-700">Start a conversation!</p>
                  <p className="text-xs mt-1 text-gray-500">
                    Ask me about courses, medical topics, or anything else.
                  </p>
                </div>
              )}
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                      message.role === "user"
                        ? "bg-green2 text-white rounded-br-md whitespace-pre-wrap"
                        : "bg-gray-100 text-gray-800 rounded-bl-md"
                    }`}
                  >
                    {message.role === "user"
                      ? message.content
                      : renderMarkdown(message.content)}
                  </div>
                </div>
              ))}
              {/* Streaming response */}
              {streamingContent && (
                <div className="flex justify-start">
                  <div className="max-w-[80%] p-3 rounded-2xl rounded-bl-md bg-gray-100 text-gray-800 text-sm">
                    {renderMarkdown(streamingContent)}
                    <span className="inline-block w-1 h-4 bg-gray-400 ml-1 animate-pulse" />
                  </div>
                </div>
              )}
              {/* Loading indicator */}
              {isLoading && !streamingContent && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 p-3 rounded-2xl rounded-bl-md">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      ></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-gray-200 bg-white">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type a message..."
                  disabled={isLoading}
                  className="flex-1 p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green2 focus:border-transparent outline-none text-sm text-gray-800 disabled:bg-gray-100 bg-white"
                />
                <button
                  onClick={sendMessage}
                  disabled={isLoading || !input.trim()}
                  className="bg-green2 hover:bg-green1 disabled:bg-gray-300 text-white p-3 rounded-xl transition-colors"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                  </svg>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
