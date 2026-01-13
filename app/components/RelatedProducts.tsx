import Image from 'next/image';
import { YOU_MAY_ALSO_LIKE } from '@/app/data/products';

export default function RelatedProducts() {
  return (
    <div className="pt-8">
      <h2 className="text-xl font-bold text-[#1b1b1b] mb-6 px-4 lg:px-0">You May Also Like</h2>
      
      {/* Mobile Carousel / Desktop Grid */}
      <div className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-4 px-4 lg:mx-0 lg:grid lg:grid-cols-5 lg:gap-6 lg:pb-0 lg:overflow-visible scrollbar-hide">
        {YOU_MAY_ALSO_LIKE.map((product) => (
          <div key={product.id} className="snap-center shrink-0 w-[45vw] lg:w-auto group cursor-pointer">
            <div className="relative aspect-[4/5] mb-3 bg-gray-100 rounded-sm overflow-hidden">
              <Image
                src={product.image}
                alt={product.name}
                fill
                className="object-cover object-center group-hover:scale-105 transition-transform duration-300"
                sizes="(max-width: 768px) 50vw, 25vw"
              />
            </div>
            <p className="text-sm font-bold text-[#1b1b1b] mb-1">{product.price}</p>
            <h3 className="text-xs text-gray-700 leading-relaxed group-hover:text-primary transition-colors line-clamp-2">
              {product.name}
            </h3>
          </div>
        ))}
      </div>
    </div>
  );
}
