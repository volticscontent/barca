import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="w-full bg-white border-t border-gray-100">
      <div className="w-full"> 
        <Image 
          src="/images/footer/footer.png" 
          alt="Piska Footer" 
          width={1920} 
          height={800} 
          className="w-full h-auto object-cover"
          priority
        /> 
      </div> 
    </footer>
  );
}
