import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { LifeVisualizationGraph } from '@/components/LifeVisualizationGraph';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

interface LifeCategory {
  id: string;
  name: string;
  score: number;
  weight: number;
  color: string;
  icon: string;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [overallScore] = useState(75);
  
  const categories: LifeCategory[] = [
    { id: 'health', name: 'Health', score: 75, weight: 9, color: 'hsl(var(--health))', icon: '💪' },
    { id: 'money', name: 'Money', score: 60, weight: 8, color: 'hsl(var(--money))', icon: '💰' },
    { id: 'career', name: 'Career', score: 85, weight: 8, color: 'hsl(var(--career))', icon: '🚀' },
    { id: 'social', name: 'Social', score: 70, weight: 7, color: 'hsl(var(--social))', icon: '👥' },
    { id: 'love', name: 'Love', score: 90, weight: 9, color: 'hsl(var(--love))', icon: '❤️' },
    { id: 'growth', name: 'Growth', score: 80, weight: 8, color: 'hsl(var(--growth))', icon: '🌱' },
    { id: 'spirituality', name: 'Spirituality', score: 65, weight: 6, color: 'hsl(var(--spirituality))', icon: '🧘' },
  ];

  const achievements = [
    { id: 1, title: 'Morning Routine Master', category: 'health', date: 'Today' },
    { id: 2, title: 'Network Builder', category: 'social', date: 'Yesterday' },
    { id: 3, title: 'Learning Streak', category: 'growth', date: '2 days ago' },
  ];

  const suggestedFocus = categories
    .filter(cat => cat.score < 70)
    .sort((a, b) => (b.weight - a.weight))
    .slice(0, 2);

  const handleNodeClick = (category: LifeCategory) => {
    navigate(`/chat/${category.id}`);
  };

  return (
    <div className="min-h-screen bg-background particles">
      {/* Header */}
      <motion.header 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex items-center justify-between p-6 glass-card m-4 rounded-2xl"
      >
        <div className="flex items-center space-x-4">
          <h1 className="text-3xl font-bold text-gradient">Mojo</h1>
          <Badge variant="secondary" className="text-sm">
            Life Score: {overallScore}%
          </Badge>
        </div>
        
        <div className="flex items-center space-x-4">
          <Button 
            variant="outline" 
            onClick={() => navigate('/onboarding')}
            className="glass-card"
          >
            Setup
          </Button>
          <div className="score-ring w-12 h-12 flex items-center justify-center rounded-full bg-surface">
            <span className="text-sm font-bold text-foreground z-10">{overallScore}</span>
          </div>
        </div>
      </motion.header>

      <div className="flex gap-6 p-6">
        {/* Main Graph */}
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="flex-1"
        >
          <Card className="glass-card-elevated p-8 h-[600px] hover-lift">
            <h2 className="text-xl font-semibold mb-6 text-center">Life Overview</h2>
            <LifeVisualizationGraph 
              categories={categories}
              onNodeClick={handleNodeClick}
              width={800}
              height={500}
            />
          </Card>
        </motion.div>

        {/* Side Panel */}
        <motion.div 
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="w-80 space-y-6"
        >
          {/* Category Breakdown */}
          <Card className="glass-card p-6 hover-lift">
            <h3 className="font-semibold mb-4">Category Breakdown</h3>
            <div className="space-y-3">
              {categories.map((category) => (
                <div key={category.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{category.icon}</span>
                    <span className="text-sm">{category.name}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Progress 
                      value={category.score} 
                      className="w-16 h-2" 
                      style={{ 
                        background: `${category.color}20`,
                      }}
                    />
                    <span className="text-xs text-muted-foreground w-8">
                      {category.score}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Recent Achievements */}
          <Card className="glass-card p-6 hover-lift">
            <h3 className="font-semibold mb-4">Recent Achievements</h3>
            <div className="space-y-3">
              {achievements.map((achievement) => (
                <motion.div 
                  key={achievement.id}
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.6 + achievement.id * 0.1 }}
                  className="flex items-start space-x-3 p-3 rounded-lg bg-surface/30 hover:bg-surface/50 transition-colors"
                >
                  <div className="w-2 h-2 rounded-full bg-primary mt-2 animate-pulse-glow"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{achievement.title}</p>
                    <p className="text-xs text-muted-foreground">{achievement.date}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </Card>

          {/* Suggested Focus Areas */}
          {suggestedFocus.length > 0 && (
            <Card className="glass-card p-6 hover-lift">
              <h3 className="font-semibold mb-4">Suggested Focus</h3>
              <div className="space-y-3">
                {suggestedFocus.map((category) => (
                  <motion.div
                    key={category.id}
                    whileHover={{ scale: 1.02 }}
                    className="p-3 rounded-lg bg-surface/30 hover:bg-surface/50 transition-colors cursor-pointer"
                    onClick={() => handleNodeClick(category)}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-lg">{category.icon}</span>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{category.name}</p>
                        <p className="text-xs text-muted-foreground">
                          Score: {category.score}% • Priority: {category.weight}/10
                        </p>
                      </div>
                      <div className="w-2 h-2 rounded-full bg-primary animate-pulse-glow"></div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </Card>
          )}
        </motion.div>
      </div>

      {/* Bottom Action Bar */}
      <motion.div 
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="fixed bottom-6 left-1/2 transform -translate-x-1/2"
      >
        <Card className="glass-card-elevated p-4 flex items-center space-x-4">
          <Button 
            className="bg-primary hover:bg-primary-glow text-primary-foreground"
            onClick={() => navigate('/chat')}
          >
            Quick Chat
          </Button>
          <Button variant="outline" className="glass-card">
            Add Entry
          </Button>
          <Button variant="outline" className="glass-card">
            View Insights
          </Button>
        </Card>
      </motion.div>
    </div>
  );
};

export default Dashboard;