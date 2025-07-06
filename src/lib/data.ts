import {
  Globe,
  MessageCircle,
  BookOpen,
  Sparkles,
  Star,
  Users,
  Trophy,
  Zap,
  Brain,
  CheckCircle,
  Twitter,
  Github,
  Linkedin,
} from 'lucide-react'

// Hero Section Data
export const heroStats = [
  { number: '15+', text: 'Languages', icon: Globe },
  { number: '50K+', text: 'Users', icon: Users },
  { number: '98%', text: 'Accuracy', icon: Trophy },
]

export const heroFeatures = [
  { icon: MessageCircle, text: 'Natural Conversation', color: 'bg-blue-500' },
  { icon: BookOpen, text: 'Smart Learning', color: 'bg-purple-500' },
  { icon: Sparkles, text: 'AI-Powered', color: 'bg-orange-500' },
]

export const trustBrands = ['Harvard', 'MIT', 'Stanford', 'Cambridge', 'Oxford']

// Testimonials Data
export const testimonials = [
  {
    name: 'Ayu S.',
    avatar: 'https://randomuser.me/api/portraits/women/65.jpg',
    quote:
      'AskVerba helped me ace my TOEFL! The explanations are super clear and the translations feel natural.',
  },
  {
    name: 'Michael T.',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    quote:
      'I love how easy it is to use. The AI gives me context and learning tips, not just a translation.',
  },
  {
    name: 'Siti R.',
    avatar: 'https://randomuser.me/api/portraits/women/43.jpg',
    quote:
      "The best language tool I've tried. I can practice pronunciation and learn new phrases every day!",
  },
]

// Footer Data
export const footerLinks = [
  { label: 'Home', href: '/' },
  { label: 'Translate', href: '/translate' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
]

// Animation Variants
export const fadeInUpVariants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { staggerChildren: 0.12 } },
}

export const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
}

export const staggerItemVariants = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0 },
}
