import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';
import { Input } from '../Input';

describe('Input Component', () => {
  it('renders correctly', () => {
    render(<Input placeholder="Enter text" />);
    expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument();
  });

  it('handles typing', async () => {
    render(<Input placeholder="Email" />);
    const input = screen.getByPlaceholderText('Email');
    
    await userEvent.type(input, 'test@example.com');
    expect(input).toHaveValue('test@example.com');
  });

  it('displays error styles when error prop is passed', () => {
    render(<Input placeholder="Error Input" error />);
    const input = screen.getByPlaceholderText('Error Input');
    // Error inputs typically have red borders
    expect(input.className).toContain('border-error');
  });

  it('can be disabled', async () => {
    render(<Input placeholder="Disabled" disabled />);
    const input = screen.getByPlaceholderText('Disabled');
    
    expect(input).toBeDisabled();
    await userEvent.type(input, 'text');
    expect(input).toHaveValue(''); // Shouldn't type
  });
});
