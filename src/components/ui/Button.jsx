import React from 'react'

export const Button = ({ children, variant = 'primary', className = '', ...props }) => {
  const baseStyles = 'w-full font-bold py-3 px-6 rounded-card transition-all duration-200 flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed'
  
  const variants = {
    primary: 'bg-accent-primary hover:bg-accent-secondary text-bg-primary',
    secondary: 'bg-bg-elevated hover:bg-border-strong text-text-primary border border-border',
    success: 'bg-accent-success hover:opacity-90 text-bg-primary',
    danger: 'bg-accent-danger hover:opacity-90 text-text-primary',
    ghost: 'bg-transparent hover:bg-bg-elevated text-text-secondary'
  }

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
