'use client';

import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import styles from './PrintInvoice.module.css';

export default function PrintInvoice({ invoiceId, open, onClose }) {
  const token = useSelector((s) => s.user.token);
  const user = useSelector((s) => s.user.user);
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;

  const [invoice, setInvoice] = useState(null);
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);

  useEffect(() => {
    if (!open || !invoiceId) return;
    fetchData(invoiceId);
   
  }, [open, invoiceId]);

  async function fetchData(id) {
    setLoading(true);
    setErr(null);
    setInvoice(null);
    setClient(null);
    try {
      const res = await fetch(`${baseUrl}/api/invoices/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Impossible de récupérer la facture');
      const inv = await res.json();

      let items = inv.items;
      try { if (typeof items === 'string') items = JSON.parse(items); } catch(e){}

      inv.items = items || [];
      setInvoice(inv);

      
      if (inv.client_id) {
        const cres = await fetch(`${baseUrl}/api/clients/${inv.client_id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log("cres",cres)
        if (cres.ok) setClient(await cres.json());
        else setClient({
          name: inv.name || '-',
          matricule_fiscale: inv.matricule_fiscale || '',
          address: inv.client_address || '',
          email: inv.client_email || '',
          phone: inv.client_phone || '',
        });
      }
    } catch (error) {
      console.error(error);
      setErr(error.message || 'Erreur');
    } finally { setLoading(false); }
  }

  function printInvoice() {
    if (!invoice) return;
    

    const emptyRowsCount = Math.max(0, 15 - (invoice.items?.length || 0));
    const emptyRows = Array(emptyRowsCount).fill(null);

    const printStyles = `
      @media print {
        @page {
          size: A4;
          margin: 0;
        }
        body {
          margin: 0;
          padding: 0;
          font-family: Arial, sans-serif;
          background: white;
          -webkit-print-color-adjust: exact;
          color-adjust: exact;
        }
        .print-container {
          width: 210mm;
          min-height: 297mm;
          margin: 0;
          padding: 15mm;
          box-sizing: border-box;
          background: white;
          display: flex;
          flex-direction: column;
        }
        .no-print { display: none !important; }
        
        /* Header styles */
        .print-header {
          margin-bottom: 5mm;
        }
        .print-logo {
          max-width: 120px;
          max-height: 60px;
          margin-bottom: 3mm;
        }
        .print-header-table {
          width: 100%;
          border-collapse: collapse;
        }
        .print-header-table td {
          vertical-align: top;
          padding: 2mm;
          font-size: 11px;
        }
        .invoice-ref {
          font-size: 16px;
          font-weight: bold;
          text-align: center;
          padding: 2mm;
        }
        .separator-line {
          border-bottom: 1px solid #000;
          margin: 2mm 0;
        }
        
        /* Items table styles */
        .print-items-section {
          flex: 1;
          margin: 2mm 0;
        }
        .print-items-table {
          width: 100%;
          border-collapse: collapse;
          table-layout: fixed;
        }
        .print-items-table th {
          background: #1B1366 !important;
          color: white;
          padding: 2mm 1mm;
          font-size: 10px;
          border: 1px solid #ddd;
          font-weight: bold;
        }
        .print-items-table td {
          padding: 2mm 1mm;
          border: 1px solid #ddd;
          font-size: 10px;
          vertical-align: top;
        }
        .text-left { text-align: left; }
        .text-right { text-align: right; }
        .text-center { text-align: center; }
        
        /* Footer styles */
        .print-footer {
          margin-top: 5mm;
        }
        .print-footer-table {
          width: 100%;
          border-collapse: collapse;
        }
        .print-footer-table td {
          vertical-align: top;
          padding: 2mm;
        }
        .signature-section {
          width: 50%;
          padding: 2mm;
        }
        .totals-section {
          width: 50%;
        }
        .totals-table {
          width: 100%;
          border-collapse: collapse;
        }
        .totals-table td {
          padding: 1mm 2mm;
          border: 1px solid #ddd;
          font-size: 11px;
        }
        .total-row {
          font-weight: bold;
          background: #f5f5f7;
        }
        
        /* Ensure background colors print */
        * {
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
      }
    `;

    const printableContent = `
      <div class="print-container">
        <!-- Header -->
        <header class="print-header">
          <div class="logo-container">
            ${user?.logo ? 
              `<img src="${process.env.NEXT_PUBLIC_API_URL}${user.logo}" alt="Logo" class="print-logo" />` : 
              `<div class="logo-placeholder">${user?.company_name || user?.full_name || 'Mon Entreprise'}</div>`
            }
          </div>

          <table class="print-header-table">
            <tbody>
              <tr>
                <td colspan="3" class="invoice-ref">
                  ${invoice.ref_facture || 'FACTURE'}
                </td>
              </tr>
              <tr>
                <td colspan="3">
                  <div class="separator-line"></div>
                </td>
              </tr>
              <tr>
                <td style="width: 33%;">
                  <strong>${user?.full_name || user?.company_name || ''}</strong><br/>
                  ${user?.matricule_fiscal ? `MF: ${user.matricule_fiscal}<br/>` : ''}
                 
                </td>
                <td style="width: 33%;">
                  <strong>Date émission:</strong> ${invoice.issue_date?.slice(0,10) || '-'}<br/>
                  <strong>Date échéance:</strong> ${invoice.due_date?.slice(0,10) || '-'}<br/>
                  <strong>Mode paiement:</strong> ${invoice.payment_method || '-'}
                </td>
                <td style="width: 34%;">
                  <strong>Client:</strong> ${client?.name  || '-'}<br/>
                  ${client?.matricule_fiscale ? `MF: ${client.matricule_fiscale}<br/>` : ''}
               
                </td>
              </tr>
            </tbody>
          </table>
        </header>

        <!-- Items -->
        <section class="print-items-section">
          <table class="print-items-table">
            <thead>
              <tr>
                <th style="width: 5%">RN</th>
                <th style="width: 35%">Article</th>
                <th style="width: 8%">Qté</th>
                <th style="width: 10%">Prix HT</th>
                <th style="width: 8%">Rem %</th>
                <th style="width: 8%">TVA %</th>
                <th style="width: 13%">Prix TTC (unité)</th>
                <th style="width: 13%">Valeur TTC</th>
              </tr>
            </thead>
            <tbody>
              ${invoice.items.length > 0 ? invoice.items.map((it, idx) => {
                const qte = parseFloat(it.qte || it.quantity || 1);
                const prix_ht = parseFloat(it.prix_ht || it.unit_price || 0);
                const remise = parseFloat(it.remise || it.discount || 0);
                const tva = parseFloat(it.tva || invoice.tva || 0);
                const prix_ttc = parseFloat(it.prix_ttc || it.unit_price_ttc || 0);
                const valeur = (prix_ttc || ((prix_ht - (prix_ht*remise)/100)*(1+tva/100)))*qte;
                return `
                  <tr>
                    <td class="text-center">${idx+1}</td>
                    <td class="text-left">${it.article || it.description || '-'}</td>
                    <td class="text-right">${qte}</td>
                    <td class="text-right">${prix_ht.toFixed(3)}</td>
                    <td class="text-right">${remise}</td>
                    <td class="text-right">${tva}</td>
                    <td class="text-right">${(prix_ttc||0).toFixed(3)}</td>
                    <td class="text-right">${valeur.toFixed(3)}</td>
                  </tr>
                `;
              }).join('') : `
                <tr>
                  <td colspan="8" class="text-center">Aucun article</td>
                </tr>
              `}
              
              <!-- Empty rows to fill the page -->
              ${emptyRows.map((_, index) => `
                <tr key="empty-${index}">
                  <td>&nbsp;</td>
                  <td>&nbsp;</td>
                  <td>&nbsp;</td>
                  <td>&nbsp;</td>
                  <td>&nbsp;</td>
                  <td>&nbsp;</td>
                  <td>&nbsp;</td>
                  <td>&nbsp;</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </section>

        <!-- Footer -->
        <footer class="print-footer">
          <table class="print-footer-table">
            <tbody>
              <tr>
                <td class="signature-section">
                  <strong>Cachet & Signature</strong>
                </td>
                <td class="totals-section">
                  <table class="totals-table">
                    <tbody>
                      <tr><td>Total HT</td><td class="text-right">${(invoice.total_ht||0).toFixed(3)}</td></tr>
                      <tr><td>Remise</td><td class="text-right">${(invoice.remise||0).toFixed(3)}</td></tr>
                      <tr><td>TVA</td><td class="text-right">${(invoice.tva||0).toFixed(3)}</td></tr>
                      <tr><td>Timbre</td><td class="text-right">${parseFloat(invoice.timbre||invoice.timber||0).toFixed(3)}</td></tr>
                      <tr class="total-row"><td>Total TTC</td><td class="text-right">${(invoice.total_ttc||0).toFixed(3)}</td></tr>
                    </tbody>
                  </table>
                </td>
              </tr>
            </tbody>
          </table>
        </footer>
      </div>
    `;

   
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Facture ${invoice.ref_facture || ''}</title>
          <style>${printStyles}</style>
        </head>
        <body>
          ${printableContent}
          <script>
            window.onload = function() {
              window.print();
              setTimeout(() => window.close(), 100);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  }

  if (!open) return null;

  // Calculate empty rows for preview
  const emptyRowsCount = Math.max(0, 15 - (invoice?.items?.length || 0));
  const emptyRows = Array(emptyRowsCount).fill(null);

  return (
    <div className={styles.modalOverlay} role="dialog" aria-modal="true" aria-label="Aperçu facture">
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h3>Aperçu Facture</h3>
          <div className={styles.modalActions}>
            <button onClick={printInvoice} className={styles.btnPrimary}>Imprimer</button>
            <button onClick={onClose} className={styles.btnSecondary}>Fermer</button>
          </div>
        </div>

        <div className={styles.previewArea}>
          {loading && <div className={styles.center}>Chargement...</div>}
          {err && <div className={styles.centerError}>{err}</div>}

          {!loading && invoice && (
            <article className={styles.invoiceA4}>

             
              <header className={styles.header}>
                <div className={styles.logoContainer}>
                  {user?.logo ? (
                    <img src={`${process.env.NEXT_PUBLIC_API_URL}${user.logo}`} alt="Logo" className={styles.logo} />
                  ) : (
                    <div className={styles.logoPlaceholder}>{user?.company_name || user?.full_name || 'Mon Entreprise'}</div>
                  )}
                </div>

                <table className={styles.headerTable}>
                  <tbody>
                    <tr>
                      <td colSpan="3" className={styles.invoiceRef}>
                        {invoice.ref_facture || 'FACTURE'}
                      </td>
                    </tr>
                    <tr>
                      <td colSpan="3">
                        <div className={styles.separatorLine}></div>
                      </td>
                    </tr>
                    <tr>
                      <td style={{width: '33%'}}>
                        <strong>{user?.full_name || user?.company_name || ''}</strong><br/>
                        {user?.matricule_fiscal && <>MF: {user.matricule_fiscal}<br/></>}
                       
                      </td>
                      <td style={{width: '33%'}}>
                        <strong>Date émission:</strong> {invoice.issue_date?.slice(0,10) || '-'}<br/>
                        <strong>Date échéance:</strong> {invoice.due_date?.slice(0,10) || '-'}<br/>
                        <strong>Mode paiement:</strong> {invoice.payment_method || '-'}
                      </td>
                      <td style={{width: '34%'}}>
                        <strong>Client:</strong> {client?.name || '-'}<br/>
                        {client?.matricule_fiscale && <>MF: {client.matricule_fiscale}<br/></>}
                       
                      </td>
                    </tr>
                  </tbody>
                </table>
              </header>

              {/* ITEMS */}
              <section className={styles.itemsSection}>
                <table className={styles.itemsTable}>
                  <thead>
                    <tr>
                      <th style={{width: '5%'}}>RN</th>
                      <th style={{width: '35%'}}>Article</th>
                      <th style={{width: '8%'}}>Qté</th>
                      <th style={{width: '10%'}}>Prix HT</th>
                      <th style={{width: '8%'}}>Rem %</th>
                      <th style={{width: '8%'}}>TVA %</th>
                      <th style={{width: '13%'}}>Prix TTC (unité)</th>
                      <th style={{width: '13%'}}>Valeur TTC</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoice.items.length > 0 ? invoice.items.map((it, idx) => {
                      const qte = parseFloat(it.qte || it.quantity || 1);
                      const prix_ht = parseFloat(it.prix_ht || it.unit_price || 0);
                      const remise = parseFloat(it.remise || it.discount || 0);
                      const tva = parseFloat(it.tva || invoice.tva || 0);
                      const prix_ttc = parseFloat(it.prix_ttc || it.unit_price_ttc || 0);
                      const valeur = (prix_ttc || ((prix_ht - (prix_ht*remise)/100)*(1+tva/100)))*qte;
                      return (
                        <tr key={idx}>
                          <td className={styles.center}>{idx+1}</td>
                          <td className={styles.left}>{it.article || it.description || '-'}</td>
                          <td className={styles.right}>{qte}</td>
                          <td className={styles.right}>{prix_ht.toFixed(3)}</td>
                          <td className={styles.right}>{remise}</td>
                          <td className={styles.right}>{tva}</td>
                          <td className={styles.right}>{(prix_ttc||0).toFixed(3)}</td>
                          <td className={styles.right}>{valeur.toFixed(3)}</td>
                        </tr>
                      )
                    }) : (
                      <tr>
                        <td colSpan="8" className={styles.center}>Aucun article</td>
                      </tr>
                    )}
                    
                    {/* Empty rows to fill the page */}
                    {emptyRows.map((_, index) => (
                      <tr key={`empty-${index}`}>
                        <td>&nbsp;</td>
                        <td>&nbsp;</td>
                        <td>&nbsp;</td>
                        <td>&nbsp;</td>
                        <td>&nbsp;</td>
                        <td>&nbsp;</td>
                        <td>&nbsp;</td>
                        <td>&nbsp;</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </section>

              {/* FOOTER */}
              <footer className={styles.footer}>
                <table className={styles.footerTable}>
                  <tbody>
                    <tr>
                      <td className={styles.signatureSection}>
                        <strong>Cachet & Signature</strong>
                      </td>
                      <td className={styles.totalsSection}>
                        <table className={styles.totalsTable}>
                          <tbody>
                            <tr><td>Total HT</td><td className={styles.right}>{(invoice.total_ht||0).toFixed(3)}</td></tr>
                            <tr><td>Remise</td><td className={styles.right}>{(invoice.remise||0).toFixed(3)}</td></tr>
                            <tr><td>TVA</td><td className={styles.right}>{(invoice.tva||0).toFixed(3)}</td></tr>
                            <tr><td>Timbre</td><td className={styles.right}>{parseFloat(invoice.timbre||invoice.timber||0).toFixed(3)}</td></tr>
                            <tr className={styles.totalRow}><td>Total TTC</td><td className={styles.right}>{(invoice.total_ttc||0).toFixed(3)}</td></tr>
                          </tbody>
                        </table>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </footer>

            </article>
          )}
        </div>
      </div>
    </div>
  );
}