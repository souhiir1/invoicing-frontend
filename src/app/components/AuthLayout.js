import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { logout } from '../redux/userSlice';
import styles from './AuthLayout.module.css';
import { FaCreditCard } from 'react-icons/fa';
import { 
  FaTachometerAlt, 
  FaUsers, 
  FaProjectDiagram, 
  FaFileInvoice, 
  FaUserCircle,
  FaChevronDown,
  FaSignOutAlt,
  FaCog,
  FaBars,
  FaTimes,FaPlusCircle,FaListUl
} from 'react-icons/fa';
import Image from 'next/image';
import useSubscriptionCheck from '../hooks/useSubscriptionCheck';
export default function AuthLayout({ user, children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [facturesSubmenuOpen, setFacturesSubmenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useDispatch();
  const dropdownRef = useRef(null);
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;

 const menuItems = [
  { label: 'Dashboard', icon: <FaTachometerAlt />, href: '/dashboard' },
  { label: 'Clients', icon: <FaUsers />, href: '/clients' },
  { label: 'Projects', icon: <FaProjectDiagram />, href: '/projects' },
  {
    label: 'Factures',
    icon: <FaFileInvoice />,
    href: '/invoices',
    submenu: [
      { label: 'Liste des factures', href: '/invoices', icon: <FaListUl size={14} /> },
      { label: 'Créer facture', href: '/create', icon: <FaPlusCircle size={14} /> },
    ],
  },
];

  const handleLogout = () => {
    dispatch(logout());
    router.push('/login');
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

 
  useEffect(() => {
    if (pathname?.startsWith('/invoices')) {
      setFacturesSubmenuOpen(true);
    } else {
      setFacturesSubmenuOpen(false);
    }
  }, [pathname]);
useSubscriptionCheck();
  return (
    <div className={styles.container}>
      {sidebarOpen && <div className={styles.overlay} onClick={() => setSidebarOpen(false)} />}

      <aside className={`${styles.sidebar} ${sidebarOpen ? styles.open : ''}`}>
        <div className={styles.logo}>
          <Link href="/dashboard">
            <Image
              src="/flousniper_logo_white.png"
              alt="flouSniper Logo"
              width={200}
              height={60}
              className={styles.logoImage}
              priority
            />
          </Link>
          <button
            className={styles.closeBtn}
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
          >
            <FaTimes />
          </button>
        </div>
        <nav className={styles.nav}>
          <ul>
            {menuItems.map(({ label, icon, href, submenu }) => {
              if (!submenu) {
                return (
                  <li key={label} className={pathname === href ? styles.active : ''}>
                    <Link href={href} className={styles.link} onClick={() => setSidebarOpen(false)}>
                      <span className={styles.icon}>{icon}</span>
                      <span className={styles.label}>{label}</span>
                    </Link>
                  </li>
                );
              }
              return (
                <li key={label}>
         <div
  className={`${styles.link} ${facturesSubmenuOpen ? styles.active : ''}`}
  onClick={() => setFacturesSubmenuOpen(!facturesSubmenuOpen)}
>
  <span className={styles.menuItemContent}>
    <span className={styles.icon}>{icon}</span>
    <span className={styles.label}>{label}</span>
  </span>
  <FaChevronDown className={`${styles.chevron} ${facturesSubmenuOpen ? styles.rotated : ''}`} />
</div>
 {facturesSubmenuOpen && (
      <ul className={styles.submenu}>
        {submenu.map((item) => (
          <li
            key={item.label}
            className={pathname === item.href ? styles.activeSubmenu : ''}
          >
            <Link
              href={item.href}
              className={styles.submenuLink}
              onClick={() => setSidebarOpen(false)}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', paddingLeft: '2.5rem' }}
            >
              <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)' }}>
                {item.icon}
              </span>
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    )}
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>

      <div className={styles.main}>
        <header className={styles.navbar}>
          <div className={styles.navbarLeft}>
            <button
              className={styles.menuBtn}
              onClick={() => setSidebarOpen(true)}
              aria-label="Open menu"
            >
              <FaBars />
            </button>
          </div>

          <div className={styles.navbarRight}>
            <div className={styles.userContainer} ref={dropdownRef}>
              <div
                className={styles.userInfo}
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                <span className={styles.userName}>{user?.full_name}</span>
                {user?.image ? (
                  <Image
                    src={`${baseUrl}${user.image}`}
                    alt="User"
                    className={styles.userImage}
                    width={36}
                    height={36}
                  />
                ) : (
                  <FaUserCircle className={styles.userIcon} />
                )}
                <FaChevronDown className={`${styles.chevron} ${dropdownOpen ? styles.rotated : ''}`} />
              </div>
<Link href="/subscribe" className={styles.dropdownItem}>
  <FaCreditCard className={styles.dropdownIcon} />
  <span>Gérer mon abonnement</span>
</Link>
              {dropdownOpen && (
                <div className={styles.dropdown}>
                  <Link
                    href="/profile"
                    className={styles.dropdownItem}
                    onClick={() => setDropdownOpen(false)}
                  >
                    <FaCog className={styles.dropdownIcon} />
                    <span>Paramètres</span>
                  </Link>
                  <button
                    className={styles.dropdownItem}
                    onClick={handleLogout}
                  >
                    <FaSignOutAlt className={styles.dropdownIcon} />
                    <span>Déconnexion</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>
        <main className={styles.content}>{children}</main>
      </div>
    </div>
  );
}
