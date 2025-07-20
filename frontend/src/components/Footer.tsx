import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-2xl font-bold text-green-400 mb-4">Dixis</h3>
            <p className="text-gray-300 mb-4">
              Συνδέουμε τους Έλληνες παραγωγούς με τους καταναλωτές, 
              προσφέροντας αυθεντικά προϊόντα υψηλής ποιότητας 
              απευθείας από την πηγή.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-green-400 transition-colors">
                📘 Facebook
              </a>
              <a href="#" className="text-gray-400 hover:text-green-400 transition-colors">
                📷 Instagram
              </a>
              <a href="#" className="text-gray-400 hover:text-green-400 transition-colors">
                🐦 Twitter
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Γρήγοροι Σύνδεσμοι</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/products" className="text-gray-300 hover:text-green-400 transition-colors">
                  Προϊόντα
                </Link>
              </li>
              <li>
                <Link href="/producers" className="text-gray-300 hover:text-green-400 transition-colors">
                  Παραγωγοί
                </Link>
              </li>
              <li>
                <Link href="/categories" className="text-gray-300 hover:text-green-400 transition-colors">
                  Κατηγορίες
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-300 hover:text-green-400 transition-colors">
                  Σχετικά με εμάς
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Υποστήριξη</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/contact" className="text-gray-300 hover:text-green-400 transition-colors">
                  Επικοινωνία
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-gray-300 hover:text-green-400 transition-colors">
                  Συχνές Ερωτήσεις
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="text-gray-300 hover:text-green-400 transition-colors">
                  Αποστολές
                </Link>
              </li>
              <li>
                <Link href="/returns" className="text-gray-300 hover:text-green-400 transition-colors">
                  Επιστροφές
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 text-center">
          <p className="text-gray-400">
            © 2024 Dixis. Όλα τα δικαιώματα διατηρούνται.
          </p>
        </div>
      </div>
    </footer>
  );
}