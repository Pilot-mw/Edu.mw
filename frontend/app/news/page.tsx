'use client';

import { useState, useEffect } from 'react';
import { FiCalendar, FiArrowRight, FiX } from 'react-icons/fi';
import api, { NewsArticle as NewsArticleType } from '@/app/services/api';

export default function NewsPage() {
  const [news, setNews] = useState<NewsArticleType[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedNews, setSelectedNews] = useState<NewsArticleType | null>(null);

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      const response = await api.get<NewsArticleType[]>('/news/news/');
      setNews(response.data);
    } catch (error) {
      console.error('Failed to fetch news:', error);
    } finally {
      setLoading(false);
    }
  };

  const categoryColors: Record<string, string> = {
    general: 'bg-gray-100 text-gray-800',
    admissions: 'bg-green-100 text-green-800',
    academics: 'bg-blue-100 text-blue-800',
    events: 'bg-purple-100 text-purple-800',
    sports: 'bg-orange-100 text-orange-800',
    infrastructure: 'bg-indigo-100 text-indigo-800',
    meetings: 'bg-yellow-100 text-yellow-800',
    other: 'bg-gray-100 text-gray-800',
  };

  return (
    <div className="min-h-screen">
      <section className="bg-blue-900 text-white py-16">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-4xl font-bold mb-4">News & Announcements</h1>
          <p className="text-xl">Stay updated with the latest from High Profile School</p>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-900 border-t-transparent"></div>
              <p className="mt-4 text-gray-600">Loading news...</p>
            </div>
          ) : news.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-xl text-gray-600">No news available at the moment.</p>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto space-y-8">
              {news.map((item) => (
                <div key={item.id} className="bg-gray-50 p-6 rounded-lg shadow">
                  {item.image_url && (
                    <img
                      src={item.image_url}
                      alt={item.title}
                      className="w-full h-48 object-cover rounded-lg mb-4"
                    />
                  )}
                  <div className="flex items-center text-sm text-gray-500 mb-2 flex-wrap gap-2">
                    <span className="flex items-center">
                      <FiCalendar className="mr-1" />
                      {item.published_at
                        ? new Date(item.published_at).toLocaleDateString('en-GB', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          })
                        : new Date(item.created_at).toLocaleDateString('en-GB', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          })}
                    </span>
                    <span className="mx-1">|</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${categoryColors[item.category] || categoryColors.other}`}
                    >
                      {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
                  <p className="text-gray-700 mb-4">{item.summary}</p>
                  <button
                    onClick={() => setSelectedNews(item)}
                    className="text-blue-600 hover:text-blue-800 flex items-center"
                  >
                    Read More <FiArrowRight className="ml-2" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {selectedNews && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
          onClick={() => setSelectedNews(null)}
        >
          <div
            className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold">{selectedNews.title}</h2>
              <button
                onClick={() => setSelectedNews(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FiX size={24} />
              </button>
            </div>
            <div className="p-6">
              {selectedNews.image_url && (
                <img
                  src={selectedNews.image_url}
                  alt={selectedNews.title}
                  className="w-full h-64 object-cover rounded-lg mb-4"
                />
              )}
              <div className="flex items-center text-sm text-gray-500 mb-4 flex-wrap gap-2">
                <span className="flex items-center">
                  <FiCalendar className="mr-1" />
                  {selectedNews.published_at
                    ? new Date(selectedNews.published_at).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })
                    : new Date(selectedNews.created_at).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                </span>
                {selectedNews.author_name && (
                  <>
                    <span className="mx-1">|</span>
                    <span>By {selectedNews.author_name}</span>
                  </>
                )}
                <span className="mx-1">|</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-medium ${categoryColors[selectedNews.category] || categoryColors.other}`}
                >
                  {selectedNews.category.charAt(0).toUpperCase() + selectedNews.category.slice(1)}
                </span>
              </div>
              <div className="text-gray-700 whitespace-pre-line">
                {selectedNews.content}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
