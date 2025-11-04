// NFT Artwork Generator Component - Creates unique monkey NFT art for each license
export const NFTArtwork = ({ 
  gameTitle, 
  licenseId, 
  ownerAddress, 
}: { 
  gameTitle: string; 
  licenseId: string; 
  ownerAddress: string;
}) => {
  // Generate unique attributes based on license ID and owner
  const generateUniqueAttributes = () => {
    const hash = licenseId + ownerAddress + gameTitle;
    let h = 0;
    for (let i = 0; i < hash.length; i++) {
      h = hash.charCodeAt(i) + ((h << 5) - h);
    }
    
    // Generate 3 unique hues for gradient
    const hue1 = Math.abs(h % 360);
    const hue2 = (hue1 + 137) % 360; // Golden angle for pleasing distribution
    const hue3 = (hue1 + 274) % 360;
    
    // Determine pattern based on license ID
    const patternIndex = parseInt(licenseId) % 4;
    const patterns = ['geometric', 'circuits', 'waves', 'dots'];
    
    return {
      colors: {
        primary: `hsl(${hue1}, 80%, 60%)`,
        secondary: `hsl(${hue2}, 80%, 55%)`,
        accent: `hsl(${hue3}, 80%, 65%)`,
      },
      pattern: patterns[patternIndex],
    };
  };

  const attributes = generateUniqueAttributes();

  return (
    <div className="relative w-full h-full overflow-hidden bg-black">
      {/* Animated gradient background */}
      <div 
        className="absolute inset-0"
        style={{
          background: `radial-gradient(circle at 30% 30%, ${attributes.colors.primary}, ${attributes.colors.secondary} 50%, ${attributes.colors.accent})`,
        }}
      />
      
      {/* Pattern overlay */}
      <div className="absolute inset-0 opacity-15">
        {attributes.pattern === 'geometric' && (
          <div style={{
            backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 20px, rgba(0,0,0,0.3) 20px, rgba(0,0,0,0.3) 40px)',
          }} className="w-full h-full" />
        )}
        {attributes.pattern === 'circuits' && (
          <div style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M10 10h30v30h-30z M50 50h30v30h-30z M10 50h30v30h-30z M50 10h30v30h-30z' stroke='black' fill='none' stroke-width='2' opacity='0.3'/%3E%3C/svg%3E")`,
            backgroundSize: '100px 100px',
          }} className="w-full h-full" />
        )}
        {attributes.pattern === 'waves' && (
          <div style={{
            backgroundImage: 'repeating-radial-gradient(circle at 50% 50%, transparent 0, rgba(0,0,0,0.2) 40px, transparent 80px)',
          }} className="w-full h-full" />
        )}
        {attributes.pattern === 'dots' && (
          <div style={{
            backgroundImage: 'radial-gradient(circle, rgba(0,0,0,0.3) 2px, transparent 2px)',
            backgroundSize: '30px 30px',
          }} className="w-full h-full" />
        )}
      </div>

      {/* Monkey SVG silhouette with gradient overlay */}
      <div className="absolute inset-0 flex items-center justify-center p-12">
        <svg 
          viewBox="0 0 400 400" 
          className="w-full h-full"
          style={{
            filter: 'drop-shadow(0 20px 60px rgba(0,0,0,0.5))',
          }}
        >
          <defs>
            <linearGradient id={`monkeyGradient-${licenseId}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{ stopColor: attributes.colors.primary, stopOpacity: 1 }} />
              <stop offset="50%" style={{ stopColor: attributes.colors.secondary, stopOpacity: 1 }} />
              <stop offset="100%" style={{ stopColor: attributes.colors.accent, stopOpacity: 1 }} />
            </linearGradient>
          </defs>
          
          {/* Monkey head */}
          <ellipse cx="200" cy="180" rx="120" ry="140" fill={`url(#monkeyGradient-${licenseId})`} />
          
          {/* Ears */}
          <circle cx="100" cy="140" r="50" fill={`url(#monkeyGradient-${licenseId})`} opacity="0.9" />
          <circle cx="300" cy="140" r="50" fill={`url(#monkeyGradient-${licenseId})`} opacity="0.9" />
          
          {/* Inner ears */}
          <circle cx="100" cy="140" r="30" fill="rgba(0,0,0,0.3)" />
          <circle cx="300" cy="140" r="30" fill="rgba(0,0,0,0.3)" />
          
          {/* Face area (lighter) */}
          <ellipse cx="200" cy="200" rx="80" ry="90" fill="rgba(255,255,255,0.2)" />
          
          {/* Eyes */}
          <ellipse cx="170" cy="180" rx="20" ry="30" fill="rgba(0,0,0,0.8)" />
          <ellipse cx="230" cy="180" rx="20" ry="30" fill="rgba(0,0,0,0.8)" />
          <circle cx="175" cy="175" r="8" fill="white" />
          <circle cx="235" cy="175" r="8" fill="white" />
          
          {/* Nose */}
          <ellipse cx="200" cy="220" rx="25" ry="20" fill="rgba(0,0,0,0.6)" />
          <circle cx="192" cy="218" r="5" fill="rgba(0,0,0,0.9)" />
          <circle cx="208" cy="218" r="5" fill="rgba(0,0,0,0.9)" />
          
          {/* Mouth */}
          <path 
            d="M 180 240 Q 200 255 220 240" 
            stroke="rgba(0,0,0,0.7)" 
            strokeWidth="4" 
            fill="none"
            strokeLinecap="round"
          />
          
          {/* Body/neck */}
          <ellipse cx="200" cy="320" rx="100" ry="80" fill={`url(#monkeyGradient-${licenseId})`} opacity="0.95" />
          
          {/* Arms */}
          <ellipse cx="120" cy="310" rx="35" ry="70" fill={`url(#monkeyGradient-${licenseId})`} opacity="0.9" transform="rotate(-20 120 310)" />
          <ellipse cx="280" cy="310" rx="35" ry="70" fill={`url(#monkeyGradient-${licenseId})`} opacity="0.9" transform="rotate(20 280 310)" />
          
          {/* Hands */}
          <circle cx="110" cy="360" r="25" fill={`url(#monkeyGradient-${licenseId})`} opacity="0.85" />
          <circle cx="290" cy="360" r="25" fill={`url(#monkeyGradient-${licenseId})`} opacity="0.85" />
        </svg>
      </div>

      {/* Subtle glow around monkey */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(circle at 50% 50%, transparent 30%, ${attributes.colors.primary}20 50%, ${attributes.colors.accent}30 70%, transparent 90%)`,
        }}
      />

      {/* License ID badge - small and subtle */}
      <div className="absolute top-6 right-6">
        <div 
          className="text-white/80 font-mono text-sm px-4 py-2 rounded-full backdrop-blur-md border border-white/20"
          style={{
            background: 'rgba(0,0,0,0.4)',
          }}
        >
          #{licenseId}
        </div>
      </div>

      {/* Owner badge at bottom */}
      <div className="absolute bottom-6 left-6 right-6">
        <div 
          className="text-white/70 text-xs font-mono px-4 py-2 rounded-lg backdrop-blur-md border border-white/10 flex items-center justify-between"
          style={{
            background: 'rgba(0,0,0,0.4)',
          }}
        >
          <span>{ownerAddress.slice(0, 8)}...{ownerAddress.slice(-6)}</span>
        </div>
      </div>
    </div>
  );
};