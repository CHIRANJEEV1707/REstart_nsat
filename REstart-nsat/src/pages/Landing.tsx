import { Link } from 'react-router-dom'
import { BookOpen, Trophy, Clock, Target } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <BookOpen className="h-8 w-8 text-primary-600" />
              <span className="ml-2 text-2xl font-bold text-gray-900">REstart NSAT</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/bundles" className="text-gray-700 hover:text-primary-600">
                Bundles
              </Link>
              <Link to="/login" className="text-gray-700 hover:text-primary-600">
                Login
              </Link>
              <Link to="/register" className="btn-primary">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-5xl font-extrabold text-gray-900 sm:text-6xl md:text-7xl">
            Ace Your Exams with
            <span className="text-primary-600"> Confidence</span>
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-xl text-gray-600">
            Comprehensive exam preparation bundles with study materials, mock tests,
            and detailed analytics to track your progress.
          </p>
          <div className="mt-10 flex justify-center gap-4">
            <Link to="/register" className="btn-primary text-lg px-8 py-3">
              Start Learning
            </Link>
            <Link to="/bundles" className="btn-secondary text-lg px-8 py-3">
              Browse Bundles
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
          Why Choose REstart NSAT?
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <FeatureCard
            icon={<BookOpen className="h-8 w-8 text-primary-600" />}
            title="Quality Content"
            description="Access comprehensive study materials curated by experts"
          />
          <FeatureCard
            icon={<Trophy className="h-8 w-8 text-primary-600" />}
            title="Mock Tests"
            description="Practice with unlimited mock tests and instant results"
          />
          <FeatureCard
            icon={<Clock className="h-8 w-8 text-primary-600" />}
            title="Track Progress"
            description="Monitor your performance with detailed analytics"
          />
          <FeatureCard
            icon={<Target className="h-8 w-8 text-primary-600" />}
            title="Flexible Learning"
            description="Learn at your own pace with lifetime access"
          />
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-primary-600 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Start Your Journey?
          </h2>
          <p className="text-xl text-primary-100 mb-8">
            Join thousands of students preparing for their dream exams
          </p>
          <Link to="/register" className="bg-white text-primary-600 hover:bg-gray-100 font-bold py-3 px-8 rounded-lg transition-colors duration-200">
            Create Free Account
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p>&copy; 2026 REstart NSAT. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="card text-center">
      <div className="flex justify-center mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  )
}
