'use client';
import './globals.css';
import { Provider } from 'react-redux';
import { store } from './redux/store';
import styles from './styles/layout.module.css';
import Link from 'next/link';

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body className={styles.body}>
        <Provider store={store}>
          <main className={styles.container}>{children}</main>
          <footer className={styles.footer}>
            <Link href="https://inovasphere.tech" target="_blank" className={styles.footerLink}>
              <span>© {new Date().getFullYear()} Powered by <strong>Inova Sphere</strong></span>
            </Link>
          </footer>
        </Provider>
      </body>
    </html>
  );
}