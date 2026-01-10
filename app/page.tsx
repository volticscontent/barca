import Image from "next/image";
import Header from './components/Header';
import Footer from './components/Footer';
import ProductGallery from './components/ProductGallery';
import ProductInfo from './components/ProductInfo';
import RelatedProducts from './components/RelatedProducts';
import TrackViewContent from "./components/TrackViewContent";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <TrackViewContent
        contentName="PSG Nike Dri-FIT ADV Home Match Shirt 2025-26"
        contentIds={["202333090"]}
        contentType="product"
        value={149.99}
        currency="EUR"
      />
      <Header />
      
      <main className="flex-grow pt-4 pb-12 lg:pt-8">
        <div className="max-w-[1400px] mx-auto sm:px-6 lg:px-8">
          
          {/* Breadcrumbs */}
          <nav className="flex text-xs px-4 text-gray-500 mb-4 overflow-x-auto whitespace-nowrap scrollbar-hide">
            <span className="hover:text-[#1b1b1b] cursor-pointer transition-colors">Paris Saint-Germain</span>
            <span className="mx-1">/</span>
            <span className="text-[#1b1b1b] cursor-pointer">Maillots Paris Saint-Germain</span>
          </nav>

          {/* Header Info */}
      <div className="mb-6 p-4">
        <h1 className="text-2xl lg:text-3xl font-bold text-[#1b1b1b] mb-1 leading-tight tracking-tight">
          Maillot Domicile Match PSG Nike Dri-FIT ADV 2025-26
        </h1>
        
        <div className="flex items-center gap-1 mb-4">
          <span className="text-xs text-gray-900">par</span>
          <div className="relative w-8 h-4">
             {/* Nike Logo */}
             <Image src="/images/contentProduct/nike.png" alt="Nike" fill className="object-contain object-left" />
          </div>
        </div>

        <p className="text-base text-[#1b1b1b] font-bold">
          Prix : <span className="font-bold">€149.99</span>
        </p>
      </div>

          <div className="lg:grid lg:grid-cols-12 lg:gap-16 mx-2">
            {/* Left Column: Gallery (7 cols) */}
            <div className="lg:col-span-7 mb-10 lg:mb-0">
              <ProductGallery />
            </div>

            {/* Right Column: Info (5 cols) */}
            <div className="lg:col-span-5">
              <div className="lg:sticky lg:top-24">
                <ProductInfo />
              </div>
            </div>
          </div>

          <RelatedProducts />
        </div>
      </main>

      <Footer />
    </div>
  );
}
