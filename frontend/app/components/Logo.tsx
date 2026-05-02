import Link from 'next/link';
import Image from 'next/image';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export default function Logo({ size = 'md', showText = true }: LogoProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  };

  const textSizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
  };

  const imageSizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
  };

  return (
    <Link href="/" className="flex items-center space-x-2">
      <div className={`${sizeClasses[size]} rounded-lg flex items-center justify-center overflow-hidden`}>
        <Image
          src="/logo.jpg"
          alt="High Profile School Logo"
          width={56}
          height={56}
          className={`${imageSizeClasses[size]} object-contain`}
        />
      </div>
      {showText && (
        <span className={`font-bold text-blue-900 ${textSizeClasses[size]}`}>
          High Profile School
        </span>
      )}
    </Link>
  );
}
