"use client";

import { useState, useRef, useEffect } from "react";
import styles from "./ChatInterface.module.css";
import { Message } from "@/lib/types";

interface ChatInterfaceProps {
  messages: Message[];
  onSendMessage: (content: string, image?: string | null) => Promise<void>;
  isLoading: boolean;
}

export default function ChatInterface({ messages, onSendMessage, isLoading }: ChatInterfaceProps) {
  const [input, setInput] = useState("");
  const [attachment, setAttachment] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = () => {
    if ((input.trim() || attachment) && !isLoading) {
      onSendMessage(input.trim(), attachment);
      setInput("");
      setAttachment(null);
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAttachment(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
    if (e.target) e.target.value = '';
  };

  return (
    <div className={styles.chatContainer}>
      <div className={styles.messagesArea}>
        {messages.length === 0 && (
          <div style={{ margin: "auto", textAlign: "center", color: "var(--text-secondary)" }}>
            <h2 style={{ color: "var(--text-primary)", marginBottom: "1rem" }}>How can I help you today?</h2>
            <p>Tell me what you ate for lunch, or what workout you did.</p>
          </div>
        )}
        
        {messages.map((msg) => (
          <div key={msg.id} className={`${styles.messageWrapper} ${styles[msg.role]}`}>
            <div className={styles.messageBubble}>
              {msg.image && (
                <img src={msg.image} alt="Attached" style={{ maxWidth: "100%", borderRadius: "8px", marginBottom: "0.5rem", display: "block" }} />
              )}
              {msg.content}
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className={`${styles.messageWrapper} ${styles.ai}`}>
            <div className={styles.typingIndicator}>
              <div className={styles.dot}></div>
              <div className={styles.dot}></div>
              <div className={styles.dot}></div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className={styles.inputArea}>
        {attachment && (
          <div style={{ position: "relative", display: "inline-block", marginBottom: "1rem", padding: "0.5rem", background: "rgba(255,255,255,0.05)", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.1)" }}>
            <img src={attachment} alt="Preview" style={{ height: "60px", borderRadius: "4px" }} />
            <button 
              onClick={() => setAttachment(null)}
              style={{ position: "absolute", top: "-8px", right: "-8px", background: "#ef4444", color: "white", border: "none", borderRadius: "50%", width: "20px", height: "20px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", boxShadow: "0 2px 5px rgba(0,0,0,0.3)" }}
              title="Remove Attachment"
            >
              ✕
            </button>
          </div>
        )}
        <div className={styles.inputForm}>
          <input 
            type="file" 
            accept="image/*" 
            ref={fileInputRef} 
            style={{ display: "none" }} 
            onChange={handleFileChange}
          />
          <button 
            className={styles.sendBtn} 
            style={{ marginRight: "0.5rem", background: "transparent", color: "var(--text-secondary)" }}
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
            title="Attach Image"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path></svg>
          </button>
          
          <textarea
            ref={textareaRef}
            className={styles.textarea}
            value={input}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder="Log meals, exercises, or ask about an image..."
            rows={1}
            disabled={isLoading}
          />
          <button 
            className={styles.sendBtn}
            onClick={handleSend}
            disabled={(!input.trim() && !attachment) || isLoading}
            aria-label="Send message"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22 2L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
