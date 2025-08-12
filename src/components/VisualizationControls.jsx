import React, { useState, useEffect, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  ChevronsLeft,
  ChevronsRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { StatusDot } from './LoadingIndicators';

// Constants
const PLAYBACK_SPEED = 1000; // 1 second per step

/**
 * Enhanced visualization controls with modern shadcn/ui styling
 */
export default function VisualizationControls({
  currentStep,
  totalSteps,
  onStepChange,
  onReset,
  disabled = false
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const intervalRef = useRef(null);

  // Auto-play functionality
  useEffect(() => {
    if (isPlaying && currentStep < totalSteps - 1) {
      intervalRef.current = setInterval(() => {
        const nextStep = Math.min(currentStep + 1, totalSteps - 1);
        onStepChange(nextStep);
        if (nextStep >= totalSteps - 1) setIsPlaying(false);
      }, PLAYBACK_SPEED);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (currentStep >= totalSteps - 1) {
        setIsPlaying(false);
      }
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, currentStep, totalSteps, onStepChange]);

  // Control handlers with useCallback for optimization
  const handlePlayPause = useCallback(() => {
    setIsPlaying(prev => !prev);
  }, []);

  const handlePrevious = useCallback(() => {
    if (currentStep > 0) {
      onStepChange(currentStep - 1);
    }
  }, [currentStep, onStepChange]);

  const handleNext = useCallback(() => {
    if (currentStep < totalSteps - 1) {
      onStepChange(currentStep + 1);
    }
  }, [currentStep, totalSteps, onStepChange]);

  const handleFirst = useCallback(() => {
    onStepChange(0);
  }, [onStepChange]);

  const handleLast = useCallback(() => {
    onStepChange(totalSteps - 1);
  }, [totalSteps, onStepChange]);

  const showFullControls = totalSteps > 1;

  return (
    <div className="p-4 space-y-4">
      {showFullControls ? (
        <>
          {/* Main Controls */}
          <div className="flex items-center justify-center space-x-2">
            {/* First Step */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleFirst}
              disabled={disabled || currentStep === 0}
              title="Go to first step"
            >
              <ChevronsLeft className="w-4 h-4" />
            </Button>

            {/* Previous Step */}
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrevious}
              disabled={disabled || currentStep === 0}
              title="Previous step"
            >
              <SkipBack className="w-4 h-4" />
            </Button>

            {/* Play/Pause */}
            <Button
              onClick={handlePlayPause}
              disabled={disabled}
              size="default"
              className="mx-2"
              title={isPlaying ? 'Pause auto-play' : 'Start auto-play'}
            >
              {isPlaying ? (
                <Pause className="w-5 h-5" />
              ) : (
                <Play className="w-5 h-5" />
              )}
            </Button>

            {/* Next Step */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleNext}
              disabled={disabled || currentStep === totalSteps - 1}
              title="Next step"
            >
              <SkipForward className="w-4 h-4" />
            </Button>

            {/* Last Step */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleLast}
              disabled={disabled || currentStep === totalSteps - 1}
              title="Go to last step"
            >
              <ChevronsRight className="w-4 h-4" />
            </Button>
          </div>

          {/* Progress and Status */}
          <div className="space-y-3">
            {/* Step Counter and Reset */}
            <div className="flex items-center justify-between">
              <Badge variant="secondary" className="font-mono">
                Step {currentStep + 1} of {totalSteps}
              </Badge>

              <Button
                variant="outline"
                size="sm"
                onClick={onReset}
                disabled={disabled}
                title="Reset to beginning"
              >
                <RotateCcw className="w-4 h-4 mr-1" />
                Reset
              </Button>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <Progress
                value={(currentStep / Math.max(totalSteps - 1, 1)) * 100}
                className="h-2"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Start</span>
                <span>End</span>
              </div>
            </div>

            {/* Status Indicator */}
            <div className="flex items-center justify-center space-x-2">
              <StatusDot status={isPlaying ? 'active' : 'inactive'} />
              <span className="text-sm text-muted-foreground">
                {isPlaying ? 'Playing' : 'Paused'}
              </span>
            </div>
          </div>
        </>
      ) : (
        /* Single step or no steps */
        <div className="text-center py-4">
          <Badge variant="outline" className="mb-2">
            {totalSteps === 0 ? 'No steps available' : 'Single step visualization'}
          </Badge>
          {totalSteps === 1 && (
            <div className="text-sm text-muted-foreground">
              Step 1 of 1
            </div>
          )}
          {totalSteps > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={onReset}
              disabled={disabled}
              className="mt-2"
            >
              <RotateCcw className="w-4 h-4 mr-1" />
              Reset
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

VisualizationControls.propTypes = {
  currentStep: PropTypes.number.isRequired,
  totalSteps: PropTypes.number.isRequired,
  onStepChange: PropTypes.func.isRequired,
  onReset: PropTypes.func.isRequired,
  disabled: PropTypes.bool
};
