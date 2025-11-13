'use client';
import { useSelector } from 'react-redux';
import AuthLayout from '../components/AuthLayout';
import React, { useState, useEffect } from 'react';
import styles from './page.module.css';
import Link from 'next/link';
import PrintInvoice from './print/PrintInvoice'; 

export default function InvoicesListPage() {
  const [clients, setClients] = useState([]);
  const [projects, setProjects] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [printOpen, setPrintOpen] = useState(false);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState(null);
  
  const user = useSelector(state => state.user.user);
  const token = useSelector((state) => state.user.token);
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;

 
  useEffect(() => {
    fetchInvoices();
  }, []);

  async function fetchInvoices() {
    setLoading(true);
    try {
      const res = await fetch(`${baseUrl}/api/invoices`, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      if (res.ok) {
        const data = await res.json();
        setInvoices(data);
      }
    } catch (error) {
      console.error('Error fetching invoices:', error);
    } finally {
      setLoading(false);
    }
  }

  async function deleteInvoice(invoiceId) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette facture ?')) {
      return;
    }

    try {
      const res = await fetch(`${baseUrl}/api/invoices/${invoiceId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        setInvoices(invoices.filter(inv => inv.id !== invoiceId));
      } else {
        alert('Erreur lors de la suppression de la facture');
      }
    } catch (error) {
      console.error('Error deleting invoice:', error);
      alert('Erreur lors de la suppression de la facture');
    }
  }

  function handlePrintInvoice(invoiceId) {
    setSelectedInvoiceId(invoiceId);
    setPrintOpen(true);
  }

  const StatusBadge = ({ status }) => {
    const statusColors = {
      'payée': '#10b981',
      'envoyée': '#3b82f6',
      'brouillon': '#6b7280',
      'en_retard': '#ef4444',
      'en_attente': '#f59e0b'
    };

    return (
      <span 
        className={styles.statusBadge}
        style={{ backgroundColor: statusColors[status] || '#6b7280' }}
      >
        {status}
      </span>
    );
  };

  const PaymentStatusBadge = ({ status }) => {
    const paymentColors = {
      'payé': '#10b981',
      'partiel': '#f59e0b',
      'impayé': '#ef4444',
      'en_retard': '#dc2626'
    };

    return (
      <span 
        className={styles.paymentBadge}
        style={{ backgroundColor: paymentColors[status] || '#6b7280' }}
      >
        {status}
      </span>
    );
  };

  return (
    <AuthLayout user={user}>
      <div className={styles.container}>
        <header className={styles.header}>
          <div className={styles.headerContent}>
            <h1 className={styles.title}>Mes Factures</h1>
            <p className={styles.subtitle}>
              Gérez et suivez vos factures en un seul endroit
            </p>
          </div>
          <Link href="/invoices/create" className={styles.btnPrimary}>
            <span className={styles.btnIcon}>+</span>
            Nouvelle facture
          </Link>
        </header>

   
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statValue}>{invoices.length}</div>
            <div className={styles.statLabel}>Total Factures</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statValue}>
              {invoices.filter(inv => inv.payment_status === 'payé').length}
            </div>
            <div className={styles.statLabel}>Payées</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statValue}>
              {invoices.filter(inv => inv.payment_status === 'impayé').length}
            </div>
            <div className={styles.statLabel}>Impayées</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statValue}>
              {invoices.reduce((sum, inv) => sum + (inv.total_ttc || 0), 0).toFixed(3)} TND
            </div>
            <div className={styles.statLabel}>{`Chiffre d'affaires`}</div>
          </div>
        </div>

      
        <div className={styles.tableContainer}>
          {loading ? (
            <div className={styles.loading}>Chargement des factures...</div>
          ) : invoices.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>📄</div>
              <h3>Aucune facture trouvée</h3>
              <p>Créez votre première facture pour commencer</p>
              <Link href="/invoices/create" className={styles.btnPrimary}>
                Créer une facture
              </Link>
            </div>
          ) : (
            <>
              <table className={styles.desktopTable}>
                <thead>
                  <tr>
                    <th>Ref Facture</th>
                    <th>Client</th>
                    <th>Date émission</th>
                    <th>Date échéance</th>
                    <th>Total TTC</th>
                    <th>Statut</th>
                    <th>Paiement</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((inv) => (
                    <tr key={inv.id} className={styles.tableRow}>
                      <td className={styles.refCell}>
                        <strong>{inv.ref_facture || inv.invoice_number}</strong>
                      </td>
                      <td>{inv.client_name || '-'}</td>
                      <td>{inv.issue_date?.slice(0, 10)}</td>
                      <td className={inv.due_date && new Date(inv.due_date) < new Date() ? styles.overdue : ''}>
                        {inv.due_date?.slice(0, 10)}
                      </td>
                      <td className={styles.amount}>
                        <strong>{inv?.total_ttc?.toFixed(3)} TND</strong>
                      </td>
                      <td>
                        <StatusBadge status={inv.status} />
                      </td>
                      <td>
                        <PaymentStatusBadge status={inv.payment_status} />
                      </td>
                      <td>
                        <div className={styles.actionButtons}>
                          <button
                            onClick={() => handlePrintInvoice(inv.id)}
                            className={styles.iconBtn}
                            aria-label="Imprimer facture"
                            title="Imprimer"
                          >
                            🖨️
                          </button>
                          <Link
                            href={`/invoices/create?id=${inv.id}`}
                            className={styles.iconBtn}
                            aria-label="Modifier facture"
                            title="Modifier"
                          >
                            ✏️
                          </Link>
                          <button
                            onClick={() => deleteInvoice(inv.id)}
                            className={`${styles.iconBtn} ${styles.deleteBtn}`}
                            aria-label="Supprimer facture"
                            title="Supprimer"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className={styles.mobileList}>
                {invoices.map((inv) => (
                  <div key={inv.id} className={styles.mobileCard}>
                    <div className={styles.cardHeader}>
                      <div className={styles.cardTitle}>
                        <strong>{inv.ref_facture || inv.invoice_number}</strong>
                        <div className={styles.cardStatus}>
                          <StatusBadge status={inv.status} />
                          <PaymentStatusBadge status={inv.payment_status} />
                        </div>
                      </div>
                      <div className={styles.amount}>
                        {inv?.total_ttc?.toFixed(3)} TND
                      </div>
                    </div>
                    
                    <div className={styles.cardContent}>
                      <div className={styles.cardRow}>
                        <span>Client:</span>
                        <span>{inv.client_name || '-'}</span>
                      </div>
                      <div className={styles.cardRow}>
                        <span>Émission:</span>
                        <span>{inv.issue_date?.slice(0, 10)}</span>
                      </div>
                      <div className={styles.cardRow}>
                        <span>Échéance:</span>
                        <span className={inv.due_date && new Date(inv.due_date) < new Date() ? styles.overdue : ''}>
                          {inv.due_date?.slice(0, 10)}
                        </span>
                      </div>
                    </div>

                    <div className={styles.cardActions}>
                      <button
                        onClick={() => handlePrintInvoice(inv.id)}
                        className={styles.mobileBtn}
                      >
                        🖨️ Imprimer
                      </button>
                      <Link
                        href={`/invoices/create?id=${inv.id}`}
                        className={styles.mobileBtn}
                      >
                        ✏️ Modifier
                      </Link>
                      <button
                        onClick={() => deleteInvoice(inv.id)}
                        className={`${styles.mobileBtn} ${styles.mobileDelete}`}
                      >
                        🗑️ Supprimer
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

       
        <PrintInvoice 
          invoiceId={selectedInvoiceId} 
          open={printOpen} 
          onClose={() => setPrintOpen(false)} 
        />
      </div>
    </AuthLayout>
  );
}