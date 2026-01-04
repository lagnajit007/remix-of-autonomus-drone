import { useState, useCallback, useEffect } from "react";
import { Mic, MicOff, Volume2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { VOICE_COMMANDS } from "@/hooks/useVoiceCommands";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface VoicePanelProps {
  isListening: boolean;
  onToggleListening: () => void;
  onCommand: (command: string) => void;
  className?: string;
}

/**
 * Voice Command Panel
 * 
 * Push-to-talk interface with:
 * - Mic button with listening state animation
 * - Command suggestions dropdown
 * - Quick command buttons for testing
 */
export function VoicePanel({
  isListening,
  onToggleListening,
  onCommand,
  className,
}: VoicePanelProps) {
  const [showCommands, setShowCommands] = useState(false);
  const [inputValue, setInputValue] = useState("");

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onCommand(inputValue.trim());
      setInputValue("");
    }
  }, [inputValue, onCommand]);

  const handleQuickCommand = useCallback((phrase: string) => {
    onCommand(phrase);
    setShowCommands(false);
  }, [onCommand]);

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {/* Mic Button with Popover */}
      <Popover open={showCommands} onOpenChange={setShowCommands}>
        <PopoverTrigger asChild>
          <button
            onClick={onToggleListening}
            className={cn(
              "relative p-2.5 rounded-lg transition-all duration-200",
              "border",
              isListening 
                ? "bg-accent/20 border-accent text-accent pulse-cyan" 
                : "bg-secondary border-primary/20 text-muted-foreground hover:border-primary/40"
            )}
            title={isListening ? "Listening... (Click or press Ctrl+Space to stop)" : "Push to talk (Ctrl+Space)"}
          >
            {isListening ? (
              <Mic className="w-5 h-5 animate-pulse" />
            ) : (
              <MicOff className="w-5 h-5" />
            )}
            
            {/* Listening indicator */}
            {isListening && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-accent rounded-full animate-ping" />
            )}
          </button>
        </PopoverTrigger>
        
        <PopoverContent 
          side="bottom" 
          align="end" 
          className="w-80 p-3 bg-card border border-primary/30"
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Voice Commands</p>
              <span className="text-xs text-muted-foreground">Ctrl+Space</span>
            </div>

            {/* Command Input */}
            <form onSubmit={handleSubmit} className="flex gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Type a command..."
                className="flex-1 px-3 py-2 text-sm bg-secondary border border-primary/20 rounded-lg focus:outline-none focus:border-accent"
              />
              <button
                type="submit"
                className="px-3 py-2 text-sm bg-accent/20 text-accent border border-accent/30 rounded-lg hover:bg-accent/30 transition-colors"
              >
                Send
              </button>
            </form>

            {/* Quick Commands */}
            <div className="space-y-1.5 max-h-60 overflow-y-auto">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Quick Commands</p>
              {VOICE_COMMANDS.slice(0, 6).map((cmd) => (
                <button
                  key={cmd.phrase}
                  onClick={() => handleQuickCommand(cmd.phrase)}
                  className="w-full text-left px-3 py-2 text-sm rounded-lg bg-secondary/50 hover:bg-secondary border border-transparent hover:border-primary/20 transition-colors"
                >
                  <span className="font-medium text-accent">"{cmd.phrase}"</span>
                  <p className="text-xs text-muted-foreground mt-0.5">{cmd.description}</p>
                </button>
              ))}
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Status indicator */}
      {isListening && (
        <div className="flex items-center gap-2 px-3 py-1.5 bg-accent/10 border border-accent/30 rounded-lg animate-fade-in">
          <Volume2 className="w-4 h-4 text-accent animate-pulse" />
          <span className="text-xs text-accent">Listening...</span>
        </div>
      )}
    </div>
  );
}

/**
 * Voice Command Hook for push-to-talk behavior
 */
export function useVoicePushToTalk(onCommand: (command: string) => void) {
  const [isListening, setIsListening] = useState(false);

  const startListening = useCallback(() => {
    console.log('[VOICE] Started listening');
    setIsListening(true);
  }, []);

  const stopListening = useCallback(() => {
    console.log('[VOICE] Stopped listening');
    setIsListening(false);
  }, []);

  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  // Keyboard shortcut: Ctrl+Space for push-to-talk
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.code === 'Space') {
        e.preventDefault();
        if (!isListening) {
          startListening();
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space' && isListening && (e.ctrlKey || e.metaKey)) {
        stopListening();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isListening, startListening, stopListening]);

  return {
    isListening,
    startListening,
    stopListening,
    toggleListening,
  };
}