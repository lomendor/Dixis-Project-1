import { Product, ProductStatus, ProductReview, ReviewStatus, Category, RelatedProduct, RelationType } from './types';

/**
 * Mock data for products
 */
export const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Βιολογικό Έξτρα Παρθένο Ελαιόλαδο',
    slug: 'viologiko-ekstra-partheno-elaiolado',
    price: 12.90,
    salePrice: 10.90,
    discount: 15,
    description: 'Εξαιρετικά παρθένο ελαιόλαδο από βιολογικές ελιές Κορωνέικης ποικιλίας. Παράγεται με ψυχρή έκθλιψη για τη διατήρηση όλων των θρεπτικών συστατικών και του πλούσιου αρώματος. Χαμηλή οξύτητα μικρότερη από 0.3%.',
    shortDescription: 'Βιολογικό ελαιόλαδο εξαιρετικής ποιότητας από τη Μεσσηνία',
    image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400&h=400&fit=crop',
    imageAlt: 'Μπουκάλι ελαιόλαδου με ετικέτα Ελαιώνες Καλαμάτας',
    gallery: [
      {
        id: '101',
        src: 'products/oliveoil/main.jpg',
        alt: 'Μπουκάλι ελαιόλαδου με ετικέτα Ελαιώνες Καλαμάτας',
        isMain: true,
      },
      {
        id: '102',
        src: 'products/oliveoil/gallery1.jpg',
        alt: 'Το ελαιόλαδο σε γυάλινο μπολ',
        order: 1,
      },
      {
        id: '103',
        src: 'products/oliveoil/gallery2.jpg',
        alt: 'Ελιές Καλαμών στο δέντρο',
        order: 2,
      },
    ],
    stock: 250,
    sku: 'OIL-BIO-500',
    barcode: '5201234567890',
    weight: 500,
    unit: 'ml',
    rating: 4.9,
    reviewCount: 124,
    categories: [
      {
        id: '10',
        name: 'Ελαιόλαδο',
        slug: 'olive-oil',
      },
      {
        id: '11',
        name: 'Βιολογικά Προϊόντα',
        slug: 'organic-products',
      },
    ],
    tags: ['βιολογικό', 'εξαιρετικά παρθένο', 'ελαιόλαδο', 'Καλαμάτα', 'Μεσσηνία', 'ψυχρή έκθλιψη'],
    isOrganic: true,
    isLocal: true,
    featured: true,
    producerId: '4',
    producerName: 'Ελαιώνες Καλαμάτας',
    producerSlug: 'elaiones-kalamatas',
    producerImage: 'producers/elaiones/logo.jpg',
    origin: 'Ελλάδα',
    regionOfOrigin: 'Μεσσηνία, Καλαμάτα',
    nutrition: {
      servingSize: '15ml',
      calories: 135,
      protein: 0,
      carbohydrates: 0,
      fat: 15,
      saturatedFat: 2.2,
      transFat: 0,
      cholesterol: 0,
      sodium: 0,
      fiber: 0,
      sugar: 0,
    },
    carbonFootprint: 2.5,
    status: ProductStatus.ACTIVE,
    createdAt: '2022-02-10T09:15:00Z',
    updatedAt: '2022-12-15T11:30:00Z',
  },
  {
    id: '2',
    name: 'Μέλι Ανθέων Ολύμπου',
    slug: 'meli-antheon-olumpou',
    price: 9.80,
    description: 'Βιολογικό μέλι ανθέων από τις πλαγιές του Ολύμπου. Πλούσια γεύση με λεπτά αρώματα λουλουδιών της άνοιξης. Συλλέγεται από μελίσσια που δεν εκτίθενται σε φυτοφάρμακα και χημικά.',
    shortDescription: 'Βιολογικό μέλι ανθέων με πλούσια γεύση από τον Όλυμπο',
    image: 'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=400&h=400&fit=crop',
    imageAlt: 'Βάζο με μέλι ανθέων Μελισσοκομείο Βλάχος',
    gallery: [
      {
        id: '201',
        src: 'products/honey/main.jpg',
        alt: 'Βάζο με μέλι ανθέων Μελισσοκομείο Βλάχος',
        isMain: true,
      },
      {
        id: '202',
        src: 'products/honey/gallery1.jpg',
        alt: 'Το μέλι σε ξύλινο κουτάλι',
        order: 1,
      },
      {
        id: '203',
        src: 'products/honey/gallery2.jpg',
        alt: 'Μέλισσες στην κυψέλη',
        order: 2,
      },
    ],
    stock: 120,
    sku: 'HONEY-FLOWER-450',
    barcode: '5201234567906',
    weight: 450,
    unit: 'g',
    rating: 4.8,
    reviewCount: 78,
    categories: [
      {
        id: '20',
        name: 'Μέλι',
        slug: 'honey',
      },
      {
        id: '11',
        name: 'Βιολογικά Προϊόντα',
        slug: 'organic-products',
      },
    ],
    tags: ['βιολογικό', 'μέλι', 'ανθέων', 'Όλυμπος', 'Πιερία'],
    isOrganic: true,
    isLocal: true,
    featured: true,
    producerId: '2',
    producerName: 'Μελισσοκομείο Βλάχος',
    producerSlug: 'melissokomio-vlachos',
    producerImage: 'producers/vlachos/logo.jpg',
    origin: 'Ελλάδα',
    regionOfOrigin: 'Πιερία, Όλυμπος',
    nutrition: {
      servingSize: '20g',
      calories: 60,
      protein: 0.1,
      carbohydrates: 17,
      fat: 0,
      sugar: 16,
    },
    carbonFootprint: 1.8,
    status: ProductStatus.ACTIVE,
    createdAt: '2021-06-05T14:20:00Z',
    updatedAt: '2022-11-10T09:45:00Z',
  },
  {
    id: '3',
    name: 'Φέτα ΠΟΠ Παραδοσιακή',
    slug: 'feta-pop-paradosiaki',
    price: 8.50,
    description: 'Παραδοσιακή φέτα ΠΟΠ παρασκευασμένη από 100% αιγοπρόβειο γάλα από κτηνοτρόφους της Αιτωλοακαρνανίας. Ωριμάζει για τουλάχιστον 3 μήνες σε ξύλινα βαρέλια για πλούσια γεύση και υφή.',
    shortDescription: 'Αυθεντική ελληνική φέτα ΠΟΠ από αιγοπρόβειο γάλα',
    image: 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=400&h=400&fit=crop',
    imageAlt: 'Κομμάτι φέτας σε λευκό φόντο',
    gallery: [
      {
        id: '301',
        src: 'products/feta/main.jpg',
        alt: 'Κομμάτι φέτας σε λευκό φόντο',
        isMain: true,
      },
      {
        id: '302',
        src: 'products/feta/gallery1.jpg',
        alt: 'Συσκευασία φέτας σε άλμη',
        order: 1,
      },
    ],
    stock: 85,
    sku: 'CHEESE-FETA-400',
    barcode: '5201234567913',
    weight: 400,
    unit: 'g',
    rating: 4.7,
    reviewCount: 96,
    categories: [
      {
        id: '30',
        name: 'Τυριά',
        slug: 'cheese',
      },
      {
        id: '31',
        name: 'Προϊόντα ΠΟΠ',
        slug: 'pdo-products',
      },
    ],
    tags: ['φέτα', 'ΠΟΠ', 'τυρί', 'αιγοπρόβειο', 'παραδοσιακό', 'Αιτωλοακαρνανία'],
    isLocal: true,
    featured: false,
    producerId: '3',
    producerName: 'Τυροκομείο Ζήση',
    producerSlug: 'tyrokomio-zisi',
    producerImage: 'producers/zisis/logo.jpg',
    origin: 'Ελλάδα',
    regionOfOrigin: 'Αιτωλοακαρνανία',
    nutrition: {
      servingSize: '30g',
      calories: 74,
      protein: 4.8,
      carbohydrates: 0.7,
      fat: 6,
      saturatedFat: 4.2,
      cholesterol: 25,
      sodium: 260,
      calcium: 140,
    },
    carbonFootprint: 9.3,
    status: ProductStatus.ACTIVE,
    createdAt: '2021-09-20T11:30:00Z',
    updatedAt: '2022-10-25T14:15:00Z',
  },
  {
    id: '4',
    name: 'Κρασί Αγιωργίτικο Ερυθρό',
    slug: 'krasi-agiorgitiko-erythro',
    price: 14.50,
    description: 'Εκλεκτό κρασί ΠΟΠ Νεμέας από την ποικιλία Αγιωργίτικο. Βαθύ ρουμπινί χρώμα με αρώματα κόκκινων φρούτων, βανίλιας και μπαχαρικών. Βελούδινη γεύση με μακρά επίγευση. Ωρίμανση σε δρύινα βαρέλια για 12 μήνες.',
    shortDescription: 'Εκλεκτό κόκκινο κρασί ΠΟΠ Νεμέας από την ποικιλία Αγιωργίτικο',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop',
    imageAlt: 'Μπουκάλι κρασί Αγιωργίτικο με ετικέτα Οινοποιείο Παπαδόπουλος',
    gallery: [
      {
        id: '401',
        src: 'products/wine/main.jpg',
        alt: 'Μπουκάλι κρασί Αγιωργίτικο με ετικέτα Οινοποιείο Παπαδόπουλος',
        isMain: true,
      },
      {
        id: '402',
        src: 'products/wine/gallery1.jpg',
        alt: 'Ποτήρι με κόκκινο κρασί',
        order: 1,
      },
      {
        id: '403',
        src: 'products/wine/gallery2.jpg',
        alt: 'Αμπελώνες στη Νεμέα',
        order: 2,
      },
    ],
    stock: 45,
    sku: 'WINE-AGIORGITIKO-750',
    barcode: '5201234567920',
    weight: 750,
    unit: 'ml',
    rating: 4.6,
    reviewCount: 68,
    categories: [
      {
        id: '40',
        name: 'Κρασιά',
        slug: 'wines',
      },
      {
        id: '31',
        name: 'Προϊόντα ΠΟΠ',
        slug: 'pdo-products',
      },
    ],
    tags: ['κρασί', 'ερυθρό', 'αγιωργίτικο', 'ΠΟΠ', 'Νεμέα', 'Κορινθία'],
    isLocal: true,
    featured: true,
    producerId: '5',
    producerName: 'Οινοποιείο Παπαδόπουλος',
    producerSlug: 'oinopoieio-papadopoulos',
    producerImage: 'producers/papadopoulos/logo.jpg',
    origin: 'Ελλάδα',
    regionOfOrigin: 'Νεμέα, Κορινθία',
    nutrition: {
      servingSize: '100ml',
      calories: 85,
      carbohydrates: 2.6,
      alcohol: 13.5,
    },
    carbonFootprint: 2.8,
    status: ProductStatus.ACTIVE,
    createdAt: '2021-08-10T09:40:00Z',
    updatedAt: '2022-11-05T16:20:00Z',
  },
  {
    id: '5',
    name: 'Βιολογικά Μήλα Ζαγορίν',
    slug: 'viologika-mila-zagorin',
    price: 3.90,
    description: 'Βιολογικά μήλα ποικιλίας Ζαγορίν από το Αγρόκτημα Καλαϊτζής στην Πέλλα. Τραγανά, ζουμερά με γλυκόξινη γεύση. Καλλιεργούνται χωρίς χημικά λιπάσματα ή φυτοφάρμακα σε ιδανικό υψόμετρο για άριστη ποιότητα.',
    shortDescription: 'Βιολογικά μήλα ποικιλίας Ζαγορίν από την Πέλλα',
    image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400&h=400&fit=crop',
    imageAlt: 'Κόκκινα μήλα σε ξύλινο κιβώτιο',
    gallery: [
      {
        id: '501',
        src: 'products/apples/main.jpg',
        alt: 'Κόκκινα μήλα σε ξύλινο κιβώτιο',
        isMain: true,
      },
      {
        id: '502',
        src: 'products/apples/gallery1.jpg',
        alt: 'Κομμένο μήλο που δείχνει την εσωτερική υφή',
        order: 1,
      },
    ],
    stock: 200,
    sku: 'FRUIT-APPLE-1KG',
    barcode: '5201234567937',
    weight: 1000,
    unit: 'g',
    unitCount: 6,
    rating: 4.8,
    reviewCount: 42,
    categories: [
      {
        id: '50',
        name: 'Φρούτα',
        slug: 'fruits',
      },
      {
        id: '11',
        name: 'Βιολογικά Προϊόντα',
        slug: 'organic-products',
      },
    ],
    tags: ['βιολογικό', 'μήλα', 'φρούτα', 'Ζαγορίν', 'Πέλλα'],
    isOrganic: true,
    isLocal: true,
    featured: false,
    producerId: '1',
    producerName: 'Αγρόκτημα Καλαϊτζής',
    producerSlug: 'agroktima-kalaitzis',
    producerImage: 'producers/kalaitzis/logo.jpg',
    origin: 'Ελλάδα',
    regionOfOrigin: 'Πέλλα',
    nutrition: {
      servingSize: '100g',
      calories: 52,
      protein: 0.3,
      carbohydrates: 14,
      fat: 0.2,
      fiber: 2.4,
      sugar: 10.4,
      potassium: 107,
      vitaminC: 4.6,
    },
    carbonFootprint: 0.4,
    status: ProductStatus.ACTIVE,
    createdAt: '2022-03-18T13:10:00Z',
    updatedAt: '2022-12-10T10:40:00Z',
  },
];

