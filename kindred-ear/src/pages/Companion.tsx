import { useState } from "react";
import { Mic, MicOff, Volume2, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import greenButton from "@/assets/green_voice_chat_button.png";
import { useCallTrigger } from "@/hooks/use-api";
import { useToast } from "@/hooks/use-toast";

export default function Companion() {
  const [isListening, setIsListening] = useState(false);
  const callTrigger = useCallTrigger();
  const { toast } = useToast();

  const handleTalkPress = async () => {
    if (isListening) {
      setIsListening(false);
      return;
    }

    setIsListening(true);
    try {
      await callTrigger.mutateAsync();
      toast({
        title: "Call initiated",
        description: "Calling Marie now...",
      });
    } catch {
      toast({
        title: "Call failed",
        description: "Could not initiate the call. Please try again.",
        variant: "destructive",
      });
      setIsListening(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="max-w-md mx-auto px-5 pt-14 flex-1 flex flex-col">
        {/* Header */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center mb-8">
          <h1 className="text-2xl font-extrabold text-foreground">Veille</h1>
          <p className="text-sm text-muted-foreground mt-1">Your daily companion</p>
        </motion.div>

        {/* Conversation area */}
        <div className="flex-1 flex flex-col items-center justify-center">
          <AnimatePresence mode="wait">
            {isListening ? (
              <motion.div
                key="listening"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="text-center space-y-4"
              >
                {callTrigger.isPending ? (
                  <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto" />
                ) : (
                  <div className="flex items-center justify-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="w-1 rounded-full bg-primary"
                        animate={{
                          height: [12, 28, 12],
                        }}
                        transition={{
                          duration: 0.8,
                          repeat: Infinity,
                          delay: i * 0.15,
                          ease: "easeInOut",
                        }}
                      />
                    ))}
                  </div>
                )}
                <p className="text-sm text-muted-foreground">
                  {callTrigger.isPending ? "Connecting..." : "Call in progress..."}
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="greeting"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="text-center px-8 space-y-6"
              >
                <motion.div
                  animate={{
                    rotate: 360,
                    scale: [1, 1.04, 1, 0.98, 1],
                  }}
                  transition={{
                    rotate: { duration: 40, repeat: Infinity, ease: "linear" },
                    scale: { duration: 8, repeat: Infinity, ease: "easeInOut" },
                  }}
                  className="w-32 h-32 mx-auto relative flex items-center justify-center"
                >
                  <img src={greenButton} alt="Talk button" className="w-full h-full object-contain" />
                  <motion.div
                    animate={{ rotate: -360 }}
                    transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
                    className="absolute"
                  >
                    <Volume2 className="w-8 h-8 text-white" />
                  </motion.div>
                </motion.div>
                <div className="rounded-2xl bg-secondary/60 px-6 py-4">
                  <p className="text-base font-medium text-foreground leading-relaxed">
                    Ready to call Marie?
                  </p>
                </div>
                <p className="text-xs text-muted-foreground">Tap the button below to start the call</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Talk button */}
        <div className="py-10 flex justify-center">
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={handleTalkPress}
            disabled={callTrigger.isPending}
            className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 ${
              isListening
                ? "bg-destructive text-destructive-foreground"
                : "bg-primary text-primary-foreground animate-glow-breathe"
            }`}
          >
            {callTrigger.isPending ? (
              <Loader2 className="w-7 h-7 animate-spin" />
            ) : isListening ? (
              <MicOff className="w-7 h-7" />
            ) : (
              <Mic className="w-7 h-7" />
            )}
          </motion.button>
        </div>
      </div>
    </div>
  );
}
