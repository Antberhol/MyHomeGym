import {
  Activity,
  BookOpen,
  Dumbbell,
  Home,
  LayoutDashboard,
  Menu,
  Settings,
  UserCircle,
  Workflow,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { NavLink, Outlet } from 'react-router-dom'
import { useUiStore } from '../../stores/ui-store'
import { PlateMark } from './PlateMark'

function SidebarItem({ to, label, icon: Icon, isExpanded }) {
  const { t } = useTranslation()

  return (
    <NavLink
      to={to}
      end={to === '/'}
      aria-label={t('appShell.goToAria', { label })}
      className={({ isActive }) =>
        `flex items-center rounded-xl px-3 py-2.5 text-[15px] font-semibold transition ${isExpanded ? 'gap-3' : 'justify-center'} ${
          isActive
            ? 'bg-gym-card text-gym-text-bright shadow-[inset_3px_0_0_rgb(var(--gym-accent))]'
            : 'text-gym-text-muted hover:bg-gym-card hover:text-gym-text-bright'
        }`
      }
    >
      <Icon size={19} className="flex-shrink-0" />
      {isExpanded && <span className="whitespace-nowrap">{label}</span>}
    </NavLink>
  )
}

export function AppShell() {
  const { t } = useTranslation()
  const sidebarCollapsed = useUiStore((state) => state.sidebarCollapsed)
  const toggleSidebar = useUiStore((state) => state.toggleSidebar)

  const navItems = [
    { to: '/', label: t('nav.dashboard'), icon: LayoutDashboard },
    { to: '/entrenar', label: t('nav.train'), icon: Dumbbell },
    { to: '/rutinas', label: t('nav.routines'), icon: Workflow },
    { to: '/catalogo', label: t('nav.catalog'), icon: BookOpen },
    { to: '/progreso', label: t('nav.progress'), icon: Activity },
    { to: '/perfil', label: t('nav.profile'), icon: UserCircle },
    { to: '/configuracion', label: t('nav.settings'), icon: Settings },
  ]

  const sideTabs = [
    [
      { to: '/', label: t('nav.home'), icon: Home },
      { to: '/rutinas', label: t('nav.routines'), icon: Workflow },
    ],
    [
      { to: '/catalogo', label: t('nav.catalog'), icon: BookOpen },
      { to: '/progreso', label: t('nav.progress'), icon: Activity },
    ],
  ]

  const tabClass = ({ isActive }) =>
    `mobile-bottom-nav-item flex flex-col items-center justify-center gap-0.5 rounded-xl py-1.5 text-[11px] font-semibold transition ${
      isActive ? 'text-gym-text-bright' : 'text-gym-text-muted'
    }`

  return (
    <div className="min-h-[100dvh] bg-gym-bg-dark text-gym-text-base">
      <div className="mx-auto flex h-[100dvh] max-w-[1400px] overflow-hidden">
        <aside
          className={`hidden flex-col border-r border-gym-border bg-gym-black p-3 md:flex ${
            sidebarCollapsed ? 'w-[78px]' : 'w-[240px]'
          }`}
        >
          <div
            className={`mb-6 mt-2 flex items-center ${sidebarCollapsed ? 'justify-center' : 'gap-2.5 px-2'}`}
          >
            <PlateMark />
            {!sidebarCollapsed && (
              <span className="font-display text-2xl font-black text-gym-text-bright">MyHomeGym</span>
            )}
          </div>
          <nav aria-label={t('appShell.primaryNavAria')} className="space-y-1">
            {navItems.map((item) => (
              <SidebarItem key={item.to} {...item} isExpanded={!sidebarCollapsed} />
            ))}
          </nav>
          <button
            type="button"
            onClick={toggleSidebar}
            aria-label={t('appShell.toggleSidebarAria')}
            className="mt-auto flex items-center justify-center rounded-xl px-3 py-2 text-gym-text-muted hover:bg-gym-card"
          >
            <Menu size={18} />
          </button>
        </aside>

        <main className="app-main-content flex-1 overflow-y-auto px-4 pb-[calc(7rem+env(safe-area-inset-bottom))] pt-[max(0.75rem,env(safe-area-inset-top))] sm:px-6 md:pb-10">
          <div className="mx-auto w-full max-w-3xl">
            <Outlet />
          </div>
        </main>
      </div>

      <nav
        aria-label={t('appShell.mobileNavAria')}
        className="mobile-bottom-nav fixed bottom-0 left-0 right-0 z-40 border-t border-gym-border bg-gym-black/95 px-2 pt-1.5 backdrop-blur md:hidden"
        style={{ paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))' }}
      >
        <div className="mx-auto grid max-w-md grid-cols-5 items-end">
          {sideTabs[0].map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} end={to === '/'} className={tabClass}>
              <Icon size={22} strokeWidth={2.2} />
              <span>{label}</span>
            </NavLink>
          ))}
          <NavLink
            to="/entrenar"
            aria-label={t('appShell.goToAria', { label: t('nav.train') })}
            className="flex flex-col items-center gap-0.5 text-[11px] font-semibold text-gym-text-bright"
          >
            {({ isActive }) => (
              <>
                <span
                  className={`-mt-6 flex h-16 w-16 items-center justify-center rounded-full border-4 border-gym-black bg-gym-accent shadow-lg ${
                    isActive ? 'ring-2 ring-gym-text-bright' : ''
                  }`}
                >
                  <Dumbbell size={26} className="text-gym-on-accent" strokeWidth={2.4} />
                </span>
                <span>{t('nav.train')}</span>
              </>
            )}
          </NavLink>
          {sideTabs[1].map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} className={tabClass}>
              <Icon size={22} strokeWidth={2.2} />
              <span>{label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  )
}
