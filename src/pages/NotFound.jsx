import { Link } from 'react-router-dom'
import { Home, ArrowLeft, Stethoscope } from 'lucide-react'
import Button from '../components/ui/Button'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center px-4">
      <div className="text-center max-w-md animate-slide-up">
        <div className="w-20 h-20 rounded-3xl bg-primary-600 flex items-center justify-center mx-auto mb-8 shadow-glow">
          <Stethoscope className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-8xl font-bold text-gradient mb-4">404</h1>
        <h2 className="text-2xl font-bold text-text-primary mb-3">Page Not Found</h2>
        <p className="text-text-muted mb-8 leading-relaxed">
          The page you're looking for doesn't exist or has been moved. Let's get you back on track.
        </p>
        <div className="flex gap-3 justify-center">
          <button onClick={() => window.history.back()}>
            <Button variant="secondary" icon={ArrowLeft}>Go Back</Button>
          </button>
          <Link to="/">
            <Button icon={Home}>Go Home</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
