import { logger } from '@/lib/logging/productionLogger';

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const backendUrl = `http://localhost:8000/api/v1/admin/producer-applications`;
    
    const headers: Record<string, string> = {
      'Accept': 'application/json',
    };
    
    // Add authorization header if available
    const authHeader = request.headers.get('authorization');
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }
    
    const response = await fetch(backendUrl, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      const errorData = await response.text();
      logger.error('Backend error:', new Error(errorData));
      throw new Error(`Backend responded with ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    logger.error('Producer applications API proxy error:', error instanceof Error ? error : new Error(String(error)));
    
    // Return mock data for development
    const mockApplications = [
      {
        id: 1,
        businessName: "Αγρόκτημα Παπαδόπουλος",
        ownerName: "Γιάννης Παπαδόπουλος",
        email: "info@papadopoulos-farm.gr",
        phone: "+30 210 1234567",
        address: "Λεωφόρος Κηφισίας 123",
        city: "Αθήνα",
        postalCode: "12345",
        description: "Οικογενειακή επιχείρηση με 20 χρόνια εμπειρίας στην παραγωγή βιολογικού ελαιολάδου και ελιών. Βρισκόμαστε στην Κρήτη και καλλιεργούμε 50 στρέμματα με παραδοσιακές μεθόδους.",
        productTypes: ["Ελαιόλαδο & Ελιές", "Βότανα & Μπαχαρικά"],
        experience: "10+",
        certifications: ["Βιολογικό (ΒΙΟ)", "ΠΟΠ (Προστατευόμενη Ονομασία Προέλευσης)"],
        status: "pending",
        createdAt: "2025-01-10T10:00:00Z",
        updatedAt: "2025-01-10T10:00:00Z"
      },
      {
        id: 2,
        businessName: "Μελισσοκομία Κρήτης",
        ownerName: "Μαρία Αντωνίου",
        email: "maria@crete-honey.gr",
        phone: "+30 2810 987654",
        address: "Χωριό Αρχάνες",
        city: "Ηράκλειο",
        postalCode: "70100",
        description: "Παραδοσιακή μελισσοκομία με έδρα την Κρήτη. Παράγουμε θυμαρίσιο μέλι, μέλι πεύκου και άλλα προϊόντα κυψέλης υψηλής ποιότητας.",
        productTypes: ["Μέλι & Προϊόντα Μελιού"],
        experience: "6-10",
        certifications: ["Βιολογικό (ΒΙΟ)", "HACCP"],
        status: "approved",
        createdAt: "2025-01-09T14:30:00Z",
        updatedAt: "2025-01-09T16:45:00Z"
      },
      {
        id: 3,
        businessName: "Τυροκομείο Μετσόβου",
        ownerName: "Δημήτρης Βλάχος",
        email: "info@metsovo-cheese.gr",
        phone: "+30 26560 41234",
        address: "Κεντρική Πλατεία 5",
        city: "Μέτσοβο",
        postalCode: "44200",
        description: "Παραδοσιακό τυροκομείο στο Μέτσοβο με ειδικότητα στα τυριά από κατσικίσιο και πρόβειο γάλα. Χρησιμοποιούμε παραδοσιακές συνταγές που περνούν από γενιά σε γενιά.",
        productTypes: ["Τυριά & Γαλακτοκομικά"],
        experience: "10+",
        certifications: ["ΠΟΠ (Προστατευόμενη Ονομασία Προέλευσης)", "HACCP"],
        status: "pending",
        createdAt: "2025-01-08T09:15:00Z",
        updatedAt: "2025-01-08T09:15:00Z"
      }
    ];
    
    return NextResponse.json(mockApplications);
  }
}