import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Badge } from '../components/ui/badge';
import { ArrowLeft, Plus, Calendar as CalendarIcon } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
import dayjs from 'dayjs';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function Admin() {
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image_url: '',
    starting_price: '',
    start_time: '',
    end_time: ''
  });

  useEffect(() => {
    if (!user?.is_admin) {
      toast.error('Access denied. Admin only.');
      navigate('/dashboard');
      return;
    }
    loadAuctions();
  }, [user, navigate]);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      await axios.post(`${API}/auctions`, {
        title: formData.title,
        description: formData.description,
        image_url: formData.image_url,
        starting_price: parseFloat(formData.starting_price),
        start_time: new Date(formData.start_time).toISOString(),
        end_time: new Date(formData.end_time).toISOString()
      });
      
      toast.success('Auction created successfully!');
      setDialogOpen(false);
      setFormData({
        title: '',
        description: '',
        image_url: '',
        starting_price: '',
        start_time: '',
        end_time: ''
      });
      loadAuctions();
    } catch (error) {
      console.error('Failed to create auction:', error);
      toast.error(error.response?.data?.detail || 'Failed to create auction');
    }
  };

  const statusStyles = {
    ongoing: 'bg-[hsl(var(--live))]/15 text-[hsl(var(--live))] border border-[hsl(var(--live))/35]',
    upcoming: 'bg-[hsl(var(--info))]/15 text-[hsl(var(--info))] border border-[hsl(var(--info))/35]',
    completed: 'bg-emerald-400/15 text-emerald-300 border border-emerald-400/30'
  };

  if (!user?.is_admin) return null;

  return (
    <div className="min-h-screen bg-[hsl(var(--background))]">
      {/* Header */}
      <header className="border-b border-border bg-card/30 backdrop-blur-sm sticky top-0 z-50">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Button
              data-testid="back-to-dashboard-button"
              onClick={() => navigate('/dashboard')}
              variant="ghost"
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Button>
            
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button data-testid="admin-create-auction-button" className="gap-2">
                  <Plus className="w-4 h-4" />
                  Create Auction
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create New Auction</DialogTitle>
                  <DialogDescription>
                    Fill in the details to create a new auction
                  </DialogDescription>
                </DialogHeader>
                
                <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                      placeholder="Vintage Rolex Watch"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      required
                      rows={4}
                      placeholder="Detailed description of the item..."
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="image_url">Image URL</Label>
                    <Input
                      id="image_url"
                      type="url"
                      value={formData.image_url}
                      onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                      required
                      placeholder="https://images.unsplash.com/..."
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="starting_price">Starting Price ($)</Label>
                    <Input
                      id="starting_price"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.starting_price}
                      onChange={(e) => setFormData({ ...formData, starting_price: e.target.value })}
                      required
                      placeholder="100.00"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="start_time">Start Time</Label>
                      <Input
                        id="start_time"
                        type="datetime-local"
                        value={formData.start_time}
                        onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="end_time">End Time</Label>
                      <Input
                        id="end_time"
                        type="datetime-local"
                        value={formData.end_time}
                        onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-end gap-3 pt-4">
                    <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" data-testid="admin-create-auction-submit-button">
                      Create Auction
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        <h1 className="text-3xl font-bold mb-6">Auction Management</h1>
        
        {loading ? (
          <div className="text-center py-12 text-muted-foreground">Loading...</div>
        ) : (
          <div className="bg-card/80 backdrop-blur-sm border border-border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Start Time</TableHead>
                  <TableHead>End Time</TableHead>
                  <TableHead>Starting Price</TableHead>
                  <TableHead>Current Bid</TableHead>
                  <TableHead>Total Bids</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {auctions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                      No auctions found
                    </TableCell>
                  </TableRow>
                ) : (
                  auctions.map((auction) => (
                    <TableRow key={auction.id} className="cursor-pointer hover:bg-[hsl(var(--neutral-2))]" onClick={() => navigate(`/auction/${auction.id}`)}>
                      <TableCell className="font-medium">{auction.title}</TableCell>
                      <TableCell>
                        <Badge className={statusStyles[auction.status]}>
                          {auction.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        {dayjs(auction.start_time).format('MMM D, h:mm A')}
                      </TableCell>
                      <TableCell className="text-sm">
                        {dayjs(auction.end_time).format('MMM D, h:mm A')}
                      </TableCell>
                      <TableCell className="font-numeric">${auction.starting_price.toFixed(2)}</TableCell>
                      <TableCell className="font-numeric">
                        {auction.current_highest_bid ? `$${auction.current_highest_bid.toFixed(2)}` : '-'}
                      </TableCell>
                      <TableCell>{auction.total_bids}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </main>
    </div>
  );
}