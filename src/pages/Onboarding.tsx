import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';

const Onboarding = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    priorities: {
      health: 8,
      money: 7,
      career: 8,
      social: 6,
      love: 9,
      growth: 8,
      spirituality: 5,
    },
    goals: [],
  });

  const totalSteps = 4;
  const progress = ((currentStep + 1) / totalSteps) * 100;

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Save data and navigate to dashboard
      localStorage.setItem('mojoUserData', JSON.stringify(formData));
      navigate('/dashboard');
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const updatePriority = (category: string, value: number[]) => {
    setFormData(prev => ({
      ...prev,
      priorities: {
        ...prev.priorities,
        [category]: value[0],
      },
    }));
  };

  const stepVariants = {
    initial: { opacity: 0, x: 50 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -50 },
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <motion.div {...stepVariants} className="space-y-6">
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-bold text-gradient">Welcome to Mojo</h2>
              <p className="text-lg text-muted-foreground">
                Let's personalize your life tracking experience
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">What should we call you?</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter your name"
                  className="glass-card"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="age">Your age (optional)</Label>
                <Input
                  id="age"
                  type="number"
                  value={formData.age}
                  onChange={(e) => setFormData(prev => ({ ...prev, age: e.target.value }))}
                  placeholder="25"
                  className="glass-card"
                />
              </div>
            </div>
          </motion.div>
        );

      case 1:
        return (
          <motion.div {...stepVariants} className="space-y-6">
            <div className="text-center space-y-4">
              <h2 className="text-2xl font-bold">Life Priority Settings</h2>
              <p className="text-muted-foreground">
                How important is each area of life to you? (1-10)
              </p>
            </div>
            
            <div className="space-y-6">
              {Object.entries(formData.priorities).map(([category, value]) => {
                const categoryData = {
                  health: { icon: '💪', name: 'Health & Fitness' },
                  money: { icon: '💰', name: 'Financial Wealth' },
                  career: { icon: '🚀', name: 'Career & Work' },
                  social: { icon: '👥', name: 'Social Life' },
                  love: { icon: '❤️', name: 'Love & Romance' },
                  growth: { icon: '🌱', name: 'Personal Growth' },
                  spirituality: { icon: '🧘', name: 'Spirituality' },
                }[category];

                return (
                  <div key={category} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{categoryData?.icon}</span>
                        <Label className="text-sm font-medium">{categoryData?.name}</Label>
                      </div>
                      <Badge variant="secondary" className="min-w-[3rem] justify-center">
                        {value}/10
                      </Badge>
                    </div>
                    <Slider
                      value={[value]}
                      onValueChange={(val) => updatePriority(category, val)}
                      max={10}
                      min={1}
                      step={1}
                      className="w-full"
                    />
                  </div>
                );
              })}
            </div>
          </motion.div>
        );

      case 2:
        return (
          <motion.div {...stepVariants} className="space-y-6">
            <div className="text-center space-y-4">
              <h2 className="text-2xl font-bold">Current Life Assessment</h2>
              <p className="text-muted-foreground">
                How satisfied are you currently with each area? (0-100%)
              </p>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              {Object.entries(formData.priorities).map(([category]) => {
                const categoryData = {
                  health: { icon: '💪', name: 'Health & Fitness', color: 'text-health' },
                  money: { icon: '💰', name: 'Financial Wealth', color: 'text-money' },
                  career: { icon: '🚀', name: 'Career & Work', color: 'text-career' },
                  social: { icon: '👥', name: 'Social Life', color: 'text-social' },
                  love: { icon: '❤️', name: 'Love & Romance', color: 'text-love' },
                  growth: { icon: '🌱', name: 'Personal Growth', color: 'text-growth' },
                  spirituality: { icon: '🧘', name: 'Spirituality', color: 'text-spirituality' },
                }[category];

                return (
                  <Card key={category} className="glass-card p-4 hover-lift">
                    <div className="flex items-center space-x-3">
                      <span className="text-xl">{categoryData?.icon}</span>
                      <div className="flex-1">
                        <h4 className="font-medium">{categoryData?.name}</h4>
                        <div className="flex items-center space-x-2 mt-2">
                          <Slider
                            defaultValue={[50]}
                            max={100}
                            min={0}
                            step={5}
                            className="flex-1"
                          />
                          <span className={`text-sm font-medium ${categoryData?.color} min-w-[3rem]`}>
                            50%
                          </span>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </motion.div>
        );

      case 3:
        return (
          <motion.div {...stepVariants} className="space-y-6">
            <div className="text-center space-y-4">
              <h2 className="text-2xl font-bold">All Set!</h2>
              <p className="text-muted-foreground">
                Your personalized Mojo experience is ready
              </p>
            </div>
            
            <Card className="glass-card-elevated p-6 space-y-4">
              <h3 className="font-semibold">Your Profile Summary:</h3>
              <div className="space-y-2">
                <p><span className="font-medium">Name:</span> {formData.name || 'Anonymous'}</p>
                {formData.age && <p><span className="font-medium">Age:</span> {formData.age}</p>}
                <div>
                  <p className="font-medium mb-2">Top Priorities:</p>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(formData.priorities)
                      .sort((a, b) => b[1] - a[1])
                      .slice(0, 3)
                      .map(([category, value]) => {
                        const categoryData = {
                          health: { icon: '💪', name: 'Health' },
                          money: { icon: '💰', name: 'Money' },
                          career: { icon: '🚀', name: 'Career' },
                          social: { icon: '👥', name: 'Social' },
                          love: { icon: '❤️', name: 'Love' },
                          growth: { icon: '🌱', name: 'Growth' },
                          spirituality: { icon: '🧘', name: 'Spirituality' },
                        }[category];

                        return (
                          <Badge key={category} variant="secondary" className="space-x-1">
                            <span>{categoryData?.icon}</span>
                            <span>{categoryData?.name}</span>
                            <span>({value}/10)</span>
                          </Badge>
                        );
                      })}
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background particles flex items-center justify-center p-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl w-full">
        {/* Left Side - Animated Background */}
        <div className="hidden lg:flex items-center justify-center">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1 }}
            className="relative"
          >
            <div className="w-80 h-80 rounded-full bg-gradient-primary opacity-20 animate-pulse-glow"></div>
            <div className="absolute inset-0 w-80 h-80 rounded-full border border-primary/30 animate-spin-slow"></div>
            <div className="absolute inset-10 w-60 h-60 rounded-full bg-gradient-to-br from-growth/20 to-transparent animate-pulse-glow"></div>
          </motion.div>
        </div>

        {/* Right Side - Onboarding Form */}
        <div className="flex flex-col justify-center">
          <Card className="glass-card-elevated p-8 max-w-lg mx-auto w-full">
            {/* Progress Bar */}
            <div className="mb-8">
              <div className="flex justify-between text-sm text-muted-foreground mb-2">
                <span>Step {currentStep + 1} of {totalSteps}</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            {/* Step Content */}
            <div className="min-h-[400px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  variants={stepVariants}
                  transition={{ duration: 0.3 }}
                >
                  {renderStep()}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Navigation */}
            <div className="flex justify-between mt-8">
              <Button 
                variant="outline" 
                onClick={handleBack}
                disabled={currentStep === 0}
                className="glass-card"
              >
                Back
              </Button>
              
              <Button 
                onClick={handleNext}
                disabled={currentStep === 0 && !formData.name.trim()}
                className="bg-primary hover:bg-primary-glow text-primary-foreground px-8"
              >
                {currentStep === totalSteps - 1 ? 'Launch Mojo' : 'Continue'}
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;