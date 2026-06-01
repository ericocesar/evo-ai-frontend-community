import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { WelcomeTourModal } from './WelcomeTourModal';

const markTourCompleted = vi.hoisted(() => vi.fn());
const markTourSkipped = vi.hoisted(() => vi.fn());
const mockTourStart = vi.hoisted(() => vi.fn());
const authStoreState = vi.hoisted(() => ({
  tours: {} as Record<string, 'completed' | 'skipped'>,
  markTourCompleted,
  markTourSkipped,
}));

vi.mock('@evoapi/design-system/button', () => ({
  Button: ({ children, onClick, ...props }: any) => (
    <button type="button" onClick={onClick} {...props}>{children}</button>
  ),
}));

vi.mock('@/hooks/useTranslation', () => ({
  useTranslation: () => ({
    t: (key: string) => ({
      'welcome.title': 'Bem-vindo ao BChat CRM!',
      'welcome.description': 'Quer fazer um tour guiado para conhecer as funcionalidades da plataforma?',
      'welcome.startButton': 'Iniciar tour guiado',
      'welcome.skipButton': 'Agora não',
      'welcome.neverShowAgainButton': 'Não exibir mais',
    }[key] ?? key),
  }),
}));

vi.mock('@/store/authStore', () => ({
  useAuthStore: (selector: (state: typeof authStoreState) => unknown) => selector(authStoreState),
}));

vi.mock('@/tours/tourRegistry', () => ({
  tourRegistry: { start: mockTourStart },
}));

describe('WelcomeTourModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authStoreState.tours = {};
    window.localStorage.clear();
  });

  function renderModal() {
    return render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <WelcomeTourModal />
      </MemoryRouter>,
    );
  }

  it('does not render when the local no-show preference is set', () => {
    window.localStorage.setItem('bchat:onboarding:welcome:hidden', '1');

    renderModal();

    expect(screen.queryByText('Bem-vindo ao BChat CRM!')).not.toBeInTheDocument();
  });

  it('hides only for the current session when clicking not now', () => {
    renderModal();

    fireEvent.click(screen.getByRole('button', { name: 'Agora não' }));

    expect(screen.queryByText('Bem-vindo ao BChat CRM!')).not.toBeInTheDocument();
    expect(markTourSkipped).not.toHaveBeenCalled();
    expect(markTourCompleted).not.toHaveBeenCalled();
    expect(window.localStorage.getItem('bchat:onboarding:welcome:hidden')).toBeNull();
  });

  it('persists the no-show preference when clicking the explicit action', () => {
    renderModal();

    fireEvent.click(screen.getByRole('button', { name: 'Não exibir mais' }));

    expect(markTourSkipped).toHaveBeenCalledWith('onboarding:preference');
    expect(markTourCompleted).toHaveBeenCalledWith('onboarding:welcome');
    expect(window.localStorage.getItem('bchat:onboarding:welcome:hidden')).toBe('1');
    expect(screen.queryByText('Bem-vindo ao BChat CRM!')).not.toBeInTheDocument();
  });
});