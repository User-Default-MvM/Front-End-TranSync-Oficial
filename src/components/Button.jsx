import React from 'react';

const Button = ({ 
  children, 
  variant = "primary", 
  size = "medium", 
  icon = null,
  iconPosition = "left",
  fullWidth = false,
  disabled = false,
  onClick = () => {},
  className = "",
  type = "button"
}) => {
  const baseClasses = `
    font-medium rounded-lg transition-all duration-300 ease-in-out 
    focus:outline-none focus:ring-2 focus:ring-offset-2 
    relative overflow-hidden cursor-pointer tracking-wide 
    shadow-[0_1px_3px_rgba(0,0,0,0.1)] 
    flex items-center justify-center
    active:transform active:translate-y-0
    before:content-[''] before:absolute before:top-1/2 before:left-1/2 
    before:w-[5px] before:h-[5px] before:bg-white before:bg-opacity-50 
    before:opacity-0 before:rounded-full before:transform before:scale-100 before:translate-x-[-50%] before:translate-y-[-50%]
    focus:not(:active):before:animate-[ripple_0.6s_ease-out]
  `;
  
  const variantClasses = {
    primary: `
      bg-gradient-to-r from-[#1a237e] to-[#3949ab] text-white border border-[#3949ab]
      hover:from-[#0d1642] hover:to-[#283593] hover:border-[#283593] hover:-translate-y-0.5 
      hover:shadow-[0_4px_12px_rgba(26,35,126,0.3)]
      focus:ring-[#3949ab] focus:ring-opacity-50
    `,
    secondary: `
      bg-gradient-to-r from-[#283593] to-[#3949ab] text-white border border-[#3949ab]
      hover:from-[#1a237e] hover:to-[#283593] hover:border-[#1a237e] hover:-translate-y-0.5 
      hover:shadow-[0_4px_12px_rgba(40,53,147,0.3)]
      focus:ring-[#283593] focus:ring-opacity-50
    `,
    outline: `
      bg-transparent text-[#1a237e] border border-[#1a237e]
      hover:bg-gradient-to-r hover:from-[#1a237e] hover:to-[#3949ab] hover:text-white hover:border-[#3949ab]
      hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(26,35,126,0.15)]
      focus:ring-[#1a237e] focus:ring-opacity-50
    `,
    danger: `
      bg-gradient-to-r from-[#c62828] to-[#d32f2f] text-white border border-[#d32f2f]
      hover:from-[#b71c1c] hover:to-[#c62828] hover:border-[#b71c1c] hover:-translate-y-0.5 
      hover:shadow-[0_4px_12px_rgba(198,40,40,0.3)]
      focus:ring-[#c62828] focus:ring-opacity-50
    `,
    success: `
      bg-gradient-to-r from-[#2e7d32] to-[#388e3c] text-white border border-[#388e3c]
      hover:from-[#1b5e20] hover:to-[#2e7d32] hover:border-[#1b5e20] hover:-translate-y-0.5 
      hover:shadow-[0_4px_12px_rgba(46,125,50,0.3)]
      focus:ring-[#2e7d32] focus:ring-opacity-50
    `,
    white: `
      bg-white text-[#1a237e] border border-gray-200
      hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 hover:border-[#283593] hover:-translate-y-0.5 
      hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)]
      focus:ring-[#1a237e] focus:ring-opacity-50
    `,
    ghost: `
      bg-transparent text-[#283593] border border-transparent
      hover:bg-gradient-to-r hover:from-[#1a237e]/5 hover:to-[#3949ab]/5 hover:text-[#1a237e]
      focus:ring-[#283593] focus:ring-opacity-50
    `
  };
  
  const sizeClasses = {
    small: "px-4 py-2 text-sm",
    medium: "px-5 py-2.5 text-[0.95rem]",
    large: "px-6 py-3 text-base"
  };
  
  const disabledClasses = "opacity-65 pointer-events-none cursor-not-allowed";
  
  const classes = [
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    fullWidth ? "w-full" : "",
    disabled ? disabledClasses : "",
    className
  ].join(" ").replace(/\s+/g, ' ').trim();
  
  return (
    <>
      <style jsx>{`
        @keyframes ripple {
          0% {
            transform: scale(0, 0);
            opacity: 0.5;
          }
          100% {
            transform: scale(20, 20);
            opacity: 0;
          }
        }
      `}</style>
      <button 
        type={type}
        className={classes} 
        onClick={onClick}
        disabled={disabled}
      >
        {icon && iconPosition === "left" && (
          <span className="flex items-center justify-center mr-2">{icon}</span>
        )}
        
        <span>{children}</span>
        
        {icon && iconPosition === "right" && (
          <span className="flex items-center justify-center ml-2">{icon}</span>
        )}
      </button>
    </>
  );
};

// Exportar el componente principal
export default Button;

// Exportar variantes predefinidas para facilitar su uso
export const PrimaryButton = (props) => <Button variant="primary" {...props} />;
export const SecondaryButton = (props) => <Button variant="secondary" {...props} />;
export const OutlineButton = (props) => <Button variant="outline" {...props} />;
export const DangerButton = (props) => <Button variant="danger" {...props} />;
export const SuccessButton = (props) => <Button variant="success" {...props} />;
export const WhiteButton = (props) => <Button variant="white" {...props} />;
export const GhostButton = (props) => <Button variant="ghost" {...props} />;