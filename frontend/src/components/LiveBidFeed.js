import React from 'react';
import { ScrollArea } from './ui/scroll-area';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

export function LiveBidFeed({ items }) {
  return (
    <ScrollArea data-testid="live-bid-feed" className="max-h-80 rounded-md border border-border bg-[hsl(var(--neutral-1))]/80">
      <div className="p-2">
        {items.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No bids yet</p>
        ) : (
          <ul className="divide-y divide-border">
            {items.map((it, idx) => (
              <li 
                key={it.id} 
                className="flex items-center gap-3 px-3 py-2 text-sm" 
                data-testid="live-bid-feed-item"
              >
                <Avatar className="h-7 w-7">
                  <AvatarFallback className="bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] text-xs">
                    {it.user_name?.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{it.user_name}</div>
                  <div className="text-muted-foreground font-numeric">${it.bid_amount.toFixed(2)}</div>
                </div>
                <time className="text-xs text-muted-foreground whitespace-nowrap">
                  {dayjs(it.created_at).fromNow()}
                </time>
              </li>
            ))}
          </ul>
        )}
      </div>
    </ScrollArea>
  );
}