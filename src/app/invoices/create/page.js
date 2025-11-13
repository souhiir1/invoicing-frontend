'use client';
import { useSelector } from 'react-redux';
import AuthLayout from '@/app/components/AuthLayout';
import React, { useState, useEffect } from 'react';
import styles from './page.module.css';
import { useRouter, useSearchParams } from 'next/navigation';
import PrintInvoice from '../print/PrintInvoice';
export default function CreateInvoicePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const invoiceId = searchParams.get('id');
const [printOpen, setPrintOpen] = useState(false);
const [selectedInvoiceId, setSelectedInvoiceId] = useState(null);
  const [clients, setClients] = useState([]);
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const user = useSelector((state) => state.user.user);
  const token = useSelector((state) => state.user.token);
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;

  const [form, setForm] = useState({
    client_id: '',
    project_id: '',
    invoice_number: '',
    ref_facture: '', 
    issue_date: new Date().toISOString().slice(0, 10),
    due_date: '',
    timber: 1,
    payment_method: '',
    payment_status: 'impayé',
    
    items: [
      { article: '', qte: 1, prix_ht: 0, remise: 0, tva: 19, prix_ttc: 0 },
    ],
  });

  const [totals, setTotals] = useState({ total_ht: 0, total_tva: 0, total_ttc: 0,total_remise:0 });

  // Fetch clients & invoice data
  useEffect(() => {
    fetchClients();
    if (invoiceId) fetchInvoice(invoiceId);
    else fetchNextRef();
  }, [invoiceId]);

  useEffect(() => {
    if (form.client_id) fetchProjects(form.client_id);
  }, [form.client_id]);

  useEffect(() => {
    calculateTotals();
  }, [form.items, form.timber]);

  async function fetchClients() {
    const res = await fetch(`${baseUrl}/api/clients`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) setClients(await res.json());
  }

  async function fetchProjects(clientId) {
    const res = await fetch(`${baseUrl}/api/projects/byClient/${clientId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) setProjects(await res.json());
  }

  async function fetchInvoice(id) {
  setIsLoading(true);
  try {
    const res = await fetch(`${baseUrl}/api/invoices/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) throw new Error('Erreur récupération facture');

    const data = await res.json();

    setForm({
      client_id: data.client_id,
      project_id: data.project_id,
      invoice_number: data.invoice_number || '',
      ref_facture: data.ref_facture,
      issue_date: data.issue_date?.slice(0, 10) || '',
      due_date: data.due_date?.slice(0, 10) || '',
      timber: parseFloat(data.timber) || 0,
      payment_method: data.payment_method || '',
      payment_status: data.payment_status || 'impayé',
      commentaire: data.commentaire || '',
      items: data.items?.length
        ? data.items.map((it) => ({
            id: it.id,
            article: it.article,
            qte: parseFloat(it.qte),
            prix_ht: parseFloat(it.prix_ht),
            remise: parseFloat(it.remise),
            tva: parseFloat(it.tva),
            prix_ttc: parseFloat(it.prix_ttc),
          }))
        : [],
    });
  } catch (err) {
    console.error(err);
    alert('Erreur récupération facture');
  } finally {
    setIsLoading(false);
  }
}


  async function fetchNextRef() {
    try {
      // alert("hey")
      const res = await fetch(`${baseUrl}/api/invoices/nextRef`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // alert(JSON.stringify(res))
      if (res.ok) {
        const data = await res.json();
        console.log("ref_facture",data.ref_facture)
        setForm((f) => ({ ...f, ref_facture: data.ref_facture }));
      }
    } catch (err) {
      console.error('Erreur génération ref_facture:', err);
    }
  }

  function handleItemChange(index, field, value) {
    const updatedItems = [...form.items];
    const item = { ...updatedItems[index], [field]: value };

    const qte = parseFloat(item.qte) || 0;
    let ht = parseFloat(item.prix_ht) || 0;
    let ttc = parseFloat(item.prix_ttc) || 0;
    const remise = parseFloat(item.remise) || 0;
    const tva = parseFloat(item.tva) || 0;

    if (field === 'prix_ttc') {
      ht = (ttc / (1 + tva / 100)) / (1 - remise / 100);
      item.prix_ht = parseFloat(ht.toFixed(3));
    } else if (['prix_ht', 'tva', 'remise', 'qte'].includes(field)) {
      ttc = (ht - ht * (remise / 100)) * (1 + tva / 100);
      item.prix_ttc = parseFloat(ttc.toFixed(3));
    }

    updatedItems[index] = item;
    setForm((f) => ({ ...f, items: updatedItems }));
  }

  function addItem() {
    setForm((f) => ({
      ...f,
      items: [...f.items, { article: '', qte: 1, prix_ht: 0, remise: 0, tva: form.items[0]?.tva || 19, prix_ttc: 0 }],
    }));
  }

  function removeItem(i) {
    const updated = form.items.filter((_, idx) => idx !== i);
    setForm((f) => ({ ...f, items: updated }));
  }

 function calculateTotals() {
  let total_ht = 0;
  let total_tva = 0;
  let total_remise_value = 0;
  let total_ttc = 0;

  form.items.forEach(it => {
    const qte = parseFloat(it.qte) || 0;
    const prix_ht = parseFloat(it.prix_ht) || 0;
    const remise = parseFloat(it.remise) || 0;
    const tva = parseFloat(it.tva) || 0;
    const prix_ttc = parseFloat(it.prix_ttc) || 0;

    const ht_ligne = prix_ht * qte;
    const remise_val = ht_ligne * (remise / 100);
    const tva_val = (ht_ligne - remise_val) * (tva / 100);
    const ttc_ligne = ht_ligne - remise_val + tva_val;

    total_ht += ht_ligne;
    total_remise_value += remise_val;
    total_tva += tva_val;
    total_ttc += prix_ttc*qte;
  });

  total_ttc += parseFloat(form.timber || 0);

  setTotals({
    total_ht,
    total_tva,
    total_remise: total_remise_value,
    total_ttc
  });
}



async function handleSubmit(e) {
  e.preventDefault();
  const payload = { ...form, total_ht: totals.total_ht, total_ttc: totals.total_ttc, tva: totals.total_tva, remise: totals.total_remise };

  const method = invoiceId ? 'PUT' : 'POST';
  const url = invoiceId ? `${baseUrl}/api/invoices/${invoiceId}` : `${baseUrl}/api/invoices`;

  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });

  if (res.ok) {
    const data = await res.json();
 
    setSelectedInvoiceId(data.id);
   
    if (!invoiceId) {
      router.replace(`/invoices/create?id=${data.id}`); 
    }
    setShowDialog(true);
  } else {
    alert('Erreur de sauvegarde');
  }
}

