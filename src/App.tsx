import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from '@/components/Layout'
import Home from '@/pages/Home'
import Product from '@/pages/Product'
import Booking from '@/pages/Booking'
import Prepare from '@/pages/Prepare'
import Tracking from '@/pages/Tracking'
import Archive from '@/pages/Archive'

export default function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/product/:id" element={<Product />} />
          <Route path="/booking/:id" element={<Booking />} />
          <Route path="/prepare/:id" element={<Prepare />} />
          <Route path="/tracking/:id" element={<Tracking />} />
          <Route path="/archive/:id" element={<Archive />} />
        </Routes>
      </Layout>
    </Router>
  )
}
