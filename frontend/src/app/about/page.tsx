export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-black mb-4">Σχετικά με το Dixis</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Συνδέουμε τους Έλληνες παραγωγούς με τους καταναλωτές, 
            προσφέροντας αυθεντικά προϊόντα με διαφάνεια και ποιότητα.
          </p>
        </div>

        {/* Mission */}
        <section className="mb-16">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-black mb-6 text-center">Η Αποστολή μας</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-3">Για τους Παραγωγούς</h3>
                <p className="text-gray-600">
                  Παρέχουμε μια σύγχρονη πλατφόρμα που επιτρέπει στους παραγωγούς 
                  να προβάλλουν τα προϊόντα τους και να φτάσουν απευθείας στους καταναλωτές.
                </p>
              </div>
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-3">Για τους Καταναλωτές</h3>
                <p className="text-gray-600">
                  Προσφέρουμε πρόσβαση σε αυθεντικά ελληνικά προϊόντα με πλήρη διαφάνεια 
                  για την προέλευση και τη διαδικασία παραγωγής.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="mb-16">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-black mb-6 text-center">Οι Αξίες μας</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <span className="text-green-600 text-2xl">🌱</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Αυθεντικότητα</h3>
                <p className="text-gray-600 text-sm">
                  Όλα τα προϊόντα προέρχονται από επαληθευμένους Έλληνες παραγωγούς
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <span className="text-green-600 text-2xl">🤝</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Διαφάνεια</h3>
                <p className="text-gray-600 text-sm">
                  Πλήρης πληροφόρηση για την προέλευση και τη διαδικασία παραγωγής
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <span className="text-green-600 text-2xl">⚡</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Ποιότητα</h3>
                <p className="text-gray-600 text-sm">
                  Υψηλά πρότυπα ποιότητας και φρεσκάδας σε όλα τα προϊόντα
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Contact CTA */}
        <section className="text-center">
          <div className="bg-gray-50 py-12 px-6 rounded-lg">
            <h2 className="text-2xl font-bold text-black mb-4">Θέλετε να μάθετε περισσότερα;</h2>
            <p className="text-gray-600 mb-6">
              Επικοινωνήστε μαζί μας για οποιαδήποτε ερώτηση ή πρόταση συνεργασίας.
            </p>
            <a 
              href="/contact"
              className="inline-flex items-center justify-center bg-black hover:bg-gray-800 text-white px-8 py-4 rounded-lg font-medium transition-colors"
            >
              Επικοινωνία
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}
