import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import useWebSocket from 'react-use-websocket';
import { Countdown } from '../components/Countdown';
import { LiveBidFeed } from '../components/LiveBidFeed';
import { BidForm } from '../components/BidForm';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { ArrowLeft, Gavel, TrendingUp } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const WS_URL = process.env.REACT_APP_BACKEND_URL.replace('https://', 'wss://').replace('http://', 'ws://');

export default function AuctionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [auction, setAuction] = useState(null);
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);

  // WebSocket connection
  const { lastJsonMessage } = useWebSocket(
    `${WS_URL}/ws/${id}?user_id=${user?.id || 'anonymous'}`,
    {
      shouldReconnect: () => true,
      reconnectInterval: 3000,
      reconnectAttempts: 10,
      onOpen: () => console.log('WebSocket connected'),
      onError: (error) => console.error('WebSocket error:', error),
    }
  );

  useEffect(() => {
    loadAuction();
    loadBids();
  }, [id]);

  useEffect(() => {
    if (lastJsonMessage) {
      handleWebSocketMessage(lastJsonMessage);
    }
  }, [lastJsonMessage]);

  const handleWebSocketMessage = (message) => {
    if (message.type === 'new_bid') {
      // Update auction data
      if (message.auction) {
        setAuction(prev => ({
          ...prev,
          current_highest_bid: message.auction.current_highest_bid,
          current_highest_bidder_name: message.auction.current_highest_bidder_name,
          total_bids: message.auction.total_bids
        }));
      }
      
      // Add new bid to feed
      if (message.bid) {
        setBids(prev => [message.bid, ...prev]);
      }
    }
  };

  const loadAuction = async () => {
    try {
      const response = await axios.get(`${API}/auctions/${id}`);
      setAuction(response.data);
    } catch (error) {
      console.error('Failed to load auction:', error);
      toast.error('Failed to load auction');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const loadBids = async () => {
    try {
      const response = await axios.get(`${API}/auctions/${id}/bids`);
      setBids(response.data);
    } catch (error) {
      console.error('Failed to load bids:', error);
    }
  };

  const handlePlaceBid = async (amount) => {
    try {
      await axios.post(`${API}/auctions/${id}/bid`, { bid_amount: amount });
      // WebSocket will handle the update
    } catch (error) {
      throw error;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[hsl(var(--background))] flex items-center justify-center">
        <div className="text-muted-foreground">Loading auction...</div>
      </div>
    );
  }

  if (!auction) {
    return null;
  }

  const statusStyles = {
    ongoing: 'bg-[hsl(var(--live))]/15 text-[hsl(var(--live))] border border-[hsl(var(--live))/35]',
    upcoming: 'bg-[hsl(var(--info))]/15 text-[hsl(var(--info))] border border-[hsl(var(--info))/35]',
    completed: 'bg-emerald-400/15 text-emerald-300 border border-emerald-400/30'
  };

  const endTime = new Date(auction.end_time).getTime();
  const startTime = new Date(auction.start_time).getTime();
  const totalDuration = endTime - startTime;
  const minBid = (auction.current_highest_bid || auction.starting_price) + 1;

  const isOngoing = auction.status === 'ongoing';

  return (
    <div className="min-h-screen bg-[hsl(var(--background))]">
      {/* Header */}
      <header className="border-b border-border bg-card/30 backdrop-blur-sm sticky top-0 z-50">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 py-4">
          <Button
            data-testid="back-to-dashboard-button"
            onClick={() => navigate('/dashboard')}
            variant="ghost"
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        <div className="grid grid-cols-1 xl:grid-cols-[1.2fr_1fr] gap-6">
          {/* Left Column - Image and Details */}
          <div className="space-y-6">
            {/* Image */}
            <div 
              data-testid="auction-detail-image"
              className="aspect-[16/10] overflow-hidden rounded-xl bg-[hsl(var(--neutral-3))] border border-border"
            >
              <img
                src={auction.image_url}
                alt={auction.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1629582183727-86788aeaef34?crop=entropy&cs=srgb&fm=jpg&q=85';
                }}
              />
            </div>

            {/* Details */}
            <div className="bg-card/80 backdrop-blur-sm border border-border rounded-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold mb-2">{auction.title}</h1>
                  <Badge className={statusStyles[auction.status]} data-testid="auction-detail-status">
                    {auction.status}
                  </Badge>
                </div>
              </div>
              
              <Separator className="my-4" />
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Description</h3>
                <p className="text-foreground leading-relaxed">{auction.description}</p>
              </div>
              
              <Separator className="my-4" />
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Starting Price</div>
                  <div className="text-lg font-numeric font-semibold">${auction.starting_price.toFixed(2)}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Total Bids</div>
                  <div className="text-lg font-semibold flex items-center gap-2">
                    <Gavel className="w-4 h-4" />
                    {auction.total_bids}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Bidding */}
          <div className="xl:sticky xl:top-24 xl:h-fit space-y-6">
            {/* Current Bid Card */}
            <div className="bg-gradient-to-br from-[hsl(var(--neutral-2))] to-[hsl(var(--neutral-1))] border border-border rounded-lg p-6">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                <TrendingUp className="w-4 h-4" />
                {auction.current_highest_bid ? 'Current Highest Bid' : 'Starting Price'}
              </div>
              <div 
                data-testid="auction-detail-current-bid"
                className="text-4xl font-bold font-numeric mb-4"
              >
                ${(auction.current_highest_bid || auction.starting_price).toFixed(2)}
              </div>
              
              {auction.current_highest_bidder_name && (
                <div className="text-sm text-muted-foreground mb-4">
                  Leading bidder: <span className="text-foreground font-medium">{auction.current_highest_bidder_name}</span>
                </div>
              )}
              
              {isOngoing && (
                <>
                  <Separator className="my-4" />
                  <div className="mb-2">
                    <div className="text-xs text-muted-foreground mb-2">Time Remaining</div>
                    <Countdown endTs={endTime} totalMs={totalDuration} />
                  </div>
                </>
              )}
            </div>

            {/* Bid Form */}
            {isOngoing && (
              <div className="bg-card/80 backdrop-blur-sm border border-border rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Place Your Bid</h3>
                <BidForm
                  minNextBid={minBid}
                  onSubmit={handlePlaceBid}
                  increments={[50, 100, 250]}
                />
              </div>
            )}

            {auction.status === 'completed' && (
              <div className="bg-card/80 backdrop-blur-sm border border-border rounded-lg p-6 text-center">
                <div className="text-muted-foreground mb-2">Auction Ended</div>
                {auction.current_highest_bidder_name && (
                  <div className="text-lg">
                    Winner: <span className="font-semibold text-[hsl(var(--primary))]">{auction.current_highest_bidder_name}</span>
                  </div>
                )}
              </div>
            )}

            {auction.status === 'upcoming' && (
              <div className="bg-card/80 backdrop-blur-sm border border-border rounded-lg p-6 text-center">
                <div className="text-muted-foreground">Auction starts soon</div>
              </div>
            )}

            {/* Live Bid Feed */}
            <div className="bg-card/80 backdrop-blur-sm border border-border rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Live Bid Feed</h3>
              <LiveBidFeed items={bids} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}