import React from 'react';

const Loader = ({ size = 'medium', color = 'primary', variant = 'spin' }) => {
  const sizeClasses = {
    small: 'h-4 w-4',
    medium: 'h-8 w-8',
    large: 'h-12 w-12',
    xlarge: 'h-16 w-16'
  };

  const colorClasses = {
    primary: 'text-blue-500 border-blue-500',
    white: 'text-white border-white',
    gray: 'text-gray-400 border-gray-400',
    success: 'text-green-500 border-green-500',
    warning: 'text-yellow-500 border-yellow-500',
    danger: 'text-red-500 border-red-500'
  };

  // Spinning Circle Loader (Default)
  const SpinLoader = () => (
    <div className="flex justify-center items-center">
      <div 
        className={`animate-spin rounded-full border-2 border-gray-700 border-t-current ${sizeClasses[size]} ${colorClasses[color]}`}
        role="status"
        aria-label="Loading"
      >
        <span className="sr-only">Loading...</span>
      </div>
    </div>
  );

  // Dots Loader
  const DotsLoader = () => (
    <div className="flex justify-center items-center space-x-1">
      {[0, 1, 2].map((index) => (
        <div
          key={index}
          className={`rounded-full ${size === 'small' ? 'w-1 h-1' : size === 'medium' ? 'w-2 h-2' : 'w-3 h-3'} ${colorClasses[color].split(' ')[0]} animate-pulse`}
          style={{
            animationDelay: `${index * 0.2}s`,
            animationDuration: '1.4s'
          }}
        />
      ))}
    </div>
  );

  // Pulse Loader
  const PulseLoader = () => (
    <div className="flex justify-center items-center">
      <div 
        className={`rounded-full ${sizeClasses[size]} ${colorClasses[color].split(' ')[0]} animate-pulse`}
        style={{ animationDuration: '1s' }}
      />
    </div>
  );

  // Bars Loader
  const BarsLoader = () => (
    <div className="flex justify-center items-center space-x-1">
      {[0, 1, 2, 3].map((index) => (
        <div
          key={index}
          className={`${colorClasses[color].split(' ')[0]} animate-pulse`}
          style={{
            width: size === 'small' ? '2px' : size === 'medium' ? '3px' : '4px',
            height: size === 'small' ? '12px' : size === 'medium' ? '20px' : '32px',
            animationDelay: `${index * 0.1}s`,
            animationDuration: '1.2s'
          }}
        />
      ))}
    </div>
  );

  // Render based on variant
  const renderLoader = () => {
    switch (variant) {
      case 'dots':
        return <DotsLoader />;
      case 'pulse':
        return <PulseLoader />;
      case 'bars':
        return <BarsLoader />;
      case 'spin':
      default:
        return <SpinLoader />;
    }
  };

  return renderLoader();
};

// Enhanced Page Loader with Dark Theme
export const PageLoader = ({ message = 'Loading amazing events...' }) => (
  <div className="fixed inset-0 bg-black bg-opacity-90 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
    <div className="text-center p-8 bg-gray-800 border border-gray-700 rounded-xl shadow-medium animate-scale-in">
      <div className="mb-6">
        <Loader size="large" color="primary" />
      </div>
      <div className="mb-4">
        <div className="w-12 h-12 mx-auto gradient-bg rounded-xl flex items-center justify-center mb-4">
          <span className="text-white text-2xl font-bold">E</span>
        </div>
        <h2 className="text-xl font-bold text-white mb-2">EventHub</h2>
      </div>
      <p className="text-gray-300 animate-pulse text-sm">{message}</p>
      
      {/* Progress bar animation */}
      <div className="mt-6 w-48 mx-auto">
        <div className="h-1 bg-gray-700 rounded-full overflow-hidden">
          <div className="h-full gradient-bg animate-pulse" style={{ animationDuration: '2s' }} />
        </div>
      </div>
    </div>
  </div>
);

// Button Loader for inline usage
export const ButtonLoader = ({ size = 'small', color = 'white' }) => (
  <Loader size={size} color={color} variant="spin" />
);

// Card Loading Skeleton
export const CardSkeleton = ({ count = 1 }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
    {[...Array(count)].map((_, index) => (
      <div 
        key={index}
        className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden animate-pulse"
        style={{ animationDelay: `${index * 0.1}s` }}
      >
        {/* Image skeleton */}
        <div className="h-48 bg-gray-700" />
        
        {/* Content skeleton */}
        <div className="p-6 space-y-4">
          {/* Title lines */}
          <div className="space-y-2">
            <div className="h-4 bg-gray-700 rounded w-3/4" />
            <div className="h-4 bg-gray-700 rounded w-1/2" />
          </div>
          
          {/* Description lines */}
          <div className="space-y-2">
            <div className="h-3 bg-gray-700 rounded" />
            <div className="h-3 bg-gray-700 rounded w-5/6" />
          </div>
          
          {/* Button skeleton */}
          <div className="h-10 bg-gray-700 rounded" />
        </div>
      </div>
    ))}
  </div>
);

// Text Loading Skeleton
export const TextSkeleton = ({ lines = 3 }) => (
  <div className="space-y-3 animate-pulse">
    {[...Array(lines)].map((_, index) => (
      <div 
        key={index}
        className={`h-4 bg-gray-700 rounded ${
          index === lines - 1 ? 'w-3/4' : 'w-full'
        }`}
      />
    ))}
  </div>
);

// Loading Overlay for specific sections
export const LoadingOverlay = ({ 
  isLoading, 
  children, 
  message = 'Loading...', 
  size = 'medium' 
}) => {
  if (!isLoading) return children;

  return (
    <div className="relative">
      {children}
      <div className="absolute inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-10 animate-fade-in">
        <div className="text-center p-6 bg-gray-800 border border-gray-700 rounded-xl shadow-medium">
          <Loader size={size} color="primary" />
          <p className="mt-4 text-white text-sm">{message}</p>
        </div>
      </div>
    </div>
  );
};

// Inline Loader for smaller spaces
export const InlineLoader = ({ 
  text = 'Loading...', 
  size = 'small', 
  color = 'primary' 
}) => (
  <div className="flex items-center justify-center space-x-3 py-4">
    <Loader size={size} color={color} />
    <span className="text-gray-300 text-sm font-medium">{text}</span>
  </div>
);

export default Loader;