/**
 * Mock data for product reviews
 */
export const mockProductReviews: Record<string, ProductReview[]> = {
  '1': [ // Βιολογικό Έξτρα Παρθένο Ελαιόλαδο
    {
      id: '1001',
      productId: '1',
      userId: 'user123',
      userName: 'Γιώργος Παπαδόπουλος',
      userAvatar: 'users/user123.jpg',
      rating: 5,
      title: 'Εξαιρετικό λάδι!',
      comment: 'Το καλύτερο ελαιόλαδο που έχω δοκιμάσει. Υπέροχο άρωμα και γεύση. Το χρησιμοποιώ κυρίως σε σαλάτες για να αναδειχθεί η γεύση του. Αξίζει κάθε λεπτό της τιμής του.',
      photos: ['reviews/1001/photo1.jpg', 'reviews/1001/photo2.jpg'],
      verifiedPurchase: true,
      helpfulCount: 15,
      status: ReviewStatus.PUBLISHED,
      createdAt: '2022-06-15T14:30:00Z',
      updatedAt: '2022-06-15T14:30:00Z',
      replyComment: 'Σας ευχαριστούμε πολύ για τα καλά σας λόγια! Χαιρόμαστε που απολαύσατε το ελαιόλαδό μας.',
      replyDate: '2022-06-16T09:20:00Z',
    },
    {
      id: '1002',
      productId: '1',
      userId: 'user456',
      userName: 'Ελένη Δημητρίου',
      userAvatar: 'users/user456.jpg',
      rating: 4,
      title: 'Πολύ καλή ποιότητα',
      comment: 'Πολύ καλό λάδι με έντονο άρωμα. Η συσκευασία είναι επίσης πολύ όμορφη και προστατεύει καλά το προϊόν από το φως. Θα προτιμούσα λίγο πιο εύχρηστο στόμιο για το σερβίρισμα, αλλά συνολικά είμαι πολύ ικανοποιημένη.',
      verifiedPurchase: true,
      helpfulCount: 8,
      status: ReviewStatus.PUBLISHED,
      createdAt: '2022-07-10T11:45:00Z',
      updatedAt: '2022-07-10T11:45:00Z',
    },
  ],
  '2': [ // Μέλι Ανθέων Ολύμπου
    {
      id: '2001',
      productId: '2',
      userId: 'user789',
      userName: 'Νίκος Αντωνίου',
      userAvatar: 'users/user789.jpg',
      rating: 5,
      title: 'Υπέροχη γεύση!',
      comment: 'Εκπληκτικό μέλι με πλούσια γεύση και άρωμα λουλουδιών. Δεν έχει καμία σχέση με τα τυποποιημένα του σούπερ μάρκετ. Επιτέλους βρήκα αυθεντικό, ποιοτικό μέλι χωρίς νοθείες. Θα το αγοράζω συνέχεια!',
      photos: ['reviews/2001/photo1.jpg'],
      verifiedPurchase: true,
      helpfulCount: 12,
      status: ReviewStatus.PUBLISHED,
      createdAt: '2022-08-05T16:15:00Z',
      updatedAt: '2022-08-05T16:15:00Z',
      replyComment: 'Ευχαριστούμε για την κριτική σας! Είναι μεγάλη μας χαρά που απολαύσατε το μέλι μας. Το μεράκι και η αγάπη για τη μελισσοκομία είναι το μυστικό μας.',
      replyDate: '2022-08-06T10:30:00Z',
    },
    {
      id: '2002',
      productId: '2',
      userId: 'user234',
      userName: 'Μαρία Κωνσταντίνου',
      userAvatar: null,
      rating: 4,
      title: 'Πολύ καλό μέλι',
      comment: 'Πραγματικά νόστιμο μέλι με φυσική γεύση. Όχι υπερβολικά γλυκό και με υπέροχα αρώματα. Το συνιστώ ανεπιφύλακτα σε όσους αγαπούν το καλό μέλι. Θα ήθελα να δοκιμάσω και άλλες ποικιλίες από τον ίδιο παραγωγό.',
      verifiedPurchase: true,
      helpfulCount: 5,
      status: ReviewStatus.PUBLISHED,
      createdAt: '2022-09-20T14:50:00Z',
      updatedAt: '2022-09-20T14:50:00Z',
    },
  ],
};

