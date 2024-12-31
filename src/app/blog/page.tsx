import Link from 'next/link';

const blogPosts = [
  {
    slug: 'protecting-your-privacy-in-the-age-of-ai',
    title: 'Protecting Your Privacy in the Age of AI',
    excerpt: 'As AI becomes more integrated into our daily lives, protecting our privacy becomes increasingly crucial. Learn how to maintain your anonymity while leveraging AI tools.',
    date: '2024-12-30',
    readTime: '5 min read'
  },
  {
    slug: 'why-anonymous-ai-queries-matter',
    title: 'Why Anonymous AI Queries Matter',
    excerpt: 'Your AI queries can reveal more about you than you think. Discover why keeping your AI interactions private is essential for personal and professional security.',
    date: '2024-12-29',
    readTime: '4 min read'
  },
  {
    slug: 'data-privacy-best-practices',
    title: 'Data Privacy Best Practices for AI Users',
    excerpt: 'A comprehensive guide to protecting your data while using AI services. Learn the essential practices for maintaining your privacy in the digital age.',
    date: '2024-12-28',
    readTime: '6 min read'
  }
];

export default function BlogPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold mb-8">Blog</h1>
      <div className="grid gap-8">
        {blogPosts.map((post) => (
          <article key={post.slug} className="bg-white rounded-lg shadow-md p-6">
            <Link href={`/blog/${post.slug}`}>
              <h2 className="text-2xl font-semibold mb-2 hover:text-blue-600">{post.title}</h2>
            </Link>
            <div className="text-gray-600 text-sm mb-4">
              <span>{post.date}</span> • <span>{post.readTime}</span>
            </div>
            <p className="text-gray-700">{post.excerpt}</p>
            <Link href={`/blog/${post.slug}`} className="text-blue-600 hover:text-blue-800 mt-4 inline-block">
              Read more →
            </Link>
          </article>
        ))}
      </div>
    </div>
  );
}
