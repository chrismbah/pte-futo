/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { fadeInVariants5 } from "../../../animation/variants";
import { NavLink } from "react-router-dom";
import { playSound } from "../../../hooks/useSound";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  type: "text" | "image";
  imageUrl?: string;
  timestamp: Date;
}

interface AIModel {
  id: string;
  name: string;
  provider: string;
  category: "chat" | "image" | "vision";
  description: string;
}

const AI_MODELS: AIModel[] = [
  // Chat Models - ChatGPT 5nano is the best/default for premium
  { id: "gpt-5-nano", name: "ChatGPT 5nano", provider: "OpenAI", category: "chat", description: "Best AI model - Premium recommended" },
  { id: "gpt-4o", name: "GPT-4o", provider: "OpenAI", category: "chat", description: "GPT-4 with vision capabilities" },
  { id: "gpt-4o-mini", name: "GPT-4o Mini", provider: "OpenAI", category: "chat", description: "Faster, more affordable GPT-4" },
  { id: "claude-3-5-sonnet", name: "Claude 3.5 Sonnet", provider: "Anthropic", category: "chat", description: "Anthropic's latest model" },
  { id: "claude-3-opus", name: "Claude 3 Opus", provider: "Anthropic", category: "chat", description: "Most capable Claude model" },
  { id: "gemini-1.5-pro", name: "Gemini 1.5 Pro", provider: "Google", category: "chat", description: "Google's multimodal AI" },
  { id: "llama-3.1-70b", name: "Llama 3.1 70B", provider: "Meta", category: "chat", description: "Meta's open source model" },
  { id: "mistral-large", name: "Mistral Large", provider: "Mistral", category: "chat", description: "Mistral's flagship model" },
  { id: "deepseek-chat", name: "DeepSeek Chat", provider: "DeepSeek", category: "chat", description: "DeepSeek's chat model" },
  // Image Generation Models
  { id: "dall-e-3", name: "DALL-E 3", provider: "OpenAI", category: "image", description: "OpenAI's latest image generation" },
  { id: "flux-1.1-pro", name: "FLUX 1.1 Pro", provider: "Black Forest Labs", category: "image", description: "High quality image generation" },
  { id: "stable-diffusion-xl", name: "Stable Diffusion XL", provider: "Stability AI", category: "image", description: "Open source image generation" },
  // Vision Models
  { id: "gpt-5-nano", name: "ChatGPT 5nano Vision", provider: "OpenAI", category: "vision", description: "Best image understanding - Premium" },
  { id: "gpt-4-vision", name: "GPT-4 Vision", provider: "OpenAI", category: "vision", description: "Image understanding and analysis" },
  { id: "claude-3-vision", name: "Claude 3 Vision", provider: "Anthropic", category: "vision", description: "Analyze images with Claude" },
];

