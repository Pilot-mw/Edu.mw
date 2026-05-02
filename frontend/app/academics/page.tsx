export default function AcademicsPage() {
  const subjects = [
    { name: 'Mathematics', code: 'MATH', description: 'Core mathematics covering algebra, geometry, trigonometry, and calculus.' },
    { name: 'English', code: 'ENG', description: 'Developing communication skills in reading, writing, and literature.' },
    { name: 'Chichewa', code: 'CHI', description: 'Malawi national language studies including literature and composition.' },
    { name: 'Biology', code: 'BIO', description: 'Study of living organisms, ecology, genetics, and human biology.' },
    { name: 'Physical Science', code: 'PHY', description: 'Physics and Chemistry fundamentals for scientific understanding.' },
    { name: 'Agriculture', code: 'AGR', description: 'Practical and theoretical agricultural studies for Malawi context.' },
    { name: 'Social Studies', code: 'SOC', description: 'History, geography, and civics of Malawi and the world.' },
    { name: 'Computer Studies', code: 'COM', description: 'Introduction to computing, programming, and IT skills.' },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-blue-900 text-white py-16">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-4xl font-bold mb-4">Academics</h1>
          <p className="text-xl">Malawi Secondary School Curriculum</p>
        </div>
      </section>

      {/* Curriculum Info */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">Our Curriculum</h2>
          <p className="text-lg text-gray-700 text-center max-w-3xl mx-auto mb-12">
            We follow the Malawi Institute of Education (MIE) curriculum for secondary schools.
            Our students are prepared for the Malawi School Certificate of Education (MSCE) examinations.
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {subjects.map((subject) => (
              <div key={subject.code} className="bg-gray-50 p-6 rounded-lg shadow">
                <h3 className="text-xl font-semibold mb-2 text-blue-900">{subject.name}</h3>
                <p className="text-sm text-gray-600 mb-2">Code: {subject.code}</p>
                <p className="text-gray-700">{subject.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Class Structure */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">Class Structure</h2>
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full">
                <thead className="bg-blue-900 text-white">
                  <tr>
                    <th className="px-6 py-3 text-left">Form</th>
                    <th className="px-6 py-3 text-left">Streams</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr>
                    <td className="px-6 py-4">Form 1</td>
                    <td className="px-6 py-4">Stream A, Stream B</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4">Form 2</td>
                    <td className="px-6 py-4">Stream A, Stream B</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4">Form 3</td>
                    <td className="px-6 py-4">Stream A, Stream B</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4">Form 4</td>
                    <td className="px-6 py-4">Stream A, Stream B</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
