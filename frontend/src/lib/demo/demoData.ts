// Demo Data Service for Dixis Fresh
// Realistic Greek B2B marketplace data for demonstrations

export interface DemoProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  wholesale_price: number;
  main_image: string;
  producer: {
    business_name: string;
    city: string;
    region: string;
  };
  category: {
    name: string;
  };
  min_order_quantity: number;
  bulk_discount_threshold: number;
  bulk_discount_percentage: number;
  stock: number;
  origin: string;
  certifications: string[];
  harvest_date?: string;
  shelf_life?: string;
}

export interface DemoProducer {
  id: string;
  business_name: string;
  contact_person: string;
  email: string;
  phone: string;
  city: string;
  region: string;
  specialty: string;
  description: string;
  certifications: string[];
  established_year: number;
  total_products: number;
  rating: number;
  image: string;
}

export interface DemoOrder {
  id: string;
  order_number: string;
  customer_name: string;
  total_amount: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  order_date: string;
  delivery_date?: string;
  products: Array<{
    product_name: string;
    quantity: number;
    unit_price: number;
    total_price: number;
  }>;
}

// Realistic Greek B2B Products
export const demoProducts: DemoProduct[] = [
  {
    id: '1',
    name: 'Ελαιόλαδο Εξτρα Παρθένο Καλαμάτας',
    description: 'Κορυφαίας ποιότητας εξτρα παρθένο ελαιόλαδο από τις ελιές Κορωνέικης της Μεσσηνίας. Παραδοσιακή παραγωγή με ψυχρή έκθλιψη.',
    price: 28.50,
    wholesale_price: 22.80,
    main_image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400&h=300&fit=crop',
    producer: {
      business_name: 'Ελαιώνες Μεσσηνίας Α.Ε.',
      city: 'Καλαμάτα',
      region: 'Πελοπόννησος'
    },
    category: { name: 'Ελαιόλαδο' },
    min_order_quantity: 12,
    bulk_discount_threshold: 50,
    bulk_discount_percentage: 8,
    stock: 340,
    origin: 'Μεσσηνία, Πελοπόννησος',
    certifications: ['BIO', 'PDO Καλαμάτας', 'HACCP'],
    harvest_date: 'Νοέμβριος 2023',
    shelf_life: '24 μήνες'
  },
  {
    id: '2',
    name: 'Φέτα ΠΟΠ Ήπειρος',
    description: 'Αυθεντική φέτα ΠΟΠ από πρόβειο και κατσικίσιο γάλα. Παραδοσιακή παραγωγή στα βουνά της Ηπείρου με ωρίμανση 3 μηνών.',
    price: 15.20,
    wholesale_price: 11.40,
    main_image: 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=400&h=300&fit=crop',
    producer: {
      business_name: 'Τυροκομείο Ηπείρου Κ. Παπαδόπουλος',
      city: 'Μέτσοβο',
      region: 'Ήπειρος'
    },
    category: { name: 'Γαλακτοκομικά' },
    min_order_quantity: 6,
    bulk_discount_threshold: 30,
    bulk_discount_percentage: 12,
    stock: 180,
    origin: 'Μέτσοβο, Ήπειρος',
    certifications: ['ΠΟΠ', 'Βιολογικό', 'HACCP'],
    shelf_life: '3 μήνες'
  },
  {
    id: '3',
    name: 'Μέλι Ελάτου Πάρνηθας',
    description: 'Σκούρο μέλι ελάτου από τις πλαγιές της Πάρνηθας. Πλούσιο σε αντιοξειδωτικά και μετάλλα με χαρακτηριστική γεύση.',
    price: 24.80,
    wholesale_price: 18.60,
    main_image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=400&h=300&fit=crop',
    producer: {
      business_name: 'Μελισσοκομία Αθανασίου',
      city: 'Αχαρνές',
      region: 'Αττική'
    },
    category: { name: 'Μέλι & Προϊόντα Κυψέλης' },
    min_order_quantity: 8,
    bulk_discount_threshold: 24,
    bulk_discount_percentage: 10,
    stock: 95,
    origin: 'Πάρνηθα, Αττική',
    certifications: ['BIO', 'Premium Artisan'],
    harvest_date: 'Αύγουστος 2023',
    shelf_life: '36 μήνες'
  },
  {
    id: '4',
    name: 'Ντομάτες Σαντορίνης Βιολογικές',
    description: 'Χαρακτηριστικές κερασότοματες Σαντορίνης με έντονη γεύση και άρωμα. Καλλιεργημένες σε ηφαιστειογενή εδάφη χωρίς χημικά.',
    price: 8.50,
    wholesale_price: 6.40,
    main_image: 'https://images.unsplash.com/photo-1546470427-e3b68632d0df?w=400&h=300&fit=crop',
    producer: {
      business_name: 'Αγρόκτημα Κυκλάδων',
      city: 'Σαντορίνη',
      region: 'Κυκλάδες'
    },
    category: { name: 'Λαχανικά' },
    min_order_quantity: 20,
    bulk_discount_threshold: 100,
    bulk_discount_percentage: 15,
    stock: 450,
    origin: 'Σαντορίνη, Κυκλάδες',
    certifications: ['BIO', 'ΠΓΕ Σαντορίνης'],
    harvest_date: 'Ιούλιος 2024',
    shelf_life: '7 ημέρες'
  },
  {
    id: '5',
    name: 'Κρασί Ασύρτικο Σαντορίνης',
    description: 'Λευκό κρασί Ασύρτικο ΠΟΠ Σαντορίνης από αμπέλια 80 ετών. Μινεραλό με χαρακτηριστική οξύτητα και άρωμα θάλασσας.',
    price: 35.00,
    wholesale_price: 26.25,
    main_image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
    producer: {
      business_name: 'Οινοποιείο Αντωνίου',
      city: 'Σαντορίνη',
      region: 'Κυκλάδες'
    },
    category: { name: 'Κρασιά' },
    min_order_quantity: 6,
    bulk_discount_threshold: 24,
    bulk_discount_percentage: 12,
    stock: 120,
    origin: 'Σαντορίνη, Κυκλάδες',
    certifications: ['ΠΟΠ Σαντορίνης', 'Vegan Wine'],
    harvest_date: 'Σεπτέμβριος 2023',
    shelf_life: '10 χρόνια'
  },
  {
    id: '6',
    name: 'Παστίτσιο Τραχανά Κρήτης',
    description: 'Παραδοσιακός τραχανάς από κατσικίσιο γάλα και σιτάρι ντουρούμ. Χειροποίητος με αιώνια συνταγή της κρητικής γαστρονομίας.',
    price: 12.30,
    wholesale_price: 9.25,
    main_image: 'https://images.unsplash.com/photo-1509358271058-acd22cc93898?w=400&h=300&fit=crop',
    producer: {
      business_name: 'Κρητικές Γεύσεις Α.Ε.',
      city: 'Ηράκλειο',
      region: 'Κρήτη'
    },
    category: { name: 'Παραδοσιακά Προϊόντα' },
    min_order_quantity: 10,
    bulk_discount_threshold: 50,
    bulk_discount_percentage: 15,
    stock: 200,
    origin: 'Κρήτη',
    certifications: ['Παραδοσιακό Προϊόν', 'Χωρίς Συντηρητικά'],
    shelf_life: '12 μήνες'
  }
];

