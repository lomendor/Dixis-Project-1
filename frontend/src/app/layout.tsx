import type { Metadata } from "next";
import "./globals.css";
import ClientLayout from '@/components/layout/ClientLayout';
import Providers from '@/providers/Providers';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  title: "Dixis Fresh - Φρέσκα Ελληνικά Προϊόντα",
  description: "Ανακαλύψτε αυθεντικά ελληνικά προϊόντα απευθείας από τους παραγωγούς. Φρέσκα λαχανικά, φρούτα, ελαιόλαδο, μέλι και πολλά άλλα με παράδοση σε 24 ώρες.",
  keywords: "ελληνικά προϊόντα, φρέσκα λαχανικά, ελαιόλαδο, μέλι, παραγωγοί, τοπικά προϊόντα, βιολογικά",
  openGraph: {
    title: "Dixis Fresh - Φρέσκα Ελληνικά Προϊόντα",
    description: "Φρέσκα ελληνικά προϊόντα απευθείας από τους παραγωγούς",
    type: "website",
    locale: "el_GR",
    images: ["/images/dixis-logo-with-text.png"]
  },
  twitter: {
    card: "summary_large_image",
    title: "Dixis Fresh - Φρέσκα Ελληνικά Προϊόντα",
    description: "Φρέσκα ελληνικά προϊόντα απευθείας από τους παραγωγούς"
  },
  icons: {
    icon: "/images/dixis-logo-icon.png",
    apple: "/images/dixis-logo-icon.png"
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="el">
      <body className="min-h-screen bg-white">
        <Providers>
          <ClientLayout>
            {children}
          </ClientLayout>
        </Providers>
      </body>
    </html>
  );
}