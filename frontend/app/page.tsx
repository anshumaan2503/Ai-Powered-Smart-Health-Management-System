import { LandingPage } from '@/components/landing/landing-page'
import { Preloader } from '@/components/landing/Preloader'
import { LazyMotion, domAnimation } from 'framer-motion'

export default function HomePage() {
  return (
    <LazyMotion features={domAnimation}>
      <Preloader />
      <LandingPage />
    </LazyMotion>
  )
}