import Header from './components/Header';
import Hero from './components/Hero';
import About from './components/About';
import News from './components/News';
import Footer from './components/Footer';

export default function App() {
  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 selection:bg-blue-100 selection:text-blue-900">
      <Header />
      <main>
        <Hero />
        <About />
        <News />
      </main>
      <Footer />
    </div>
  );
}
