interface LogoProps {
  size?: number;
  showText?: boolean;
  className?: string;
}

export default function Logo({ size = 20, showText = true, className = '' }: LogoProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <img
        src="/assets/IMG_20260626_220456.png"
        alt="Andio"
        style={{ width: size, height: size }}
        className="rounded-md object-cover"
      />
      {showText && (
        <span className="font-bold tracking-tight">
          <span className="text-white">Andio</span>
        </span>
      )}
    </div>
  );
}
