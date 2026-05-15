import React from 'react'

export const Input = ({ label, error, className = '', ...props }) => {
  return (
    <div className={`flex flex-col gap-1.5 w-full ${className}`}>
      {label && (
        <label className="text-text-secondary text-sm font-medium px-1">
          {label}
        </label>
      )}
      <input
        className={`bg-bg-elevated border rounded-card py-3 px-4 text-text-primary placeholder:text-text-disabled focus:border-accent-primary focus:outline-none transition-colors duration-200 ${
          error ? 'border-accent-danger' : 'border-border'
        }`}
        {...props}
      />
      {error && (
        <span className="text-accent-danger text-xs px-1 mt-0.5">
          {error}
        </span>
      )}
    </div>
  )
}
