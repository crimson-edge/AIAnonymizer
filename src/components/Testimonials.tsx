'use client';

import Image from 'next/image';

const testimonials = [
  {
    content: "AI Anonymizer has transformed how I interact with AI. As a business consultant, I need to maintain client confidentiality while leveraging AI tools. This service gives me complete peace of mind.",
    author: "Sarah Chen",
    title: "Business Strategy Consultant",
    image: "https://i.pravatar.cc/150?img=1"
  },
  {
    content: "Privacy concerns were holding me back from fully utilizing AI in my research. AI Anonymizer solved this completely. Now I can focus on my work without worrying about data security.",
    author: "Dr. Michael Rodriguez",
    title: "Research Scientist",
    image: "https://i.pravatar.cc/150?img=3"
  },
  {
    content: "As a privacy advocate, I was skeptical of AI tools. AI Anonymizer's zero-logs policy and robust security measures have won me over. It's the gold standard for private AI interactions.",
    author: "Emma Thompson",
    title: "Cybersecurity Specialist",
    image: "https://i.pravatar.cc/150?img=5"
  }
];

export default function Testimonials() {
  return (
    <section className="bg-gray-50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-center mb-12">What Our Users Say</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 relative rounded-full overflow-hidden mr-4">
                  <Image
                    src={testimonial.image}
                    alt={testimonial.author}
                    width={48}
                    height={48}
                    className="object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-semibold">{testimonial.author}</h3>
                  <p className="text-gray-600 text-sm">{testimonial.title}</p>
                </div>
              </div>
              <p className="text-gray-700">{testimonial.content}</p>
              <div className="mt-4 flex text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="h-5 w-5 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
