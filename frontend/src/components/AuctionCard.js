import React from 'react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Clock, Gavel } from 'lucide-react';
import { useCountdown } from '../hooks/useCountdown';

export function AuctionCard({ auction, onClick }) {
  const statusStyles = {
    ongoing: 'bg-[hsl(var(--live))]/15 text-[hsl(var(--live))] border border-[hsl(var(--live))/35]',
    upcoming: 'bg-[hsl(var(--info))]/15 text-[hsl(var(--info))] border border-[hsl(var(--info))/35]',
    completed: 'bg-emerald-400/15 text-emerald-300 border border-emerald-400/30'
  };
  
  const endTime = new Date(auction.end_time).getTime();
  const { hours, minutes } = useCountdown(endTime);
  
  const timeDisplay = auction.status === 'ongoing' 
    ? `${hours}h ${minutes}m left`
    : auction.status === 'upcoming'
    ? 'Starting soon'
    : 'Ended';
  
  const displayPrice = auction.current_highest_bid || auction.starting_price;
  
  return (
    <Card 
      data-testid="auction-card"
      onClick={onClick}
      className="group relative overflow-hidden p-4 rounded-xl border bg-gradient-to-b from-[hsl(var(--neutral-2))] to-[hsl(var(--neutral-1))] cursor-pointer hover:border-[hsl(var(--primary))/50] transition-all duration-300"
    >
      <div className="aspect-[4/3] overflow-hidden rounded-lg bg-[hsl(var(--neutral-3))]">
        <img 
          src={auction.image_url} 
          alt={auction.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1629582183727-86788aeaef34?crop=entropy&cs=srgb&fm=jpg&q=85';
          }}
        />
      </div>
      
      <div className="mt-3 flex items-start justify-between gap-2">
        <h3 className="text-base font-medium line-clamp-1 flex-1">{auction.title}</h3>
        <Badge 
          className={statusStyles[auction.status]} 
          data-testid="auction-card-status"
        >
          {auction.status}
        </Badge>
      </div>
      
      <div className="mt-2 flex items-center justify-between">
        <div>
          <div className="text-xs text-muted-foreground">
            {auction.current_highest_bid ? 'Current Bid' : 'Starting Price'}
          </div>
          <div className="text-lg font-semibold font-numeric">${displayPrice.toFixed(2)}</div>
        </div>
        <div className="text-right">
          <div className="text-xs text-muted-foreground flex items-center gap-1 justify-end">
            <Gavel className="w-3 h-3" />
            {auction.total_bids} bids
          </div>
        </div>
      </div>
      
      <div className="mt-3 flex items-center gap-1 text-xs text-muted-foreground">
        <Clock className="w-3 h-3" />
        {timeDisplay}
      </div>
    </Card>
  );
}