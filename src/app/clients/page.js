'use client';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import {
  FiPlus,
  FiEdit,
  FiTrash,
  FiEye,
  FiX,
  FiChevronDown,
  FiUsers,
  FiMail,
  FiPhone,
  FiMapPin,
  FiDollarSign,
  FiFileText,
  FiBriefcase,
  FiAlertTriangle,
} from 'react-icons/fi';
import styles from './page.module.css';
import AuthLayout from '../components/AuthLayout';

export default function ClientsPage() {
  const token = useSelector((state) => state.user.token);
  const user = useSelector(state => state.user.user);
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [viewData, setViewData] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const [deleteError, setDeleteError] = useState('');
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const fetchClients = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${baseUrl}/api/clients/with-meta`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setClients(data);
      }
    } catch (error) {
      console.error('Error fetching clients:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    fetchClients(); 
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const clientData = Object.fromEntries(formData.entries());

    if (!clientData.name || clientData.name.trim() === '') {
      setErrors({ name: 'Le nom du client est requis' });
      return;
    } else {
      setErrors({});
    }

    const method = selectedClient ? 'PUT' : 'POST';
    const url = selectedClient
      ? `${baseUrl}/api/clients/${selectedClient.id}`
      : `${baseUrl}/api/clients`;

    const res = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(clientData),
    });

    if (!res.ok) {
      const errorData = await res.json();
      console.log('Error saving client:', errorData);
      return;
    }

    setModalOpen(false);
    fetchClients();
  };

  const handleDelete = async () => {
    try {
      setDeleteError('');
      const res = await fetch(`${baseUrl}/api/clients/${selectedClient.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        if (errorData.error && errorData.error.includes('projets') || errorData.error.includes('factures')) {
          setDeleteError(errorData.error);
          return;
        }
        alert(errorData.error || 'Erreur lors de la suppression');
        return;
      }
      
      setConfirmOpen(false);
      fetchClients();
    } catch (err) {
      console.error(err);
      alert('Erreur lors de la suppression');
    }
  };

  const handleDeleteClick = (client) => {
    setSelectedClient(client);
    setDeleteError('');
    setConfirmOpen(true);
  };

  const handleViewClick = async (client) => {
    try {
    
      const res = await fetch(`${baseUrl}/api/clients/${client.id}/details`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (res.ok) {
        const detailedData = await res.json();
        setViewData(detailedData);
      } else {
        
        setViewData(client);
      }
      setViewOpen(true);
    } catch (error) {
      console.error('Error fetching client details:', error);
      setViewData(client);
      setViewOpen(true);
    }
  };

  return (
    <AuthLayout user={user}>
      <div className={styles.container}>
        <header className={styles.header}>
          <div className={styles.headerContent}>
            <h1 className={styles.title}>
              <FiUsers className={styles.titleIcon} /> 
              Mes Clients
            </h1>
            <p className={styles.subtitle}>
              Gérez vos clients et leurs informations
            </p>
          </div>
          <button
            className={styles.btnPrimary}
            onClick={() => {
              setSelectedClient(null);
              setModalOpen(true);
            }}
          >
            <FiPlus className={styles.btnIcon} />
            Nouveau Client
          </button>
        </header>

    
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statValue}>{clients.length}</div>
            <div className={styles.statLabel}>Total Clients</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statValue}>
              {clients.filter(c => c.facture_count > 0).length}
            </div>
            <div className={styles.statLabel}>Avec Factures</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statValue}>
              {clients.filter(c => c.project_count > 0).length}
            </div>
            <div className={styles.statLabel}>Avec Projets</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statValue}>
              {clients.reduce((sum, c) => sum + (parseFloat(c.solde) || 0), 0).toFixed(3)} TND
            </div>
            <div className={styles.statLabel}>Solde Total</div>
          </div>
        </div>

        <div className={styles.content}>
          {loading ? (
            <div className={styles.loading}>
              <div className={styles.spinner}></div>
              Chargement des clients...
            </div>
          ) : clients.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>👥</div>
              <h3>Aucun client trouvé</h3>
              <p>Ajoutez votre premier client pour commencer</p>
              <button
                className={styles.btnPrimary}
                onClick={() => setModalOpen(true)}
              >
                <FiPlus className={styles.btnIcon} />
                Ajouter un client
              </button>
            </div>
          ) : (
            <>
            
              <div className={styles.tableContainer}>
                <table className={styles.desktopTable}>
                  <thead>
                    <tr>
                      <th>Client</th>
                      <th>Coordonnées</th>
                      <th>Informations</th>
                      <th>Activité</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clients.map((client) => (
                      <tr key={client.id} className={styles.tableRow}>
                        <td className={styles.clientCell}>
                          <div className={styles.clientName}>
                            {client.name}
                          </div>
                          {client.company && (
                            <div className={styles.clientCompany}>
                              {client.company}
                            </div>
                          )}
                          <div className={styles.clientMF}>
                            MF: {client.matricule_fiscale || 'Non renseigné'}
                          </div>
                        </td>
                        <td>
                          <div className={styles.contactInfo}>
                            {client.email && (
                              <div className={styles.contactRow}>
                                <FiMail className={styles.infoIcon} />
                                {client.email}
                              </div>
                            )}
                            {client.phone && (
                              <div className={styles.contactRow}>
                                <FiPhone className={styles.infoIcon} />
                                {client.phone}
                              </div>
                            )}
                            {client.address && (
                              <div className={styles.contactRow}>
                                <FiMapPin className={styles.infoIcon} />
                                <span className={styles.address}>{client.address}</span>
                              </div>
                            )}
                          </div>
                        </td>
                        <td>
                          <div className={styles.financialInfo}>
                            <div className={styles.solde}>
                              <FiDollarSign className={styles.infoIcon} />
                              Solde: {client.solde || '0'} TND
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className={styles.activityInfo}>
                            <div className={styles.activityItem}>
                              <FiFileText className={styles.activityIcon} />
                              <span>{client.facture_count || 0} facture(s)</span>
                            </div>
                            <div className={styles.activityItem}>
                              <FiBriefcase className={styles.activityIcon} />
                              <span>{client.project_count || 0} projet(s)</span>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className={styles.actionButtons}>
                            <button
                              onClick={() => handleViewClick(client)}
                              className={styles.iconBtn}
                              title="Voir détails"
                            >
                              <FiEye />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedClient(client);
                                setModalOpen(true);
                              }}
                              className={styles.iconBtn}
                              title="Modifier"
                            >
                              <FiEdit />
                            </button>
                            <button
                              onClick={() => handleDeleteClick(client)}
                              className={`${styles.iconBtn} ${styles.deleteBtn}`}
                              title="Supprimer"
                            >
                              <FiTrash />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className={styles.mobileList}>
                {clients.map((client) => (
                  <div key={client.id} className={styles.mobileCard}>
                    <div className={styles.cardHeader}>
                      <div className={styles.cardTitle}>
                        <h3>{client.name}</h3>
                        {client.company && (
                          <div className={styles.company}>{client.company}</div>
                        )}
                      </div>
                      <div className={styles.solde}>
                        {client.solde || '0'} TND
                      </div>
                    </div>
                    
                    <div className={styles.cardContent}>
                      <div className={styles.cardRow}>
                        <FiMail className={styles.cardIcon} />
                        <span>{client.email || 'Non renseigné'}</span>
                      </div>
                      <div className={styles.cardRow}>
                        <FiPhone className={styles.cardIcon} />
                        <span>{client.phone || 'Non renseigné'}</span>
                      </div>
                      {client.matricule_fiscale && (
                        <div className={styles.cardRow}>
                          <span className={styles.mfLabel}>MF: {client.matricule_fiscale}</span>
                        </div>
                      )}
                      <div className={styles.activityRow}>
                        <div className={styles.activityBadge}>
                          <FiFileText /> {client.facture_count || 0}
                        </div>
                        <div className={styles.activityBadge}>
                          <FiBriefcase /> {client.project_count || 0}
                        </div>
                      </div>
                    </div>

                    <div className={styles.cardActions}>
                      <button
                        onClick={() => handleViewClick(client)}
                        className={styles.mobileBtn}
                      >
                        <FiEye /> Détails
                      </button>
                      <button
                        onClick={() => {
                          setSelectedClient(client);
                          setModalOpen(true);
                        }}
                        className={styles.mobileBtn}
                      >
                        <FiEdit /> Modifier
                      </button>
                      <button
                        onClick={() => handleDeleteClick(client)}
                        className={`${styles.mobileBtn} ${styles.mobileDelete}`}
                      >
                        <FiTrash /> Supprimer
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {modalOpen && (
          <div className={styles.modalOverlay}>
            <div className={styles.modal}>
              <div className={styles.modalHeader}>
                <h3>{selectedClient ? 'Modifier le Client' : 'Nouveau Client'}</h3>
                <button 
                  onClick={() => setModalOpen(false)}
                  className={styles.closeBtn}
                >
                  <FiX />
                </button>
              </div>
              <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label>Nom du client *</label>
                    <input
                      type="text"
                      name="name"
                      defaultValue={selectedClient?.name || ''}
                      className={errors.name ? styles.errorInput : ''}
                      placeholder="Nom complet"
                    />
                    {errors.name && <span className={styles.errorText}>{errors.name}</span>}
                  </div>

                  <div className={styles.formGroup}>
                    <label>Entreprise</label>
                    <input 
                      type="text" 
                      name="company" 
                      defaultValue={selectedClient?.company || ''} 
                      placeholder="Nom de l'entreprise"
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Email</label>
                    <input 
                      type="email" 
                      name="email" 
                      defaultValue={selectedClient?.email || ''} 
                      placeholder="email@exemple.com"
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Téléphone</label>
                    <input 
                      type="text" 
                      name="phone" 
                      defaultValue={selectedClient?.phone || ''} 
                      placeholder="+216 XX XXX XXX"
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Matricule Fiscal</label>
                    <input 
                      type="text" 
                      name="matricule_fiscale" 
                      defaultValue={selectedClient?.matricule_fiscale || ''} 
                      placeholder="Numéro de matricule fiscal"
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Solde initial (TND)</label>
                    <input 
                      type="number" 
                      name="solde_ini" 
                      defaultValue={selectedClient?.solde_ini || 0} 
                      step="0.001"
                      placeholder="0.000"
                    />
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label>Adresse</label>
                  <input 
                    type="text" 
                    name="address" 
                    defaultValue={selectedClient?.address || ''} 
                    placeholder="Adresse complète"
                  />
                </div>

                <div className={styles.modalActions}>
                  <button 
                    type="button" 
                    onClick={() => setModalOpen(false)}
                    className={styles.btnSecondary}
                  >
                    Annuler
                  </button>
                  <button type="submit" className={styles.btnPrimary}>
                    {selectedClient ? 'Mettre à jour' : 'Créer le client'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

     
        {confirmOpen && (
          <div className={styles.modalOverlay}>
            <div className={styles.modal}>
              <div className={styles.modalHeader}>
                <h3>Confirmer la suppression</h3>
                <button 
                  onClick={() => {
                    setConfirmOpen(false);
                    setDeleteError('');
                  }}
                  className={styles.closeBtn}
                >
                  <FiX />
                </button>
              </div>
              <div className={styles.confirmContent}>
                {deleteError ? (
                  <div className={styles.errorAlert}>
                    <FiAlertTriangle className={styles.alertIcon} />
                    <div>
                      <strong>Impossible de supprimer</strong>
                      <p>{deleteError}</p>
                    </div>
                  </div>
                ) : (
                  <>
                    <p>Êtes-vous sûr de vouloir supprimer le client <strong>"{selectedClient?.name}"</strong> ?</p>
                    <p className={styles.warningText}>Cette action est irréversible.</p>
                  </>
                )}
              </div>
              <div className={styles.modalActions}>
                {deleteError ? (
                  <button 
                    type="button" 
                    onClick={() => {
                      setConfirmOpen(false);
                      setDeleteError('');
                    }}
                    className={styles.btnSecondary}
                  >
                    Fermer
                  </button>
                ) : (
                  <>
                    <button 
                      type="button" 
                      onClick={() => {
                        setConfirmOpen(false);
                        setDeleteError('');
                      }}
                      className={styles.btnSecondary}
                    >
                      Annuler
                    </button>
                    <button 
                      type="button" 
                      onClick={handleDelete}
                      className={styles.btnDanger}
                    >
                      Supprimer
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

     
        {viewOpen && viewData && (
          <div className={styles.modalOverlay}>
            <div className={styles.modal}>
              <div className={styles.modalHeader}>
                <h3>Détails du Client</h3>
                <button 
                  onClick={() => setViewOpen(false)}
                  className={styles.closeBtn}
                >
                  <FiX />
                </button>
              </div>
              <div className={styles.details}>
                <div className={styles.detailSection}>
                  <h4>Informations générales</h4>
                  <div className={styles.detailGrid}>
                    <div className={styles.detailItem}>
                      <strong>Nom:</strong>
                      <span>{viewData.name}</span>
                    </div>
                    {viewData.company && (
                      <div className={styles.detailItem}>
                        <strong>Entreprise:</strong>
                        <span>{viewData.company}</span>
                      </div>
                    )}
                    <div className={styles.detailItem}>
                      <strong>Matricule Fiscal:</strong>
                      <span>{viewData.matricule_fiscale || 'Non renseigné'}</span>
                    </div>
                    <div className={styles.detailItem}>
                      <strong>Solde:</strong>
                      <span>{viewData.solde || '0'} TND</span>
                    </div>
                  </div>
                </div>

                <div className={styles.detailSection}>
                  <h4>Coordonnées</h4>
                  <div className={styles.detailGrid}>
                    {viewData.email && (
                      <div className={styles.detailItem}>
                        <strong>Email:</strong>
                        <span>{viewData.email}</span>
                      </div>
                    )}
                    {viewData.phone && (
                      <div className={styles.detailItem}>
                        <strong>Téléphone:</strong>
                        <span>{viewData.phone}</span>
                      </div>
                    )}
                    {viewData.address && (
                      <div className={styles.detailItem}>
                        <strong>Adresse:</strong>
                        <span>{viewData.address}</span>
                      </div>
                    )}
                  </div>
                </div>

                {(viewData.factures && viewData.factures.length > 0) && (
                  <div className={styles.detailSection}>
                    <h4>Factures ({viewData.facture_count || 0})</h4>
                    <div className={styles.itemsList}>
                      {viewData.factures.map((facture, index) => (
                        <div key={index} className={styles.listItem}>
                          {facture.ref_facture}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {(viewData.projects && viewData.projects.length > 0) && (
                  <div className={styles.detailSection}>
                    <h4>Projets ({viewData.project_count || 0})</h4>
                    <div className={styles.itemsList}>
                      {viewData.projects.map((project, index) => (
                        <div key={index} className={styles.listItem}>
                          {project.name}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {(!viewData.factures || viewData.factures.length === 0) && 
                 (!viewData.projects || viewData.projects.length === 0) && (
                  <div className={styles.detailSection}>
                    <h4>Activité</h4>
                    <div className={styles.noActivity}>
                      <p>Aucune facture ou projet associé à ce client.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </AuthLayout>
  );
}