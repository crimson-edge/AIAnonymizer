import { notFound } from 'next/navigation';

const blogPosts = {
  'protecting-your-privacy-in-the-age-of-ai': {
    title: 'Protecting Your Privacy in the Age of AI',
    date: '2024-12-30',
    content: [
      {
        type: 'paragraph',
        text: "In today's digital landscape, artificial intelligence has become an integral part of our daily lives. From virtual assistants to language models, we're constantly interacting with AI systems. However, these interactions can leave behind digital footprints that may compromise our privacy."
      },
      {
        type: 'heading',
        text: 'Why Privacy Matters'
      },
      {
        type: 'paragraph',
        text: 'Every query you make to an AI system can reveal personal information, professional interests, and even sensitive data about your business or personal life. This information, when collected and analyzed, can create detailed profiles of users, their interests, and behaviors.'
      },
      {
        type: 'heading',
        text: 'The Risks of Unprotected AI Interactions'
      },
      {
        type: 'list',
        items: [
          'Personal data exposure',
          'Professional information leaks',
          'Behavioral profiling',
          'Targeted advertising',
          'Data aggregation'
        ]
      },
      {
        type: 'heading',
        text: 'How to Protect Yourself'
      },
      {
        type: 'list',
        items: [
          'Use privacy-focused AI services',
          'Implement strong encryption',
          'Regular security audits',
          'Anonymous browsing',
          'Data minimization'
        ]
      },
      {
        type: 'paragraph',
        text: 'AI Anonymizer provides a secure layer between you and AI services, ensuring your queries remain private and your data protected.'
      }
    ]
  },
  'why-anonymous-ai-queries-matter': {
    title: 'Why Anonymous AI Queries Matter',
    date: '2024-12-29',
    content: [
      {
        type: 'paragraph',
        text: 'The queries we make to AI systems can reveal surprising amounts of information about us. From business strategies to personal concerns, each interaction with AI creates a digital trail that could be used to profile users.'
      },
      {
        type: 'heading',
        text: 'The Hidden Cost of AI Queries'
      },
      {
        type: 'paragraph',
        text: 'When you interact with AI systems, you\'re not just sharing the immediate question or prompt - you\'re potentially revealing:'
      },
      {
        type: 'list',
        items: [
          'Business strategies',
          'Research directions',
          'Personal interests',
          'Professional expertise',
          'Intellectual property'
        ]
      },
      {
        type: 'heading',
        text: 'Real-World Implications'
      },
      {
        type: 'paragraph',
        text: 'Consider a business professional using AI for market research. Without proper anonymization, competitors could potentially:'
      },
      {
        type: 'list',
        items: [
          'Track research patterns',
          'Identify business strategies',
          'Monitor product development',
          'Analyze competitive moves'
        ]
      },
      {
        type: 'heading',
        text: 'The Solution'
      },
      {
        type: 'paragraph',
        text: 'Anonymous AI queries ensure that your intellectual property and strategic thinking remain protected while still leveraging the power of AI technology.'
      }
    ]
  },
  'data-privacy-best-practices': {
    title: 'Data Privacy Best Practices for AI Users',
    date: '2024-12-28',
    content: [
      {
        type: 'paragraph',
        text: 'As AI becomes more sophisticated, protecting your data privacy becomes increasingly important. Here are essential practices for maintaining your privacy while using AI services.'
      },
      {
        type: 'heading',
        text: 'Essential Privacy Practices'
      },
      {
        type: 'heading',
        text: '1. Use Secure Connections'
      },
      {
        type: 'list',
        items: [
          'Always use encrypted connections',
          'Verify security certificates',
          'Use VPN services when necessary'
        ]
      },
      {
        type: 'heading',
        text: '2. Data Minimization'
      },
      {
        type: 'list',
        items: [
          'Share only necessary information',
          'Regularly audit shared data',
          'Remove unnecessary historical data'
        ]
      },
      {
        type: 'heading',
        text: '3. Access Control'
      },
      {
        type: 'list',
        items: [
          'Implement strong authentication',
          'Use role-based access',
          'Regular security reviews'
        ]
      },
      {
        type: 'heading',
        text: 'Implementation Guide'
      },
      {
        type: 'list',
        items: [
          'Start with a privacy assessment',
          'Implement security measures',
          'Regular monitoring and updates',
          'Employee training and awareness'
        ]
      },
      {
        type: 'paragraph',
        text: 'Remember: Privacy is not just about protection - it\'s about maintaining control over your digital footprint.'
      }
    ]
  }
};

export default function BlogPost({ params }: { params: { slug: string } }) {
  const post = blogPosts[params.slug as keyof typeof blogPosts];

  if (!post) {
    notFound();
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <article className="prose lg:prose-xl">
        <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
        <div className="text-gray-600 mb-8">{post.date}</div>
        <div className="space-y-6">
          {post.content.map((block, index) => {
            if (block.type === 'paragraph') {
              return <p key={index} className="text-gray-700">{block.text}</p>;
            }
            if (block.type === 'heading') {
              return <h2 key={index} className="text-2xl font-bold mt-8 mb-4">{block.text}</h2>;
            }
            if (block.type === 'list') {
              return (
                <ul key={index} className="list-disc pl-6 space-y-2">
                  {block.items.map((item, itemIndex) => (
                    <li key={itemIndex} className="text-gray-700">{item}</li>
                  ))}
                </ul>
              );
            }
            return null;
          })}
        </div>
      </article>
    </div>
  );
}
