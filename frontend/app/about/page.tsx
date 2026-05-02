import { FiBook, FiUsers, FiAward, FiHeart } from 'react-icons/fi';

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-blue-900 text-white py-16">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-4xl font-bold mb-4">About Our School</h1>
          <p className="text-xl">Shaping futures in Zomba, Malawi since 2010</p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h2 className="text-2xl font-bold mb-4 text-blue-900">Our Mission</h2>
              <p className="text-gray-700 leading-relaxed">
                To provide quality secondary education that empowers students with knowledge,
                skills, and moral values necessary for personal development and meaningful
                contribution to national development in Malawi and beyond.
              </p>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-4 text-blue-900">Our Vision</h2>
              <p className="text-gray-700 leading-relaxed">
                To be the leading secondary school in Malawi, producing well-rounded
                individuals who excel academically, socially, and morally.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">Our Values</h2>
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <FiBook className="mx-auto text-blue-600 mb-4" size={48} />
              <h3 className="text-xl font-semibold mb-2">Excellence</h3>
              <p className="text-gray-600">Striving for the highest standards in academics</p>
            </div>
            <div className="text-center">
              <FiUsers className="mx-auto text-blue-600 mb-4" size={48} />
              <h3 className="text-xl font-semibold mb-2">Integrity</h3>
              <p className="text-gray-600">Building character and moral values</p>
            </div>
            <div className="text-center">
              <FiAward className="mx-auto text-blue-600 mb-4" size={48} />
              <h3 className="text-xl font-semibold mb-2">Discipline</h3>
              <p className="text-gray-600">Fostering self-control and responsibility</p>
            </div>
            <div className="text-center">
              <FiHeart className="mx-auto text-blue-600 mb-4" size={48} />
              <h3 className="text-xl font-semibold mb-2">Compassion</h3>
              <p className="text-gray-600">Caring for others and community service</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
