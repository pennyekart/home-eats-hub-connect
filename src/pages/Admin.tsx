import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Search, RefreshCw, Users, Tag } from 'lucide-react';

const Admin = () => {
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [panchayaths, setPanchayaths] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  const fetchPanchayaths = async () => {
    try {
      // Create a Supabase client to fetch from external database
      const { createClient } = await import('@supabase/supabase-js');
      const externalSupabase = createClient(
        'https://mbvxiphgomdtoaqzmbgv.supabase.co',
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1idnhpcGhnb21kdG9hcXptYmd2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ0MjI5MzAsImV4cCI6MjA2OTk5ODkzMH0.k4JOmqn3q0bu2_txC5XxBfgb9YDyqrdK6YmJwSsjKlo'
      );
      
      const { data, error } = await externalSupabase
        .from('panchayaths')
        .select('id, name_english, name_malayalam')
        .order('name_english', { ascending: true });

      if (error) throw error;

      setPanchayaths(data || []);
      toast({
        title: "Success",
        description: `Loaded ${data?.length || 0} panchayaths`,
      });
    } catch (error) {
      console.error('Panchayaths fetch error:', error);
      toast({
        title: "Error",
        description: "Failed to fetch panchayaths",
        variant: "destructive"
      });
    }
  };

  const fetchCategories = async () => {
    try {
      // Create a Supabase client to fetch from external database
      const { createClient } = await import('@supabase/supabase-js');
      const externalSupabase = createClient(
        'https://mbvxiphgomdtoaqzmbgv.supabase.co',
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1idnhpcGhnb21kdG9hcXptYmd2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ0MjI5MzAsImV4cCI6MjA2OTk5ODkzMH0.k4JOmqn3q0bu2_txC5XxBfgb9YDyqrdK6YmJwSsjKlo'
      );
      
      const { data, error } = await externalSupabase
        .from('categories')
        .select('id, *')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setCategories(data || []);
      toast({
        title: "Success",
        description: `Loaded ${data?.length || 0} categories`,
      });
    } catch (error) {
      console.error('Categories fetch error:', error);
      toast({
        title: "Error",
        description: "Failed to fetch categories",
        variant: "destructive"
      });
    }
  };

  const fetchRegistrations = async () => {
    setLoading(true);
    try {
      // Create a Supabase client to fetch from external database
      const { createClient } = await import('@supabase/supabase-js');
      const externalSupabase = createClient(
        'https://mbvxiphgomdtoaqzmbgv.supabase.co',
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1idnhpcGhnb21kdG9hcXptYmd2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ0MjI5MzAsImV4cCI6MjA2OTk5ODkzMH0.k4JOmqn3q0bu2_txC5XxBfgb9YDyqrdK6YmJwSsjKlo'
      );
      
      // First try without panchayaths to see what's available
      const { data, error } = await externalSupabase
        .from('registrations')
        .select(`
          *, 
          categories!category_id(name_english, name_malayalam)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setRegistrations(data || []);
      toast({
        title: "Success",
        description: `Loaded ${data?.length || 0} registrations`,
      });
    } catch (error) {
      console.error('Fetch error:', error);
      toast({
        title: "Error",
        description: "Failed to fetch registrations",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegistrations();
    fetchCategories();
    fetchPanchayaths();
  }, []);

  const filteredRegistrations = registrations.filter(reg =>
    reg.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    reg.mobile_number?.includes(searchTerm) ||
    reg.address?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Helper function to get panchayath name by ID
  const getPanchayathName = (panchayathId: string) => {
    const panchayath = panchayaths.find(p => p.id === panchayathId);
    return panchayath?.name_english || panchayath?.name_malayalam || 'N/A';
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Admin Panel</h1>
          <p className="text-muted-foreground">Manage registrations for the self-employment program</p>
        </div>

        {/* Stats Card */}
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Registration Statistics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{registrations.length}</div>
                <div className="text-sm text-muted-foreground">Total Registrations</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-secondary">{categories.length}</div>
                <div className="text-sm text-muted-foreground">Total Categories</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-accent">{filteredRegistrations.length}</div>
                <div className="text-sm text-muted-foreground">Filtered Results</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-muted-foreground">100%</div>
                <div className="text-sm text-muted-foreground">Data Accuracy</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Controls */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, mobile, or address..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button onClick={() => { fetchRegistrations(); fetchCategories(); fetchPanchayaths(); }} disabled={loading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Registrations Table */}
        <Card>
          <CardHeader>
            <CardTitle>Registrations ({filteredRegistrations.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Mobile</TableHead>
                    <TableHead>Address</TableHead>
                    <TableHead>Panchayath</TableHead>
                    <TableHead>Ward</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Fee</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Approved Date</TableHead>
                    <TableHead>Expiry Date</TableHead>
                    <TableHead>Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={12} className="text-center py-8">
                        <div className="flex items-center justify-center">
                          <RefreshCw className="h-6 w-6 animate-spin mr-2" />
                          Loading registrations...
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : filteredRegistrations.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={12} className="text-center py-8 text-muted-foreground">
                        No registrations found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredRegistrations.map((registration, index) => (
                      <TableRow key={registration.id || index}>
                        <TableCell className="font-medium">
                          {registration.customer_id || 'N/A'}
                        </TableCell>
                        <TableCell>{registration.full_name || 'N/A'}</TableCell>
                        <TableCell>{registration.mobile_number || 'N/A'}</TableCell>
                        <TableCell className="max-w-xs truncate" title={registration.address}>
                          {registration.address || 'N/A'}
                        </TableCell>
                        <TableCell className="max-w-xs truncate" title={getPanchayathName(registration.panchayath_id)}>
                          {getPanchayathName(registration.panchayath_id)}
                        </TableCell>
                        <TableCell>{registration.ward || 'N/A'}</TableCell>
                        <TableCell className="max-w-xs truncate" title={registration.categories?.name_english}>
                          {registration.categories?.name_english || registration.categories?.name_malayalam || 'N/A'}
                        </TableCell>
                        <TableCell>{registration.fee ? `₹${registration.fee}` : 'N/A'}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            registration.status === 'pending' 
                              ? 'bg-yellow-100 text-yellow-800' 
                              : registration.status === 'approved'
                              ? 'bg-green-100 text-green-800'
                              : registration.status === 'rejected'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-gray-100 text-gray-800'}`
                          }>
                            {registration.status || 'N/A'}
                          </span>
                        </TableCell>
                        <TableCell>
                          {registration.approved_date 
                            ? new Date(registration.approved_date).toLocaleDateString()
                            : 'N/A'
                          }
                        </TableCell>
                        <TableCell>
                          {registration.expiry_date 
                            ? new Date(registration.expiry_date).toLocaleDateString()
                            : 'N/A'
                          }
                        </TableCell>
                        <TableCell>
                          {registration.created_at 
                            ? new Date(registration.created_at).toLocaleDateString()
                            : 'N/A'
                          }
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Categories Table */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Tag className="h-5 w-5" />
              Categories ({categories.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>English Name</TableHead>
                    <TableHead>Malayalam Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Actual Fee</TableHead>
                    <TableHead>Offer Fee</TableHead>
                    <TableHead>Expiry Days</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8">
                        <div className="flex items-center justify-center">
                          <RefreshCw className="h-6 w-6 animate-spin mr-2" />
                          Loading categories...
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : categories.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                        No categories found
                      </TableCell>
                    </TableRow>
                  ) : (
                     categories.map((category, index) => (
                      <TableRow key={category.id || index}>
                        <TableCell className="font-medium text-primary">
                          {category.id || 'N/A'}
                        </TableCell>
                        <TableCell className="font-medium">
                          {category.name_english || 'N/A'}
                        </TableCell>
                        <TableCell>{category.name_malayalam || 'N/A'}</TableCell>
                        <TableCell className="max-w-xs" title={category.description}>
                          <div className="truncate">
                            {category.description || 'N/A'}
                          </div>
                        </TableCell>
                        <TableCell>{category.actual_fee ? `₹${category.actual_fee}` : 'N/A'}</TableCell>
                        <TableCell className="font-medium text-green-600">
                          {category.offer_fee ? `₹${category.offer_fee}` : 'N/A'}
                        </TableCell>
                        <TableCell>
                          <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                            {category.expiry_days || 0} days
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            category.is_active 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'}`
                          }>
                            {category.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </TableCell>
                        <TableCell>
                          {category.created_at 
                            ? new Date(category.created_at).toLocaleDateString()
                            : 'N/A'
                          }
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Admin;