// Realistic Greek Producers
export const demoProducers: DemoProducer[] = [
  {
    id: '1',
    business_name: 'Ελαιώνες Μεσσηνίας Α.Ε.',
    contact_person: 'Γιάννης Παπαγεωργίου',
    email: 'info@eleonas-messinia.gr',
    phone: '+30 27210 45678',
    city: 'Καλαμάτα',
    region: 'Πελοπόννησος',
    specialty: 'Ελαιόλαδο & Επιτραπέζιες Ελιές',
    description: 'Οικογενειακή επιχείρηση 3ης γενιάς με 120 στρέμματα ελαιώνων στην καρδιά της Μεσσηνίας. Παράγουμε εξτρα παρθένο ελαιόλαδο υψηλής ποιότητας με παραδοσιακές μεθόδους.',
    certifications: ['BIO', 'PDO Καλαμάτας', 'HACCP', 'ISO 22000'],
    established_year: 1952,
    total_products: 8,
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400&h=300&fit=crop'
  },
  {
    id: '2',
    business_name: 'Τυροκομείο Ηπείρου Κ. Παπαδόπουλος',
    contact_person: 'Κώστας Παπαδόπουλος',
    email: 'kostas@tyroepeirus.gr',
    phone: '+30 26560 41235',
    city: 'Μέτσοβο',
    region: 'Ήπειρος',
    specialty: 'Τυριά ΠΟΠ & Γαλακτοκομικά',
    description: 'Τυροκομείο με έδρα το Μέτσοβο που παράγει αυθεντικά ελληνικά τυριά από πρόβειο και κατσικίσιο γάλα των βοσκότοπων της Ηπείρου.',
    certifications: ['ΠΟΠ', 'Βιολογικό', 'HACCP'],
    established_year: 1985,
    total_products: 12,
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=400&h=300&fit=crop'
  },
  {
    id: '3',
    business_name: 'Αγρόκτημα Κυκλάδων',
    contact_person: 'Μαρία Κουτσούκου',
    email: 'maria@agrokyklades.gr',
    phone: '+30 22860 32541',
    city: 'Σαντορίνη',
    region: 'Κυκλάδες',
    specialty: 'Βιολογικά Λαχανικά & Όσπρια',
    description: 'Πιστοποιημένη βιολογική μονάδα που καλλιεργεί παραδοσιακές ποικιλίες λαχανικών στο μοναδικό ηφαιστειογενές έδαφος της Σαντορίνης.',
    certifications: ['BIO', 'ΠΓΕ Σαντορίνης', 'Vegan'],
    established_year: 2008,
    total_products: 15,
    rating: 4.7,
    image: 'https://images.unsplash.com/photo-1546470427-e3b68632d0df?w=400&h=300&fit=crop'
  }
];