/**
 * Mock data for related products
 */
export const mockRelatedProducts: Record<string, RelatedProduct[]> = {
  '1': [ // Related products for Βιολογικό Έξτρα Παρθένο Ελαιόλαδο
    {
      id: '6',
      name: 'Ελιές Καλαμών Βιολογικές',
      slug: 'elies-kalamon-viologikes',
      price: 6.50,
      image: 'products/olives/main.jpg',
      relationType: RelationType.COMPLEMENTARY,
    },
    {
      id: '7',
      name: 'Βαλσάμικο Ξύδι Παλαιωμένο',
      slug: 'valsamiko-xydi-palaiomeno',
      price: 8.90,
      image: 'products/vinegar/main.jpg',
      relationType: RelationType.FREQUENTLY_BOUGHT_TOGETHER,
    },
    {
      id: '8',
      name: 'Έξτρα Παρθένο Ελαιόλαδο Συμβατικό',
      slug: 'extra-partheno-elaiolado-symvatiko',
      price: 9.50,
      image: 'products/regularodil/main.jpg',
      relationType: RelationType.ALTERNATIVE,
    },
  ],
  '2': [ // Related products for Μέλι Ανθέων Ολύμπου
    {
      id: '9',
      name: 'Κηρήθρα με Μέλι',
      slug: 'kirithia-me-meli',
      price: 15.90,
      salePrice: 13.90,
      image: 'products/honeycomb/main.jpg',
      relationType: RelationType.COMPLEMENTARY,
    },
    {
      id: '10',
      name: 'Μέλι Πεύκου',
      slug: 'meli-peukoi',
      price: 12.50,
      image: 'products/pinehoney/main.jpg',
      relationType: RelationType.SIMILAR,
    },
    {
      id: '11',
      name: 'Μείγμα Ξηρών Καρπών με Μέλι',
      slug: 'meigma-xiron-karpon-me-meli',
      price: 7.80,
      image: 'products/nutmix/main.jpg',
      relationType: RelationType.FREQUENTLY_BOUGHT_TOGETHER,
    },
  ],
};

