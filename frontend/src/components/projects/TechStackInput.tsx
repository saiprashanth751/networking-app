import { useState, useRef, useEffect } from 'react';
import { X, Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { POPULAR_TECH_STACK } from '@/lib/projectConstants';

interface TechStackInputProps {
  value: string[];
  onChange: (value: string[]) => void;
  error?: string;
}

export function TechStackInput({ value, onChange, error }: TechStackInputProps) {
  const [input, setInput] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInput(val);

    if (val.trim()) {
      const filtered = POPULAR_TECH_STACK.filter(
        tech =>
          tech.toLowerCase().includes(val.toLowerCase()) &&
          !value.includes(tech)
      ).slice(0, 8);
      setSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const addTech = (tech: string) => {
    if (!value.includes(tech) && tech.trim()) {
      onChange([...value, tech.trim()]);
      setInput('');
      setSuggestions([]);
      setShowSuggestions(false);
      inputRef.current?.focus();
    }
  };

  const removeTech = (tech: string) => {
    onChange(value.filter(t => t !== tech));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && input.trim()) {
      e.preventDefault();
      addTech(input);
    } else if (e.key === 'Backspace' && !input && value.length > 0) {
      removeTech(value[value.length - 1]);
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Tech Stack *</label>

      {/* Selected Tags */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map((tech, index) => (
            <Badge
              key={index}
              variant="secondary"
              className="gap-1 pl-2 pr-1 py-1"
            >
              <span>{tech}</span>
              <button
                type="button"
                onClick={() => removeTech(tech)}
                className="hover:bg-neutral-700 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="relative">
        <div className="flex items-center gap-2">
          <Input
            ref={inputRef}
            type="text"
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => input.trim() && setShowSuggestions(true)}
            placeholder="Type tech stack (e.g., React, Node.js)"
            className="flex-1"
          />
          {input.trim() && (
            <button
              type="button"
              onClick={() => addTech(input)}
              className="px-3 py-2 bg-blue-500 hover:bg-blue-600 rounded-md transition-colors"
            >
              <Plus className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Suggestions Dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div
            ref={suggestionsRef}
            className="absolute z-10 w-full mt-1 bg-neutral-900 border border-neutral-800 rounded-lg shadow-lg max-h-48 overflow-y-auto"
          >
            {suggestions.map((tech, index) => (
              <button
                key={index}
                type="button"
                onClick={() => addTech(tech)}
                className="w-full px-3 py-2 text-left hover:bg-neutral-800 transition-colors text-sm"
              >
                {tech}
              </button>
            ))}
          </div>
        )}
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <p className="text-xs text-neutral-500">
        Press Enter to add custom tech or select from suggestions
      </p>
    </div>
  );
}