// Demo Orders for Analytics
export const demoOrders: DemoOrder[] = [
  {
    id: '1',
    order_number: 'DXS-2024-001',
    customer_name: 'Εστιατόριο Ακρόπολις',
    total_amount: 486.30,
    status: 'delivered',
    order_date: '2024-01-15',
    delivery_date: '2024-01-17',
    products: [
      { product_name: 'Ελαιόλαδο Εξτρα Παρθένο', quantity: 12, unit_price: 22.80, total_price: 273.60 },
      { product_name: 'Φέτα ΠΟΠ Ήπειρος', quantity: 18, unit_price: 11.40, total_price: 205.20 },
      { product_name: 'Μέλι Ελάτου', quantity: 4, unit_price: 18.60, total_price: 74.40 }
    ]
  },
  {
    id: '2',
    order_number: 'DXS-2024-002',
    customer_name: 'Ξενοδοχείο Μυκονιάτικο',
    total_amount: 1250.80,
    status: 'shipped',
    order_date: '2024-01-18',
    delivery_date: '2024-01-20',
    products: [
      { product_name: 'Ασύρτικο Σαντορίνης', quantity: 24, unit_price: 26.25, total_price: 630.00 },
      { product_name: 'Ντομάτες Σαντορίνης', quantity: 50, unit_price: 6.40, total_price: 320.00 },
      { product_name: 'Τραχανάς Κρήτης', quantity: 30, unit_price: 9.25, total_price: 277.50 }
    ]
  }
];

// Demo Analytics Data
export const demoAnalytics = {
  monthlyRevenue: {
    labels: ['Ιαν', 'Φεβ', 'Μαρ', 'Απρ', 'Μάι', 'Ιουν'],
    data: [12450, 15680, 18920, 22340, 19870, 25630]
  },
  topProducts: [
    { name: 'Ελαιόλαδο Εξτρα Παρθένο', sales: 340, revenue: 7752.00 },
    { name: 'Φέτα ΠΟΠ Ήπειρος', sales: 280, revenue: 3192.00 },
    { name: 'Ασύρτικο Σαντορίνης', sales: 150, revenue: 3937.50 },
    { name: 'Μέλι Ελάτου', sales: 120, revenue: 2232.00 }
  ],
  customerStats: {
    totalCustomers: 145,
    activeCustomers: 89,
    newCustomers: 23,
    averageOrderValue: 385.50
  },
  regionDistribution: [
    { region: 'Αττική', percentage: 35, orders: 89 },
    { region: 'Θεσσαλονίκη', percentage: 25, orders: 64 },
    { region: 'Πάτρα', percentage: 15, orders: 38 },
    { region: 'Κρήτη', percentage: 12, orders: 31 },
    { region: 'Άλλες', percentage: 13, orders: 33 }
  ]
};

// Helper functions for demo mode
export const isDemoMode = () => {
  if (typeof window !== 'undefined') {
    return window.location.search.includes('demo=true') || 
           localStorage.getItem('dixis_demo_mode') === 'true';
  }
  return false;
};

export const enableDemoMode = () => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('dixis_demo_mode', 'true');
  }
};

export const disableDemoMode = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('dixis_demo_mode');
  }
};

export const getDemoProducts = (count?: number): DemoProduct[] => {
  return count ? demoProducts.slice(0, count) : demoProducts;
};

export const getDemoProducers = (count?: number): DemoProducer[] => {
  return count ? demoProducers.slice(0, count) : demoProducers;
};

export const getDemoOrders = (count?: number): DemoOrder[] => {
  return count ? demoOrders.slice(0, count) : demoOrders;
};