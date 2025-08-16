import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Send, Mic } from 'lucide-react';

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

const Chat = () => {
  const { category } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'ai',
      content: `Hello! I'm here to help you with your ${category || 'life'} journey. What's on your mind today?`,
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const categoryData = {
    health: { icon: '💪', name: 'Health & Fitness', color: 'text-health', bg: 'bg-health' },
    money: { icon: '💰', name: 'Financial Wealth', color: 'text-money', bg: 'bg-money' },
    career: { icon: '🚀', name: 'Career & Work', color: 'text-career', bg: 'bg-career' },
    social: { icon: '👥', name: 'Social Life', color: 'text-social', bg: 'bg-social' },
    love: { icon: '❤️', name: 'Love & Romance', color: 'text-love', bg: 'bg-love' },
    growth: { icon: '🌱', name: 'Personal Growth', color: 'text-growth', bg: 'bg-growth' },
    spirituality: { icon: '🧘', name: 'Spirituality', color: 'text-spirituality', bg: 'bg-spirituality' },
  }[category || 'growth'] || { icon: '🌟', name: 'General Chat', color: 'text-primary', bg: 'bg-primary' };

  const suggestedPrompts = [
    `How can I improve my ${categoryData.name.toLowerCase()}?`,
    `What are some quick wins for ${categoryData.name.toLowerCase()}?`,
    `I'm struggling with motivation in ${categoryData.name.toLowerCase()}`,
    `Set a goal for my ${categoryData.name.toLowerCase()}`,
  ];

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: `That's a great question about ${categoryData.name.toLowerCase()}! I understand you're looking to make progress in this area. Let me help you break this down into actionable steps...`,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
    }, 2000);
  };

  const handlePromptClick = (prompt: string) => {
    setInputValue(prompt);
  };

  return (
    <div className="min-h-screen bg-background particles">
      {/* Header */}
      <motion.header 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex items-center justify-between p-4 glass-card m-4 rounded-2xl"
      >
        <div className="flex items-center space-x-4">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigate('/dashboard')}
            className="hover:bg-surface"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 ${categoryData.bg} rounded-full flex items-center justify-center text-white text-lg`}>
              {categoryData.icon}
            </div>
            <div>
              <h1 className="font-semibold">{categoryData.name}</h1>
              <p className="text-xs text-muted-foreground">AI Chat Assistant</p>
            </div>
          </div>
        </div>
        
        <Badge variant="secondary" className={categoryData.color}>
          Score: 75%
        </Badge>
      </motion.header>

      {/* Chat Container */}
      <div className="flex flex-col h-[calc(100vh-120px)] max-w-4xl mx-auto p-4">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-4 mb-6">
          <AnimatePresence>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <Card className={`max-w-lg p-4 ${
                  message.type === 'user' 
                    ? 'bg-primary text-primary-foreground ml-12' 
                    : 'glass-card mr-12'
                }`}>
                  <p className="text-sm">{message.content}</p>
                  <p className={`text-xs mt-2 ${
                    message.type === 'user' 
                      ? 'text-primary-foreground/70' 
                      : 'text-muted-foreground'
                  }`}>
                    {message.timestamp.toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </p>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Typing Indicator */}
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start"
            >
              <Card className="glass-card p-4 mr-12">
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce delay-100"></div>
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce delay-200"></div>
                  </div>
                  <span className="text-xs text-muted-foreground">AI is typing...</span>
                </div>
              </Card>
            </motion.div>
          )}
        </div>

        {/* Suggested Prompts */}
        {messages.length === 1 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4"
          >
            <p className="text-sm text-muted-foreground mb-3">Try asking:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {suggestedPrompts.map((prompt, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => handlePromptClick(prompt)}
                  className="glass-card text-left justify-start h-auto p-3 whitespace-normal"
                >
                  {prompt}
                </Button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Input Area */}
        <Card className="glass-card-elevated p-4">
          <div className="flex items-center space-x-3">
            <div className="flex-1 flex items-center space-x-2">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={`Ask about ${categoryData.name.toLowerCase()}...`}
                className="flex-1 glass-card border-0"
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              />
              <Button 
                variant="ghost" 
                size="sm"
                className="hover:bg-surface"
              >
                <Mic className="w-4 h-4" />
              </Button>
            </div>
            <Button 
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isTyping}
              className="bg-primary hover:bg-primary-glow text-primary-foreground"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Chat;