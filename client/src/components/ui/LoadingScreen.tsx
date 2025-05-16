import React from 'react';
import { motion } from 'framer-motion';
import { Film } from 'lucide-react';

export function LoadingScreen() {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-background z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center"
      >
        <motion.div
          animate={{ 
            rotate: 360,
            transition: { 
              duration: 2, 
              repeat: Infinity, 
              ease: "linear" 
            }
          }}
          className="mb-6"
        >
          <Film size={48} className="text-primary" />
        </motion.div>
        
        <h2 className="text-2xl font-bold mb-2 text-foreground">Loading your experience</h2>
        
        <div className="w-64 h-1.5 bg-gray-700 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-primary rounded-full"
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        </div>
        
        <div className="mt-8 text-center max-w-md">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-muted-foreground mb-2"
          >
            Curating personalized movie recommendations just for you...
          </motion.p>
        </div>
      </motion.div>
    </div>
  );
}