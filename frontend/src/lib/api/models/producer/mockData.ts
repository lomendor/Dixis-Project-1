import { Producer } from './types';

export const mockProducers: Producer[] = [
  {
    id: 1,
    user_id: 101,
    business_name: "Ελαιώνες Κρήτης",
    slug: "elaioneskriti",
    bio: "Παραδοσιακή οικογένεια παραγωγών εξαιρετικού παρθένου ελαιολάδου από την Κρήτη. Με πάνω από 100 χρόνια εμπειρίας, καλλιεργούμε κορωνέικες ελιές με βιολογικές μεθόδους.",
    location: "Χανιά, Κρήτη",
    profile_image: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400&h=400&fit=crop",
    cover_image: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=800&h=400&fit=crop",
    specialties: ["Ελαιόλαδο", "Βιολογικά Προϊόντα", "Παραδοσιακές Μέθοδοι"],
    contact_email: "info@elaioneskriti.gr",
    contact_phone: "+30 28210 12345",
    website: "https://elaioneskriti.gr",
    social_media: {
      facebook: "elaioneskriti",
      instagram: "elaioneskriti_official"
    },
    verification_status: "verified",
    created_at: "2023-01-15T10:00:00Z",
    updated_at: "2024-01-15T10:00:00Z"
  },
  {
    id: 2,
    user_id: 102,
    business_name: "Αμπελώνες Νεμέας",
    slug: "ampelonesnemeas",
    bio: "Οικογενειακό οινοποιείο στη Νεμέα με εξειδίκευση στην καλλιέργεια Αγιωργίτικου. Παράγουμε κρασιά υψηλής ποιότητας με σεβασμό στην παράδοση και το περιβάλλον.",
    location: "Νεμέα, Κορινθία",
    profile_image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop",
    cover_image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=400&fit=crop",
    specialties: ["Κρασί", "Αγιωργίτικο", "Οικολογική Καλλιέργεια"],
    contact_email: "contact@ampelonesnemeas.gr",
    contact_phone: "+30 27460 22345",
    website: "https://ampelonesnemeas.gr",
    social_media: {
      facebook: "ampelonesnemeas",
      instagram: "nemea_wines"
    },
    verification_status: "verified",
    created_at: "2023-02-20T10:00:00Z",
    updated_at: "2024-02-20T10:00:00Z"
  },
  {
    id: 3,
    user_id: 103,
    business_name: "Μελισσοκομία Πάρνηθας",
    slug: "meliparnitha",
    bio: "Παραδοσιακή μελισσοκομία στους πρόποδες της Πάρνηθας. Παράγουμε φυσικό μέλι από θυμάρι, πεύκο και άγρια λουλούδια χωρίς χημικές προσθήκες.",
    location: "Πάρνηθα, Αττική",
    profile_image: "https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=400&h=400&fit=crop",
    cover_image: "https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=800&h=400&fit=crop",
    specialties: ["Μέλι", "Θυμαρίσιο Μέλι", "Πευκόμελο", "Φυσικά Προϊόντα"],
    contact_email: "info@meliparnitha.gr",
    contact_phone: "+30 210 1234567",
    social_media: {
      instagram: "meli_parnitha"
    },
    verification_status: "verified",
    created_at: "2023-03-10T10:00:00Z",
    updated_at: "2024-03-10T10:00:00Z"
  },
  {
    id: 4,
    user_id: 104,
    business_name: "Τυροκομείο Μετσόβου",
    slug: "tyrokomeiometsovou",
    bio: "Παραδοσιακό τυροκομείο στο Μέτσοβο με εξειδίκευση στην παραγωγή φέτας και κασερίου από γάλα τοπικών κοπαδιών. Ακολουθούμε παραδοσιακές συνταγές αιώνων.",
    location: "Μέτσοβο, Ιωάννινα",
    profile_image: "https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=400&h=400&fit=crop",
    cover_image: "https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=800&h=400&fit=crop",
    specialties: ["Φέτα", "Κασέρι", "Παραδοσιακά Τυριά", "Γάλα Κατσίκας"],
    contact_email: "orders@tyrokomeiometsovou.gr",
    contact_phone: "+30 26560 41234",
    website: "https://tyrokomeiometsovou.gr",
    social_media: {
      facebook: "tyrokomeiometsovou"
    },
    verification_status: "verified",
    created_at: "2023-04-05T10:00:00Z",
    updated_at: "2024-04-05T10:00:00Z"
  },
  {
    id: 5,
    user_id: 105,
    business_name: "Οπωρώνες Πηλίου",
    slug: "oporonespiliou",
    bio: "Οικογενειακή επιχείρηση καλλιέργειας μήλων στο Πήλιο. Παράγουμε βιολογικά μήλα υψηλής ποιότητας και παραδοσιακά προϊόντα όπως μαρμελάδες και αποξηραμένα φρούτα.",
    location: "Πήλιο, Μαγνησία",
    profile_image: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400&h=400&fit=crop",
    cover_image: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=800&h=400&fit=crop",
    specialties: ["Μήλα", "Βιολογικά Φρούτα", "Μαρμελάδες", "Αποξηραμένα Φρούτα"],
    contact_email: "info@oporonespiliou.gr",
    contact_phone: "+30 24280 31234",
    social_media: {
      instagram: "pilion_apples",
      facebook: "oporonespiliou"
    },
    verification_status: "pending",
    created_at: "2023-05-12T10:00:00Z",
    updated_at: "2024-05-12T10:00:00Z"
  }
];

export { mockProducers as mockData };
