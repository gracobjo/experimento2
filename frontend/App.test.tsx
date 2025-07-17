import { render, screen } from '@testing-library/react';
import App from '../App';

test('renders main app component', () => {
  render(<App />);
  expect(screen.getByText(/despacho/i)).toBeInTheDocument();
}); 