/**
 * Mock categories
 */
export const mockCategories: Category[] = [
  {
    id: '10',
    name: 'Ελαιόλαδο',
    slug: 'olive-oil',
    icon: 'icons/oil.svg',
    image: 'categories/oliveoil.jpg',
    description: 'Εξαιρετικά παρθένα ελαιόλαδα από Ελληνικούς ελαιώνες',
    count: 28,
  },
  {
    id: '20',
    name: 'Μέλι',
    slug: 'honey',
    icon: 'icons/honey.svg',
    image: 'categories/honey.jpg',
    description: 'Αγνό μέλι από Έλληνες μελισσοκόμους',
    count: 15,
  },
  {
    id: '30',
    name: 'Τυριά',
    slug: 'cheese',
    icon: 'icons/cheese.svg',
    image: 'categories/cheese.jpg',
    description: 'Παραδοσιακά ελληνικά τυριά από τοπικά τυροκομεία',
    count: 42,
  },
  {
    id: '40',
    name: 'Κρασιά',
    slug: 'wines',
    icon: 'icons/wine.svg',
    image: 'categories/wine.jpg',
    description: 'Εκλεκτά κρασιά από ελληνικά οινοποιεία',
    count: 56,
  },
  {
    id: '50',
    name: 'Φρούτα',
    slug: 'fruits',
    icon: 'icons/fruit.svg',
    image: 'categories/fruit.jpg',
    description: 'Φρέσκα φρούτα από Έλληνες παραγωγούς',
    count: 35,
  },
  {
    id: '11',
    name: 'Βιολογικά Προϊόντα',
    slug: 'organic-products',
    icon: 'icons/organic.svg',
    image: 'categories/organic.jpg',
    description: 'Προϊόντα βιολογικής καλλιέργειας και παραγωγής',
    count: 95,
  },
  {
    id: '31',
    name: 'Προϊόντα ΠΟΠ',
    slug: 'pdo-products',
    icon: 'icons/pdo.svg',
    image: 'categories/pdo.jpg',
    description: 'Προϊόντα Προστατευόμενης Ονομασίας Προέλευσης',
    count: 67,
  },
];

/**
 * Get mock product by ID
 */
export function getMockProductById(id: string): Product | undefined {
  return mockProducts.find(product => product.id === id);
}

/**
 * Get mock products by category
 */
export function getMockProductsByCategory(categoryId: string): Product[] {
  return mockProducts.filter(product =>
    product?.categories?.some(category => category.id === categoryId)
  );
}

/**
 * Get mock products by producer
 */
export function getMockProductsByProducer(producerId: string): Product[] {
  return mockProducts.filter(product => product.producerId === producerId);
}

/**
 * Get mock product reviews by product ID
 */
export function getMockProductReviews(productId: string): ProductReview[] {
  return mockProductReviews[productId] || [];
}

/**
 * Get mock related products by product ID
 */
export function getMockRelatedProducts(productId: string): RelatedProduct[] {
  return mockRelatedProducts[productId] || [];
}