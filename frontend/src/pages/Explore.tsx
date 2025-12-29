import { useState } from 'react';
import { Users, Sparkles } from 'lucide-react';

export default function Explore() {
  const [activeTab, setActiveTab] = useState<'for-you' | 'people'>('for-you');

  return (
    <>
      {/* Header */}
      <div className="sticky top-0 z-10 bg-black/80 backdrop-blur-sm border-b border-neutral-800">
        <div className="px-4 h-[53px] flex items-center">
          <h1 className="font-bold text-xl">Explore</h1>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-neutral-800">
          <button
            onClick={() => setActiveTab('for-you')}
            className={`flex-1 px-4 py-4 hover:bg-neutral-900/50 transition-colors relative flex items-center justify-center gap-2 ${activeTab === 'for-you' ? 'font-bold' : 'text-neutral-500'
              }`}
          >
            <Sparkles className="h-4 w-4" />
            For You
            {activeTab === 'for-you' && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-500 rounded-full" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('people')}
            className={`flex-1 px-4 py-4 hover:bg-neutral-900/50 transition-colors relative flex items-center justify-center gap-2 ${activeTab === 'people' ? 'font-bold' : 'text-neutral-500'
              }`}
          >
            <Users className="h-4 w-4" />
            People
            {activeTab === 'people' && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-500 rounded-full" />
            )}
          </button>
        </div>
      </div>

      {/* Content */}
      <div>
        {activeTab === 'for-you' && (
          <div className="px-4 py-16 text-center space-y-4">
            <Sparkles className="h-12 w-12 mx-auto text-blue-500 opacity-50" />
            <h2 className="text-2xl font-bold">Your Personalized Feed</h2>
            <p className="text-neutral-500 max-w-md mx-auto">
              Discover content tailored to your interests, connections, and activity.
              Coming soon!
            </p>
          </div>
        )}

        {activeTab === 'people' && (
          <div className="px-4 py-16 text-center space-y-4">
            <Users className="h-12 w-12 mx-auto text-muted-foreground opacity-50" />
            <h2 className="text-2xl font-bold">Discover People</h2>
            <p className="text-neutral-500 max-w-md mx-auto">
              Find and connect with students from your department, year, and interests.
              Coming soon!
            </p>
          </div>
        )}
      </div>
    </>
  );
}
