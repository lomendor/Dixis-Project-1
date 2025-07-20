'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import BusinessIntelligenceDashboard from '@/components/dashboard/BusinessIntelligenceDashboard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Package, 
  DollarSign,
  AlertCircle,
  Crown,
  Zap
} from 'lucide-react';

export default function AnalyticsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [hasAccess, setHasAccess] = useState(false);
  const [userRole, setUserRole] = useState<string>('');
  const [producerId, setProducerId] = useState<number | undefined>();

  useEffect(() => {
    if (user && !authLoading) {
      setUserRole(user.role);
      
      // Check access permissions
      const allowedRoles = ['admin', 'producer', 'b2b'];
      setHasAccess(allowedRoles.includes(user.role));
      
      // Set producer ID if user is a producer
      if (user.role === 'producer' && user.producer_id) {
        setProducerId(user.producer_id);
      }
    }
  }, [user, authLoading]);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <CardTitle>Απαιτείται Σύνδεση</CardTitle>
            <CardDescription>
              Πρέπει να συνδεθείτε για να δείτε τα αναλυτικά στοιχεία.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => window.location.href = '/login'} 
              className="w-full"
            >
              Σύνδεση
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Crown className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <CardTitle>Περιορισμένη Πρόσβαση</CardTitle>
            <CardDescription>
              Τα αναλυτικά στοιχεία είναι διαθέσιμα μόνο για διαχειριστές, παραγωγούς και B2B πελάτες.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <Badge variant="secondary" className="mb-4">
                Τρέχων ρόλος: {user.role}
              </Badge>
            </div>
            
            {user.role === 'customer' && (
              <div className="space-y-3">
                <p className="text-sm text-gray-600 text-center">
                  Θέλετε πρόσβαση σε προηγμένα αναλυτικά στοιχεία;
                </p>
                <div className="grid grid-cols-1 gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => window.location.href = '/upgrade-to-b2b'}
                  >
                    <Zap className="h-4 w-4 mr-2" />
                    Αναβάθμιση σε B2B
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => window.location.href = '/become-producer'}
                  >
                    <Package className="h-4 w-4 mr-2" />
                    Γίνετε Παραγωγός
                  </Button>
                </div>
              </div>
            )}
            
            <Button 
              onClick={() => window.location.href = '/dashboard'} 
              className="w-full"
              variant="outline"
            >
              Επιστροφή στον Πίνακα Ελέγχου
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <BarChart3 className="h-8 w-8 text-green-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Αναλυτικά Στοιχεία
              </h1>
              <p className="text-gray-600">
                Καλώς ήρθατε, {user.name}! 
                {userRole === 'producer' && ' Δείτε τις επιδόσεις των προϊόντων σας.'}
                {userRole === 'admin' && ' Επισκόπηση όλων των δεδομένων της πλατφόρμας.'}
                {userRole === 'b2b' && ' Αναλύστε τις επιχειρηματικές σας μετρήσεις.'}
              </p>
            </div>
          </div>
          
          {/* Role-specific badges */}
          <div className="flex flex-wrap gap-2">
            <Badge variant="default" className="bg-green-600">
              {userRole === 'admin' && 'Διαχειριστής'}
              {userRole === 'producer' && 'Παραγωγός'}
              {userRole === 'b2b' && 'B2B Πελάτης'}
            </Badge>
            
            {userRole === 'admin' && (
              <Badge variant="secondary">Πλήρης Πρόσβαση</Badge>
            )}
            
            {userRole === 'producer' && producerId && (
              <Badge variant="secondary">Producer ID: {producerId}</Badge>
            )}
            
            {userRole === 'b2b' && (
              <Badge variant="secondary">Επιχειρηματικός Λογαριασμός</Badge>
            )}
          </div>
        </div>

        {/* Quick Stats Cards for different roles */}
        {userRole === 'producer' && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Τα Προϊόντα Μου</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">-</div>
                <p className="text-xs text-muted-foreground">Ενεργά προϊόντα</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Πωλήσεις Μήνα</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">-</div>
                <p className="text-xs text-muted-foreground">Έσοδα τρέχοντος μήνα</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Παραγγελίες</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">-</div>
                <p className="text-xs text-muted-foreground">Συνολικές παραγγελίες</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Πελάτες</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">-</div>
                <p className="text-xs text-muted-foreground">Μοναδικοί πελάτες</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Business Intelligence Dashboard */}
        <BusinessIntelligenceDashboard 
          producerId={producerId}
          userRole={userRole}
        />

        {/* Additional Information */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Πληροφορίες Αναλυτικών</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Τύπος Λογαριασμού:</span>
                <Badge variant="outline">{userRole}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Επίπεδο Πρόσβασης:</span>
                <span className="text-sm font-medium">
                  {userRole === 'admin' ? 'Πλήρης' : 'Περιορισμένη'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Τελευταία Ενημέρωση:</span>
                <span className="text-sm">{new Date().toLocaleDateString('el-GR')}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Χρήσιμοι Σύνδεσμοι</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" size="sm" className="w-full justify-start">
                <BarChart3 className="h-4 w-4 mr-2" />
                Εξαγωγή Αναφοράς
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <TrendingUp className="h-4 w-4 mr-2" />
                Προβλέψεις Πωλήσεων
              </Button>
              {userRole === 'producer' && (
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Package className="h-4 w-4 mr-2" />
                  Διαχείριση Προϊόντων
                </Button>
              )}
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Users className="h-4 w-4 mr-2" />
                Υποστήριξη
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
