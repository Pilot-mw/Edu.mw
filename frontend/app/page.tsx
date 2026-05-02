import Link from 'next/link';
import Image from 'next/image';
import { FiBook, FiUsers, FiAward, FiMapPin } from 'react-icons/fi';

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-900 to-blue-700 text-white py-20">
        <Image
          src="/images/pupils.jpg"
          alt=""
          fill
          className="object-cover opacity-15"
          priority
        />
        <div className="container mx-auto px-6 text-center relative z-10">
          <h1 className="text-5xl font-bold mb-4">High Profile Private Secondary School</h1>
          <p className="text-xl mb-8">Excellence in Education - Zomba, Malawi</p>
          <p className="text-lg mb-8 max-w-2xl mx-auto">
            Nurturing minds, building character, and preparing students for a bright future
            through quality education following the Malawi National Curriculum.
          </p>
          <div className="space-x-4">
            <Link
              href="/admissions"
              className="bg-white text-blue-900 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50"
            >
              Apply Now
            </Link>
            <Link
              href="/about"
              className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-900"
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">Our Mission</h2>
          <div className="max-w-3xl mx-auto text-center text-gray-700 text-lg">
            <p>
              To provide quality secondary education that empowers students with knowledge,
              skills, and values necessary for personal development and contribution to
              national development in Malawi and beyond.
            </p>
          </div>
        </div>
      </section>

      {/* Highlights */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose High Profile?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow text-center">
              <FiBook className="mx-auto text-blue-600 mb-4" size={48} />
              <h3 className="text-xl font-semibold mb-2">Malawi Curriculum</h3>
              <p className="text-gray-600">
                Following the national curriculum with subjects like Mathematics, English,
                Chichewa, and Sciences.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow text-center">
              <FiUsers className="mx-auto text-blue-600 mb-4" size={48} />
              <h3 className="text-xl font-semibold mb-2">Qualified Teachers</h3>
              <p className="text-gray-600">
                Our teachers are well-trained and dedicated to nurturing every student's potential.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow text-center">
              <FiAward className="mx-auto text-blue-600 mb-4" size={48} />
              <h3 className="text-xl font-semibold mb-2">Excellent Results</h3>
              <p className="text-gray-600">
                Consistently producing top performers in MSCE examinations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Location */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-center mb-8">
            <FiMapPin className="text-blue-600 mr-2" size={24} />
            <h2 className="text-3xl font-bold">Our Location</h2>
          </div>
          <div className="max-w-2xl mx-auto text-center text-gray-700">
            <p className="text-lg mb-4">Located in the heart of Zomba, Malawi</p>
            <p>We are easily accessible from all parts of Zomba and surrounding areas.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-blue-900 text-white py-8">
        <div className="container mx-auto px-6 text-center">
          <p>&copy; 2026 High Profile Private Secondary School, Zomba, Malawi</p>
          <p className="mt-2">Contact: +265 1 234 567 | Email: info@highprofile.edu.mw</p>
        </div>
      </footer>
    </div>
  );
}