export default function AIAssistant() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState<AIModel>(AI_MODELS[0]);
  const [activeTab, setActiveTab] = useState<"chat" | "image" | "vision">("chat");
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [showModelSelector, setShowModelSelector] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const generateId = () => Math.random().toString(36).substring(7);

  const handleSendMessage = async () => {
    if (!inputValue.trim() && !uploadedImage) return;

    const userMessage: Message = {
      id: generateId(),
      role: "user",
      content: inputValue,
      type: uploadedImage ? "image" : "text",
      imageUrl: uploadedImage || undefined,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      let response: any;

      if (activeTab === "chat") {
        // Chat completion
        const conversationHistory = messages.map((msg) => ({
          role: msg.role,
          content: msg.content,
        }));
        conversationHistory.push({ role: "user", content: inputValue });

        response = await window.puter.ai.chat(inputValue, {
          model: selectedModel.id,
          messages: conversationHistory,
        });

        const assistantMessage: Message = {
          id: generateId(),
          role: "assistant",
          content: typeof response === "string" ? response : response?.message?.content || response?.toString() || "No response",
          type: "text",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantMessage]);
        playSound("ai-done");
      } else if (activeTab === "image") {
        // Image generation - txt2img returns an HTMLImageElement
        const imageResult = await window.puter.ai.txt2img(inputValue, {
          model: selectedModel.id,
        });

        // Get the src from the image element (it's a data URL or URL)
        // The result could be an HTMLImageElement or an object with src
        let imageUrl = "";
        if (typeof imageResult === "string") {
          imageUrl = imageResult;
        } else if (imageResult?.src) {
          imageUrl = imageResult.src;
        } else if (imageResult instanceof HTMLImageElement) {
          imageUrl = imageResult.src;
        } else {
          throw new Error("Could not get image URL from response");
        }

        const assistantMessage: Message = {
          id: generateId(),
          role: "assistant",
          content: `Generated image for: "${inputValue}"`,
          type: "image",
          imageUrl,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantMessage]);
        playSound("ai-done");
      } else if (activeTab === "vision" && uploadedImage) {
        // Image analysis/vision - pass image as second argument
        // Use gpt-5-nano for vision — best model available via puter.js
        const visionModel = "gpt-5-nano";
        
        response = await window.puter.ai.chat(
          inputValue || "Describe this image in detail",
          uploadedImage,
          {
            model: visionModel,
          }
        );

        // Handle response - can be string or object with message.content
        let responseContent = "";
        if (typeof response === "string") {
          responseContent = response;
        } else if (response?.message?.content) {
          responseContent = response.message.content;
        } else if (response?.text) {
          responseContent = response.text;
        } else {
          responseContent = JSON.stringify(response) || "No response received";
        }

        const assistantMessage: Message = {
          id: generateId(),
          role: "assistant",
          content: responseContent,
          type: "text",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantMessage]);
        playSound("ai-done");
        setUploadedImage(null);
      }
    } catch (error: any) {
      console.error("AI Error:", error);
      const errorMessage: Message = {
        id: generateId(),
        role: "assistant",
        content: `Error: ${error?.message || "Something went wrong. Please try again."}`,
        type: "text",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
      playSound("ai-done");
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result as string);
        setActiveTab("vision");
        // Auto-select a vision model
        const visionModel = AI_MODELS.find((m) => m.category === "vision");
        if (visionModel) setSelectedModel(visionModel);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTabChange = (tab: "chat" | "image" | "vision") => {
    setActiveTab(tab);
    const defaultModel = AI_MODELS.find((m) => m.category === tab);
    if (defaultModel) setSelectedModel(defaultModel);
  };

  const filteredModels = AI_MODELS.filter((m) => m.category === activeTab);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-3 xxss:px-4 sm:px-6 lg:px-8">
        <div className="pt-[70px] xxss:pt-[80px] ss:pt-[90px] sm:pt-[105px] pb-6">
          {/* Header */}
          <motion.div
            variants={fadeInVariants5}
            initial="initial"
            animate="animate"
            custom={1}
            className="mb-4 sm:mb-6"
          >
            <div className="flex items-center gap-2 mb-4">
              <NavLink
                to="/dashboard"
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </NavLink>
              <h1 className="text-lg xxss:text-xl sm:text-2xl font-bold text-gray-900">
                AI Assistant
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-gray-600">
              Chat with AI, generate images, or analyze images using multiple AI models.
            </p>
          </motion.div>

          {/* Tab Navigation */}
          <motion.div
            variants={fadeInVariants5}
            initial="initial"
            animate="animate"
            custom={2}
            className="flex gap-1 sm:gap-2 mb-4 bg-white rounded-xl p-1 shadow-sm"
          >
            {[
              { id: "chat", label: "Chat", shortLabel: "Chat", icon: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" },
              { id: "image", label: "Generate Image", shortLabel: "Generate", icon: "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" },
              { id: "vision", label: "Analyze Image", shortLabel: "Analyze", icon: "M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id as "chat" | "image" | "vision")}
                className={`flex-1 flex items-center justify-center gap-1 ss:gap-2 px-1 xxss:px-2 sm:px-4 py-2 ss:py-2.5 sm:py-3 rounded-lg text-sss xxss:text-xss ss:text-xs sm:text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? "bg-green2 text-white shadow-md"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <svg className="w-3.5 h-3.5 xxss:w-4 xxss:h-4 sm:w-5 sm:h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
                </svg>
                <span className="hidden xss:inline ss:hidden sm:inline">{tab.shortLabel}</span>
                <span className="hidden ss:inline sm:hidden">{tab.shortLabel}</span>
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </motion.div>

          {/* Model Selector */}
          <motion.div
            variants={fadeInVariants5}
            initial="initial"
            animate="animate"
            custom={3}
            className="relative mb-4"
          >
            <button
              onClick={() => setShowModelSelector(!showModelSelector)}
              className="w-full flex items-center justify-between px-2 xxss:px-3 sm:px-4 py-2 sm:py-3 bg-white rounded-xl shadow-sm border border-gray-200 hover:border-green2 transition-colors"
            >
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-7 h-7 xxss:w-8 xxss:h-8 sm:w-10 sm:h-10 rounded-full bg-green2/10 flex items-center justify-center flex-shrink-0">
                  <svg className="w-3.5 h-3.5 xxss:w-4 xxss:h-4 sm:w-5 sm:h-5 text-green2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="text-left min-w-0">
                  <p className="text-xss xxss:text-xs sm:text-sm font-semibold text-gray-900 truncate">{selectedModel.name}</p>
                  <p className="text-sss xxss:text-xss sm:text-xs text-gray-500 truncate">{selectedModel.provider}</p>
                </div>
              </div>
              <svg className={`w-4 h-4 sm:w-5 sm:h-5 text-gray-400 transition-transform flex-shrink-0 ${showModelSelector ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {showModelSelector && (
              <div className="absolute z-50 top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-gray-200 max-h-56 sm:max-h-64 overflow-y-auto">
                {filteredModels.map((model) => (
                  <button
                    key={model.id}
                    onClick={() => {
                      setSelectedModel(model);
                      setShowModelSelector(false);
                    }}
                    className={`w-full flex items-center gap-2 xxss:gap-3 px-2 xxss:px-3 sm:px-4 py-2 xxss:py-2.5 sm:py-3 hover:bg-gray-50 transition-colors ${
                      selectedModel.id === model.id ? "bg-green2/5" : ""
                    }`}
                  >
                    <div className={`w-6 h-6 xxss:w-7 xxss:h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      selectedModel.id === model.id ? "bg-green2 text-white" : "bg-gray-100 text-gray-600"
                    }`}>
                      <svg className="w-3 h-3 xxss:w-3.5 xxss:h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <div className="text-left flex-1 min-w-0">
                      <p className="text-xss xxss:text-xs sm:text-sm font-medium text-gray-900 truncate">{model.name}</p>
                      <p className="text-sss xxss:text-xss sm:text-xs text-gray-500 truncate">{model.description}</p>
                    </div>
                    {selectedModel.id === model.id && (
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 text-green2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Chat Area */}
          <motion.div
            variants={fadeInVariants5}
            initial="initial"
            animate="animate"
            custom={4}
            className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
          >
            {/* Messages */}
            <div className="h-[280px] xxss:h-[300px] ss:h-[350px] sm:h-[400px] md:h-[450px] overflow-y-auto p-2 xxss:p-3 sm:p-4 space-y-3 sm:space-y-4">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center px-2 xxss:px-4">
                  <div className="w-12 h-12 xxss:w-16 xxss:h-16 sm:w-20 sm:h-20 rounded-full bg-green2/10 flex items-center justify-center mb-3 sm:mb-4">
                    <svg className="w-6 h-6 xxss:w-8 xxss:h-8 sm:w-10 sm:h-10 text-green2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <h3 className="text-xs xxss:text-sm ss:text-base sm:text-lg font-semibold text-gray-900 mb-1 sm:mb-2">
                    {activeTab === "chat" && "Start a conversation"}
                    {activeTab === "image" && "Generate an image"}
                    {activeTab === "vision" && "Analyze an image"}
                  </h3>
                  <p className="text-xss xxss:text-xs sm:text-sm text-gray-500 max-w-sm">
                    {activeTab === "chat" && "Ask questions, get explanations, or have a conversation with AI."}
                    {activeTab === "image" && "Describe what you want to see and AI will create it for you."}
                    {activeTab === "vision" && "Upload an image and ask questions about it."}
                  </p>
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[90%] xxss:max-w-[85%] sm:max-w-[75%] rounded-xl xxss:rounded-2xl px-2 xxss:px-3 sm:px-4 py-1.5 xxss:py-2 sm:py-3 ${
                        message.role === "user"
                          ? "bg-green2 text-white"
                          : "bg-gray-100 text-gray-900"
                      }`}
                    >
                      {message.imageUrl && (
                        <img
                          src={message.imageUrl}
                          alt="Message attachment"
                          className="rounded-lg mb-2 max-w-full h-auto max-h-40 xxss:max-h-52 sm:max-h-64 object-contain"
                        />
                      )}
                      <p className="text-xss xxss:text-xs sm:text-sm whitespace-pre-wrap">{message.content}</p>
                      <p className={`text-sss xxss:text-xss mt-0.5 xxss:mt-1 ${message.role === "user" ? "text-white/70" : "text-gray-400"}`}>
                        {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>
                ))
              )}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 rounded-2xl px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Uploaded Image Preview */}
            {uploadedImage && (
              <div className="px-2 xxss:px-3 sm:px-4 py-1.5 xxss:py-2 border-t border-gray-100">
                <div className="relative inline-block">
                  <img
                    src={uploadedImage}
                    alt="Upload preview"
                    className="h-14 xxss:h-16 sm:h-20 w-auto rounded-lg object-cover"
                  />
                  <button
                    onClick={() => setUploadedImage(null)}
                    className="absolute -top-1.5 -right-1.5 xxss:-top-2 xxss:-right-2 w-5 h-5 xxss:w-6 xxss:h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                  >
                    <svg className="w-3 h-3 xxss:w-4 xxss:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            )}

            {/* Input Area */}
            <div className="border-t border-gray-200 p-2 xxss:p-3 sm:p-4">
              <div className="flex items-end gap-1.5 xxss:gap-2 sm:gap-3">
                {/* Image Upload Button */}
                {(activeTab === "vision") && (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-shrink-0 w-8 h-8 xxss:w-10 xxss:h-10 sm:w-12 sm:h-12 rounded-lg xxss:rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                  >
                    <svg className="w-4 h-4 xxss:w-5 xxss:h-5 sm:w-6 sm:h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </button>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />

                {/* Text Input */}
                <div className="flex-1 relative">
                  <textarea
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={
                      activeTab === "chat"
                        ? "Type your message..."
                        : activeTab === "image"
                        ? "Describe the image..."
                        : "Ask about the image..."
                    }
                    rows={1}
                    className="w-full resize-none rounded-lg xxss:rounded-xl border border-gray-200 px-2 xxss:px-3 sm:px-4 py-1.5 xxss:py-2 sm:py-3 pr-10 sm:pr-12 text-xss xxss:text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-green2 focus:border-transparent"
                    style={{ minHeight: "36px", maxHeight: "100px" }}
                  />
                </div>

                {/* Send Button */}
                <button
                  onClick={handleSendMessage}
                  disabled={isLoading || (!inputValue.trim() && !uploadedImage)}
                  className={`flex-shrink-0 w-8 h-8 xxss:w-10 xxss:h-10 sm:w-12 sm:h-12 rounded-lg xxss:rounded-xl flex items-center justify-center transition-all ${
                    isLoading || (!inputValue.trim() && !uploadedImage)
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                      : "bg-green2 text-white hover:bg-green2/90 shadow-md hover:shadow-lg"
                  }`}
                >
                  <svg className="w-4 h-4 xxss:w-5 xxss:h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </div>
            </div>
          </motion.div>

          {/* Quick Actions / Tips */}
          <motion.div
            variants={fadeInVariants5}
            initial="initial"
            animate="animate"
            custom={5}
            className="mt-3 sm:mt-4 grid grid-cols-2 sm:grid-cols-4 gap-1.5 xxss:gap-2"
          >
            {activeTab === "chat" && (
              <>
                <button
                  onClick={() => setInputValue("Explain the circulatory system")}
                  className="text-left p-2 xxss:p-2.5 sm:p-3 bg-white rounded-lg xxss:rounded-xl border border-gray-200 hover:border-green2 transition-colors"
                >
                  <p className="text-xss xxss:text-xs sm:text-sm font-medium text-gray-900 truncate">Circulatory System</p>
                  <p className="text-sss xxss:text-xss text-gray-500">Learn anatomy</p>
                </button>
                <button
                  onClick={() => setInputValue("What are the symptoms of malaria?")}
                  className="text-left p-2 xxss:p-2.5 sm:p-3 bg-white rounded-lg xxss:rounded-xl border border-gray-200 hover:border-green2 transition-colors"
                >
                  <p className="text-xss xxss:text-xs sm:text-sm font-medium text-gray-900 truncate">Malaria Symptoms</p>
                  <p className="text-sss xxss:text-xss text-gray-500">Medical query</p>
                </button>
                <button
                  onClick={() => setInputValue("Help me understand pharmacokinetics")}
                  className="text-left p-2 xxss:p-2.5 sm:p-3 bg-white rounded-lg xxss:rounded-xl border border-gray-200 hover:border-green2 transition-colors"
                >
                  <p className="text-xss xxss:text-xs sm:text-sm font-medium text-gray-900 truncate">Pharmacokinetics</p>
                  <p className="text-sss xxss:text-xss text-gray-500">Drug study</p>
                </button>
                <button
                  onClick={() => setInputValue("Quiz me on medical terminology")}
                  className="text-left p-2 xxss:p-2.5 sm:p-3 bg-white rounded-lg xxss:rounded-xl border border-gray-200 hover:border-green2 transition-colors"
                >
                  <p className="text-xss xxss:text-xs sm:text-sm font-medium text-gray-900 truncate">Medical Quiz</p>
                  <p className="text-sss xxss:text-xss text-gray-500">Test yourself</p>
                </button>
              </>
            )}
            {activeTab === "image" && (
              <>
                <button
                  onClick={() => setInputValue("A detailed anatomical illustration of the human heart")}
                  className="text-left p-2 xxss:p-2.5 sm:p-3 bg-white rounded-lg xxss:rounded-xl border border-gray-200 hover:border-green2 transition-colors"
                >
                  <p className="text-xss xxss:text-xs sm:text-sm font-medium text-gray-900 truncate">Heart Anatomy</p>
                  <p className="text-sss xxss:text-xss text-gray-500">Medical illustration</p>
                </button>
                <button
                  onClick={() => setInputValue("A medical student studying in a library")}
                  className="text-left p-2 xxss:p-2.5 sm:p-3 bg-white rounded-lg xxss:rounded-xl border border-gray-200 hover:border-green2 transition-colors"
                >
                  <p className="text-xss xxss:text-xs sm:text-sm font-medium text-gray-900 truncate">Study Scene</p>
                  <p className="text-sss xxss:text-xss text-gray-500">Lifestyle image</p>
                </button>
                <button
                  onClick={() => setInputValue("Cross-section of a human brain with labeled parts")}
                  className="text-left p-2 xxss:p-2.5 sm:p-3 bg-white rounded-lg xxss:rounded-xl border border-gray-200 hover:border-green2 transition-colors"
                >
                  <p className="text-xss xxss:text-xs sm:text-sm font-medium text-gray-900 truncate">Brain Diagram</p>
                  <p className="text-sss xxss:text-xss text-gray-500">Educational</p>
                </button>
                <button
                  onClick={() => setInputValue("A beautiful sunset over a medical campus")}
                  className="text-left p-2 xxss:p-2.5 sm:p-3 bg-white rounded-lg xxss:rounded-xl border border-gray-200 hover:border-green2 transition-colors"
                >
                  <p className="text-xss xxss:text-xs sm:text-sm font-medium text-gray-900 truncate">Campus View</p>
                  <p className="text-sss xxss:text-xss text-gray-500">Scenic image</p>
                </button>
              </>
            )}
            {activeTab === "vision" && (
              <>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="text-left p-2 xxss:p-2.5 sm:p-3 bg-white rounded-lg xxss:rounded-xl border border-gray-200 hover:border-green2 transition-colors col-span-2 sm:col-span-4"
                >
                  <div className="flex items-center gap-2 xxss:gap-3">
                    <div className="w-8 h-8 xxss:w-10 xxss:h-10 rounded-lg bg-green2/10 flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 xxss:w-5 xxss:h-5 text-green2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                      </svg>
                    </div>
                    <div className="min-w-0">
                      <p className="text-xss xxss:text-xs sm:text-sm font-medium text-gray-900">Upload an Image</p>
                      <p className="text-sss xxss:text-xss text-gray-500 truncate">Analyze X-rays, diagrams, notes, or any image</p>
                    </div>
                  </div>
                </button>
              </>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
