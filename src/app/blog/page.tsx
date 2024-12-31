import Link from 'next/link';
import Navigation from '@/components/Navigation';
import { Metadata } from 'next';
import Script from 'next/script';

export const metadata: Metadata = {
  title: 'AI Privacy & Security Blog | AI Anonymizer',
  description: 'Expert insights on AI privacy, security, and anonymity. Learn how to protect your data and maintain privacy while using AI language models.',
  keywords: [
    'AI privacy blog',
    'AI security articles',
    'AI anonymity guides',
    'AI data protection',
    'secure AI usage',
    'private AI interactions',
    'AI privacy tips',
    'AI security best practices'
  ],
  openGraph: {
    title: 'AI Privacy & Security Blog | AI Anonymizer',
    description: 'Expert insights on AI privacy, security, and anonymity. Learn how to protect your data and maintain privacy while using AI language models.',
    type: 'website',
  },
};

interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  readTime: string;
}

const blogPosts: BlogPost[] = [
  {
    slug: 'protecting-your-privacy-in-the-age-of-ai',
    title: 'Protecting Your Privacy in the Age of AI',
    excerpt: 'Learn essential strategies for maintaining privacy and security in your AI interactions. Discover how to protect your sensitive data while leveraging AI technology.',
    date: '2024-12-30',
    readTime: '10 min read'
  },
  {
    slug: 'why-anonymous-ai-queries-matter',
    title: 'Why Anonymous AI Queries Matter',
    excerpt: 'Understand the importance of anonymous AI queries in protecting your intellectual property and maintaining competitive advantage in the AI-driven world.',
    date: '2024-12-29',
    readTime: '10 min read'
  },
  {
    slug: 'data-privacy-best-practices',
    title: 'Data Privacy Best Practices for AI Users',
    excerpt: 'Comprehensive guide to implementing robust data privacy practices when using AI. Learn how to secure your AI interactions and protect sensitive information.',
    date: '2024-12-28',
    readTime: '10 min read'
  }
];

export default function BlogPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: 'AI Anonymizer Blog',
    description: 'Expert insights on AI privacy, security, and anonymity',
    url: 'https://aianonymizer.com/blog',
    publisher: {
      '@type': 'Organization',
      name: 'AI Anonymizer',
      url: 'https://aianonymizer.com'
    },
    blogPost: blogPosts.map(post => ({
      '@type': 'BlogPosting',
      headline: post.title,
      description: post.excerpt,
      datePublished: post.date,
      url: `https://aianonymizer.com/blog/${post.slug}`,
      author: {
        '@type': 'Organization',
        name: 'AI Anonymizer Team'
      }
    }))
  };

  return (
    <>
      <Script id="blog-schema" type="application/ld+json">
        {JSON.stringify(jsonLd)}
      </Script>
      <Navigation />
      <main className="pt-24">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <h1 className="text-4xl font-bold mb-8">AI Privacy & Security Insights</h1>
          <div className="space-y-8">
            {blogPosts.map((post) => (
              <article key={post.slug} className="border-b border-gray-200 pb-8">
                <Link href={`/blog/${post.slug}`} className="block group">
                  <h2 className="text-2xl font-semibold mb-2 group-hover:text-blue-600">
                    {post.title}
                  </h2>
                  <div className="flex items-center text-gray-600 text-sm mb-3">
                    <time>{post.date}</time>
                    <span className="mx-2">•</span>
                    <span>{post.readTime}</span>
                  </div>
                  <p className="text-gray-600">
                    {post.excerpt}
                  </p>
                  <span className="inline-block mt-4 text-blue-600 font-medium group-hover:text-blue-800">
                    Read more →
                  </span>
                </Link>
              </article>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
