import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PauseButton from './PauseButton';

describe('<PauseButton>', () => {
  it('shows "Pause" when not paused', () => {
    render(<PauseButton paused={false} onToggle={() => {}} />);
    const btn = screen.getByRole('button');
    expect(btn).toHaveTextContent('Pause');
    expect(btn).toHaveAttribute('aria-pressed', 'false');
  });

  it('shows "Resume" when paused', () => {
    render(<PauseButton paused={true} onToggle={() => {}} />);
    const btn = screen.getByRole('button');
    expect(btn).toHaveTextContent('Resume');
    expect(btn).toHaveAttribute('aria-pressed', 'true');
  });

  it('invokes the callback on click', async () => {
    const onToggle = vi.fn();
    render(<PauseButton paused={false} onToggle={onToggle} />);
    await userEvent.click(screen.getByRole('button'));
    expect(onToggle).toHaveBeenCalledTimes(1);
  });
});