function handleCreateNewInvoice() {
  setForm({
    client_id: '',
    project_id: '',
    invoice_number: '',
    ref_facture: '',
    issue_date: new Date().toISOString().slice(0, 10),
    due_date: '',
    timber: 1,
    payment_method: '',
    payment_status: 'impayé',
    items: [{ article: '', qte: 1, prix_ht: 0, remise: 0, tva: 19, prix_ttc: 0 }],
  });
  setTotals({ total_ht: 0, total_tva: 0, total_ttc: 0, total_remise: 0 });
  setShowDialog(false);
  fetchNextRef(); 
  setSelectedInvoiceId(null);
  router.replace('/invoices/create'); 
}



  function resetFormAndRedirect() {
    setShowDialog(false);
    router.push('/invoices');
  }

  return (
    <AuthLayout user={user}>
      <div className={styles.container}>
        <h1 className={styles.title}>{invoiceId ? 'Modifier la facture' : 'Créer une facture'}</h1>

        {isLoading ? (
          <div>Chargement...</div>
        ) : (
          <form onSubmit={handleSubmit} className={styles.form}>
          
            <div className={styles.rowThree}>
              <div className={styles.formGroup}>
                <label>Référence facture</label>
                <input type="text" value={form.ref_facture} disabled />
              </div>
              <div className={styles.formGroup}>
                <label>Numéro facture (optionnel)</label>
                <input
                  type="text"
                  value={form.invoice_number}
                  onChange={(e) => setForm({ ...form, invoice_number: e.target.value })}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Client</label>
                <select
                  value={form.client_id}
                  onChange={(e) => setForm({ ...form, client_id: e.target.value })}
                >
                  <option value="">-- Sélectionnez un client --</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className={styles.rowThree}>
              <div className={styles.formGroup}>
                <label>Projet</label>
                <select
                  value={form.project_id}
                  onChange={(e) => setForm({ ...form, project_id: e.target.value })}
                >
                  <option value="">-- Sélectionnez un projet --</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className={styles.formGroup}>
                <label>Date de création</label>
                <input
                  type="date"
                  value={form.issue_date}
                  onChange={(e) => setForm({ ...form, issue_date: e.target.value })}
                />
              </div>
              <div className={styles.formGroup}>
                <label>{`Date d'échéance`}</label>
                <input
                  type="date"
                  value={form.due_date}
                  onChange={(e) => setForm({ ...form, due_date: e.target.value })}
                />
              </div>
            </div>

            <div className={styles.rowThree}>
              <div className={styles.formGroup}>
                <label>Statut de paiement</label>
                <select
                  value={form.payment_status}
                  onChange={(e) => setForm({ ...form, payment_status: e.target.value })}
                >
                  <option value="impayé">Impayé</option>
                  <option value="payé">Payé</option>
                  <option value="partiel">Partiel</option>
                </select>
              </div>
              <div className={styles.formGroup}>
                <label>Méthode de paiement</label>
                <select
                  value={form.payment_method}
                  onChange={(e) => setForm({ ...form, payment_method: e.target.value })}
                >
                  <option value="">-- Sélectionnez --</option>
                  <option value="espèce">Espèce</option>
                  <option value="virement">Virement</option>
                  <option value="chèque">Chèque</option>
                </select>
              </div>
              <div className={styles.formGroup}>
                <label>Timbre</label>
                <input
                  type="number"
                  value={Number(form.timber)}
                  onChange={(e) => setForm({ ...form, timber: parseFloat(e.target.value) })}
                />
              </div>
            </div>

        
            <div className={styles.itemsTableWrapper}>
              <table className={styles.itemsTable}>
                <thead>
                  <tr>
                    <th style={{ width: '10px',backgroundColor:"#1B1366",color:"white" }}>RN</th>
                    <th style={{ width: '100px',backgroundColor:"#1B1366",color:"white" }}>Article</th>
                    <th style={{ width: '20px',backgroundColor:"#1B1366",color:"white" }} >Qté</th>
                    <th style={{ width: '50px',backgroundColor:"#1B1366",color:"white" }}>Prix HT</th>
                    <th style={{ width: '20px' ,backgroundColor:"#1B1366",color:"white"}}>Rem%</th>
                    <th style={{ width: '20px',backgroundColor:"#1B1366",color:"white" }} >TVA %</th>
                    <th style={{ width: '50px',backgroundColor:"#1B1366",color:"white" }} >Prix TTC</th>
                     <th style={{ width: '60px',backgroundColor:"#1B1366",color:"white" }}>Valeur TTC</th> 
                    <th style={{ width: '30px' ,backgroundColor:"#1B1366",color:"white"}}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {form.items.map((item, i) => (
                    <tr key={i}>
                      <td>{i + 1}</td>
                      <td >
                        <input type="text" value={item.article} onChange={(e) => handleItemChange(i, 'article', e.target.value)} />
                      </td>
                      <td>
                        <input style={{textAlign:"right"}} type="number" value={item.qte} onChange={(e) => handleItemChange(i, 'qte', e.target.value)} />
                      </td>
                      <td >
                        <input style={{textAlign:"right"}} type="number" value={item.prix_ht} onChange={(e) => handleItemChange(i, 'prix_ht', e.target.value)} />
                      </td>
                      <td style={{textAlign:"right"}}>
                        <input style={{textAlign:"right"}} type="number" value={item.remise} onChange={(e) => handleItemChange(i, 'remise', e.target.value)} />
                      </td>
                      <td style={{textAlign:"right"}}>
                        <input type="number" value={item.tva} onChange={(e) => handleItemChange(i, 'tva', e.target.value)} />
                      </td>
                      <td style={{textAlign:"right"}}>
                        <input style={{textAlign:"right"}} type="number" value={item.prix_ttc} onChange={(e) => handleItemChange(i, 'prix_ttc', e.target.value)} />
                      </td>
                       <td style={{textAlign:"right"}}>{parseFloat(item.prix_ttc*item.qte)}</td>
                      <td>
                       
                        <button type="button" className={styles.btnRemove} onClick={() => removeItem(i)}>❌</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <button type="button" className={styles.btnAdd} onClick={addItem}>+ Ajouter un article</button>
            </div>

         
            <div className={styles.totals}>
              <p>Total HT: {totals.total_ht.toFixed(3)} TND</p>
               <p>Total Remise: {totals.total_remise.toFixed(3)} TND</p>
              <p>Total TVA: {totals.total_tva.toFixed(3)} TND</p>
              <p>Timbre: {form.timber.toFixed(3)} TND</p>
              <p>Total TTC: {totals.total_ttc.toFixed(3)} TND</p>
            </div>

          
        <div className={styles.actions}>
  <button type="submit" className={styles.btnPrimary}>
    {invoiceId ? 'Mettre à jour' : 'Créer la facture'}
  </button>
</div>


<div className={styles.newInvoiceButton}>
  <button type="button" className={styles.btnSecondary} onClick={handleCreateNewInvoice}>
    Créer nouvelle facture
  </button>
</div>


          </form>
        )}
{showDialog && (
  <div className={styles.dialog}>
    <button 
      onClick={() => setShowDialog(false)} 
      className={styles.dialogClose}
      aria-label="Close"
    >
      ✖
    </button>
    <p className={styles.dialogText}>✅ Facture enregistrée avec succès</p>
    <div className={styles.dialogButtons}>
      <button onClick={() => router.push('/invoices')}>Voir la liste des factures</button>
      <button onClick={() => setPrintOpen(true)}>Imprimer</button>
    
    </div>
  </div>
  
)}
        <PrintInvoice invoiceId={selectedInvoiceId || invoiceId} open={printOpen} onClose={() => setPrintOpen(false)} />
      </div>
    </AuthLayout>
  );
}
