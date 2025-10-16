import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { AuctionCard } from '../components/AuctionCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Gavel, Search, LogOut, Plus, Shield } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function Dashboard() {
  const [auctions, setAuctions] = useState([]);
  const [filteredAuctions, setFilteredAuctions] = useState([]);
  const [activeTab, setActiveTab] = useState('ongoing');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadAuctions();
    const interval = setInterval(loadAuctions, 10000); // Refresh every 10s
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    filterAuctions();
  }, [auctions, activeTab, searchQuery]);

  const loadAuctions = async () => {
    try {
      const response = await axios.get(`${API}/auctions`);
      setAuctions(response.data);
    } catch (error) {
      console.error('Failed to load auctions:', error);
      toast.error('Failed to load auctions');
    } finally {
      setLoading(false);
    }
  };

  const filterAuctions = () => {
    let filtered = auctions.filter(a => a.status === activeTab);
    
    if (searchQuery) {
      filtered = filtered.filter(a => 
        a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    setFilteredAuctions(filtered);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    toast.success('Logged out successfully');
  };

  return (
    <div className="min-h-screen bg-[hsl(var(--background))]">
      {/* Header */}
      <header className="border-b border-border bg-card/30 backdrop-blur-sm sticky top-0 z-50">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Gavel className="w-6 h-6 text-[hsl(var(--primary))]" />
              <h1 className="text-xl font-bold">Auction Platform</h1>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground hidden sm:inline">
                Welcome, <span className="text-foreground font-medium">{user?.name}</span>
              </span>
              {user?.is_admin && (
                <Button
                  data-testid="admin-panel-button"
                  onClick={() => navigate('/admin')}
                  variant="outline"
                  size="sm"
                  className="gap-2"
                >
                  <Shield className="w-4 h-4" />
                  Admin
                </Button>
              )}
              <Button
                data-testid="logout-button"
                onClick={handleLogout}
                variant="ghost"
                size="sm"
                className="gap-2"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        {/* Hero Section */}
        <div 
          className="relative overflow-hidden rounded-xl p-5 sm:p-7 bg-[hsl(var(--neutral-1))] mb-8 before:absolute before:inset-x-0 before:top-0 before:h-0.5 before:bg-[hsl(var(--live))] before:opacity-60"
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-2">Live Auctions</h2>
          <p className="text-muted-foreground">Bid on exclusive items in real-time</p>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              data-testid="auction-search-input"
              type="search"
              placeholder="Search auctions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList data-testid="dashboard-tabs" className="grid w-full grid-cols-3 max-w-md">
            <TabsTrigger data-testid="dashboard-tabs-ongoing-tab" value="ongoing">
              Ongoing
            </TabsTrigger>
            <TabsTrigger data-testid="dashboard-tabs-upcoming-tab" value="upcoming">
              Upcoming
            </TabsTrigger>
            <TabsTrigger data-testid="dashboard-tabs-completed-tab" value="completed">
              Completed
            </TabsTrigger>
          </TabsList>

          <TabsContent value="ongoing" className="mt-6">
            {loading ? (
              <div className="text-center py-12 text-muted-foreground">Loading auctions...</div>
            ) : filteredAuctions.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No ongoing auctions found
              </div>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {filteredAuctions.map((auction) => (
                  <AuctionCard
                    key={auction.id}
                    auction={auction}
                    onClick={() => navigate(`/auction/${auction.id}`)}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="upcoming" className="mt-6">
            {loading ? (
              <div className="text-center py-12 text-muted-foreground">Loading auctions...</div>
            ) : filteredAuctions.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No upcoming auctions found
              </div>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {filteredAuctions.map((auction) => (
                  <AuctionCard
                    key={auction.id}
                    auction={auction}
                    onClick={() => navigate(`/auction/${auction.id}`)}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="completed" className="mt-6">
            {loading ? (
              <div className="text-center py-12 text-muted-foreground">Loading auctions...</div>
            ) : filteredAuctions.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No completed auctions found
              </div>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {filteredAuctions.map((auction) => (
                  <AuctionCard
                    key={auction.id}
                    auction={auction}
                    onClick={() => navigate(`/auction/${auction.id}`)}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}