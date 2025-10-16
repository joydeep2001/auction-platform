import React, { useState } from 'react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { toast } from 'sonner';

export function BidForm({ minNextBid, onSubmit, increments = [50, 100, 500] }) {
  const [val, setVal] = useState(String(minNextBid));
  const [loading, setLoading] = useState(false);
  
  const submit = async (e) => {
    e.preventDefault();
    const amount = Number(val);
    
    if (amount < minNextBid) {
      toast.error(`Bid must be at least $${minNextBid.toFixed(2)}`);
      return;
    }
    
    setLoading(true);
    try {
      await onSubmit?.(amount);
      toast.success('Bid placed successfully!');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to place bid');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <form onSubmit={submit} className="space-y-3" data-testid="bid-form">
      <div className="grid grid-cols-[1fr_auto] gap-2">
        <Input 
          data-testid="bid-form-input"
          type="number" 
          min={minNextBid}
          step="0.01"
          value={val} 
          onChange={(e) => setVal(e.target.value)} 
          className="font-numeric"
          placeholder={`Min $${minNextBid.toFixed(2)}`}
          disabled={loading}
        />
        <Button 
          data-testid="bid-form-submit-button"
          type="submit" 
          disabled={loading}
          className="min-w-[100px]"
        >
          {loading ? 'Placing...' : 'Place Bid'}
        </Button>
      </div>
      <div className="flex flex-wrap gap-2">
        {increments.map((inc) => (
          <button 
            key={inc}
            data-testid="bid-form-quick-increment"
            type="button" 
            onClick={() => setVal(String(Number(val || minNextBid) + inc))}
            className="px-3 py-1 rounded-full bg-[hsl(var(--neutral-2))] hover:bg-[hsl(var(--neutral-3))] text-sm transition-colors"
            disabled={loading}
          >
            +${inc}
          </button>
        ))}
      </div>
    </form>
  );
}