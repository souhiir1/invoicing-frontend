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
  FiFileText,
  FiCalendar,
  FiUser,
  FiDollarSign,
  FiTag,
  FiMessageSquare,
  FiAlertTriangle,
} from 'react-icons/fi';
import styles from './page.module.css';
import AuthLayout from '../components/AuthLayout';

export default function ProjectsPage() {
  const token = useSelector((state) => state.user.token);
  const user = useSelector((state) => state.user.user);
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;

  const [projects, setProjects] = useState([]);
  const [clients, setClients] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [viewData, setViewData] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [errors, setErrors] = useState({});
  const [amount, setAmount] = useState('');
  const [remise, setRemise] = useState('0');
  const [finalAmount, setFinalAmount] = useState('');
  const [clientId, setClientId] = useState(selectedProject?.client_id || '');
  const [clientSearch, setClientSearch] = useState('');
  const [filteredClients, setFilteredClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteError, setDeleteError] = useState('');

  const handleClientSelect = (client) => {
    setClientSearch(client.name);
    setClientId(client.id);
    setFilteredClients([]);
  };

  useEffect(() => {
    const amt = parseFloat(amount) || 0;
    const discount = parseFloat(remise) || 0;
    if (!isNaN(amt) && !isNaN(discount)) {
      const calc = amt - (amt * discount) / 100;
      setFinalAmount(calc.toFixed(2));
    }
  }, [amount, remise]);

  const fetchClients = async () => {
    try {
      const res = await fetch(`${baseUrl}/api/clients`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setClients(data);
    } catch (error) {
      console.error('Error fetching clients:', error);
    }
  };

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${baseUrl}/api/projects`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setProjects(data);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
    fetchProjects();
  }, []);

  const handleStatutChange = async (projectId, newStatut) => {
    try {
      await fetch(`${baseUrl}/api/projects/${projectId}/statut`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ statut: newStatut }),
      });
      fetchProjects();
    } catch (err) {
      console.error('Erreur mise à jour statut:', err);
    }
  };

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const projectData = Object.fromEntries(formData.entries());

    if (!projectData.name || projectData.name.trim() === '') {
      setErrors({ name: 'Le nom du projet est requis' });
      return;
    }
    if (!projectData.client_id) {
      setErrors({ client_id: 'Le client est requis' });
      return;
    }

    setErrors({});

    const method = selectedProject ? 'PUT' : 'POST';
    const url = selectedProject
      ? `${baseUrl}/api/projects/${selectedProject.id}`
      : `${baseUrl}/api/projects`;

    const res = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name: projectData.name,
        client_id: parseInt(projectData.client_id, 10),
        description: projectData.description || '',
        start_date: projectData.start_date || null,
        end_date: projectData.end_date || null,
        amount: parseFloat(projectData.amount) || 0,
        remise: parseFloat(projectData.remise) || 0,
        final_amount: parseFloat(projectData.final_amount) || 0,
        statut: projectData.statut || 'à faire',
        commentaire: projectData.commentaire || '',
      }),
    });

    if (!res.ok) {
      const errorData = await res.json();
      console.error('Erreur sauvegarde projet:', errorData);
      return;
    }

    setModalOpen(false);
    setClientSearch('');
    setAmount('');
    setRemise('0');
    setFinalAmount('');
    fetchProjects();
  };

  const getStatutClass = (statut) => {
    switch (statut?.toLowerCase()) {
      case 'à faire':
        return `${styles.statut} ${styles.afaire}`;
      case 'en cours':
        return `${styles.statut} ${styles.encours}`;
      case 'achevé':
        return `${styles.statut} ${styles.acheve}`;
      case 'annulé':
        return `${styles.statut} ${styles.annule}`;
      case 'bloqué':
        return `${styles.statut} ${styles.bloque}`;
      default:
        return styles.statut;
    }
  };

  const handleDelete = async () => {
    try {
      setDeleteError('');
      const res = await fetch(`${baseUrl}/api/projects/${selectedProject.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        if (errorData.error && errorData.error.includes('facture')) {
          setDeleteError(errorData.error);
          return;
        }
        alert(errorData.error || 'Erreur lors de la suppression');
        return;
      }
      
      setConfirmOpen(false);
      fetchProjects();
    } catch (err) {
      console.error(err);
      alert('Erreur lors de la suppression');
    }
  };

  const handleDeleteClick = (project) => {
    setSelectedProject(project);
    setDeleteError('');
    setConfirmOpen(true);
  };

  const handleEyeClick = (project) => {
    setViewData(project);
    setViewOpen(true);
  };

  useEffect(() => {
    if (!clientSearch) {
      setFilteredClients([]);
      return;
    }
    const filtered = clients.filter((c) =>
      c.name.toLowerCase().includes(clientSearch.toLowerCase())
    );
    setFilteredClients(filtered);
  }, [clientSearch, clients]);

  const StatutBadge = ({ statut }) => (
    <span className={getStatutClass(statut)}>{statut}</span>
  );

  return (
    <AuthLayout user={user}>
      <div className={styles.container}>
        <header className={styles.header}>
          <div className={styles.headerContent}>
            <h1 className={styles.title}>
              <FiFileText className={styles.titleIcon} /> 
              Mes Projets
            </h1>
            <p className={styles.subtitle}>
              Gérez et suivez l'avancement de vos projets
            </p>
          </div>
          <button
            className={styles.btnPrimary}
            onClick={() => {
              setSelectedProject(null);
              setClientSearch('');
              setAmount('');
              setRemise('0');
              setFinalAmount('');
              setModalOpen(true);
            }}
          >
            <FiPlus className={styles.btnIcon} />
            Nouveau Projet
          </button>
        </header>

        {/* Stats Summary */}
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statValue}>{projects.length}</div>
            <div className={styles.statLabel}>Total Projets</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statValue}>
              {projects.filter(p => p.statut?.toLowerCase() === 'en cours').length}
            </div>
            <div className={styles.statLabel}>En Cours</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statValue}>
              {projects.filter(p => p.statut?.toLowerCase() === 'achevé').length}
            </div>
            <div className={styles.statLabel}>Achevés</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statValue}>
              {projects.reduce((sum, p) => sum + (parseFloat(p.final_amount) || 0), 0).toFixed(3)} TND
            </div>
            <div className={styles.statLabel}>Valeur Totale</div>
          </div>
        </div>

        {/* Projects List */}
        <div className={styles.content}>
          {loading ? (
            <div className={styles.loading}>
              <div className={styles.spinner}></div>
              Chargement des projets...
            </div>
          ) : projects.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>📁</div>
              <h3>Aucun projet trouvé</h3>
              <p>Créez votre premier projet pour commencer</p>
              <button
                className={styles.btnPrimary}
                onClick={() => setModalOpen(true)}
              >
                <FiPlus className={styles.btnIcon} />
                Créer un projet
              </button>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className={styles.tableContainer}>
                <table className={styles.desktopTable}>
                  <thead>
                    <tr>
                      <th>Projet</th>
                      <th>Client</th>
                      <th>Période</th>
                      <th>Prix</th>
                      <th>Statut</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {projects.map((project) => (
                      <tr key={project.id} className={styles.tableRow}>
                        <td className={styles.projectCell}>
                          <div className={styles.projectName}>
                            {project.name}
                          </div>
                          {project.description && (
                            <div className={styles.projectDescription}>
                              {project.description}
                            </div>
                          )}
                        </td>
                        <td>
                          <div className={styles.clientInfo}>
                            <FiUser className={styles.infoIcon} />
                            {clients.find((c) => c.id === project.client_id)?.name || '-'}
                          </div>
                        </td>
                        <td>
                          <div className={styles.dateInfo}>
                            <div className={styles.dateRow}>
                              <FiCalendar className={styles.infoIcon} />
                              {project.start_date?.slice(0, 10) || '-'}
                            </div>
                            {project.end_date && (
                              <div className={styles.dateRow}>
                                <FiCalendar className={styles.infoIcon} />
                                {project.end_date?.slice(0, 10)}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className={styles.amountCell}>
                          <div className={styles.amountInfo}>
                            <FiDollarSign className={styles.infoIcon} />
                            {project.final_amount || '0'} TND
                          </div>
                        </td>
                        <td>
                          <select
                            value={project.statut || 'à faire'}
                            onChange={(e) => handleStatutChange(project.id, e.target.value)}
                            className={`${styles.statutSelect} ${getStatutClass(project.statut)}`}
                          >
                            <option value="à faire">À faire</option>
                            <option value="en cours">En cours</option>
                            <option value="achevé">Achevé</option>
                            <option value="annulé">Annulé</option>
                            <option value="bloqué">Bloqué</option>
                          </select>
                        </td>
                        <td>
                          <div className={styles.actionButtons}>
                            <button
                              onClick={() => handleEyeClick(project)}
                              className={styles.iconBtn}
                              title="Voir détails"
                            >
                              <FiEye />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedProject(project);
                                setClientSearch(
                                  clients.find((c) => c.id === project.client_id)?.name || ''
                                );
                                setAmount(project.amount || '');
                                setRemise(project.remise || '0');
                                setFinalAmount(project.final_amount || '');
                                setModalOpen(true);
                              }}
                              className={styles.iconBtn}
                              title="Modifier"
                            >
                              <FiEdit />
                            </button>
                            <button
                              onClick={() => handleDeleteClick(project)}
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
                {projects.map((project) => (
                  <div key={project.id} className={styles.mobileCard}>
                    <div className={styles.cardHeader}>
                      <div className={styles.cardTitle}>
                        <h3>{project.name}</h3>
                        <StatutBadge statut={project.statut} />
                      </div>
                      <div className={styles.amount}>
                        {project.final_amount || '0'} TND
                      </div>
                    </div>
                    
                    <div className={styles.cardContent}>
                      <div className={styles.cardRow}>
                        <FiUser className={styles.cardIcon} />
                        <span>{clients.find((c) => c.id === project.client_id)?.name || '-'}</span>
                      </div>
                      <div className={styles.cardRow}>
                        <FiCalendar className={styles.cardIcon} />
                        <span>{project.start_date?.slice(0, 10) || 'Non définie'}</span>
                      </div>
                      {project.description && (
                        <div className={styles.cardRow}>
                          <FiMessageSquare className={styles.cardIcon} />
                          <span className={styles.description}>{project.description}</span>
                        </div>
                      )}
                    </div>

                    <div className={styles.cardActions}>
                      <button
                        onClick={() => handleEyeClick(project)}
                        className={styles.mobileBtn}
                      >
                        <FiEye /> Détails
                      </button>
                      <button
                        onClick={() => {
                          setSelectedProject(project);
                          setClientSearch(
                            clients.find((c) => c.id === project.client_id)?.name || ''
                          );
                          setAmount(project.amount || '');
                          setRemise(project.remise || '0');
                          setFinalAmount(project.final_amount || '');
                          setModalOpen(true);
                        }}
                        className={styles.mobileBtn}
                      >
                        <FiEdit /> Modifier
                      </button>
                      <button
                        onClick={() => handleDeleteClick(project)}
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

        {/* Project Form Modal */}
        {modalOpen && (
          <div className={styles.modalOverlay}>
            <div className={styles.modal}>
              <div className={styles.modalHeader}>
                <h3>{selectedProject ? 'Modifier le Projet' : 'Nouveau Projet'}</h3>
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
                    <label>Nom du projet *</label>
                    <input
                      type="text"
                      name="name"
                      defaultValue={selectedProject?.name || ''}
                      className={errors.name ? styles.errorInput : ''}
                      placeholder="Nom du projet"
                    />
                    {errors.name && <span className={styles.errorText}>{errors.name}</span>}
                  </div>

                  <div className={styles.formGroup}>
                    <label>Client *</label>
                    <div className={styles.autocompleteWrapper}>
                      <input
                        type="text"
                        value={clientSearch}
                        onChange={(e) => setClientSearch(e.target.value)}
                        className={errors.client_id ? styles.errorInput : ''}
                        placeholder="Rechercher un client..."
                      />
                      <input type="hidden" name="client_id" value={clientId} />
                      {errors.client_id && (
                        <span className={styles.errorText}>{errors.client_id}</span>
                      )}
                      {filteredClients.length > 0 && (
                        <ul className={styles.autocompleteList}>
                          {filteredClients.map((c) => (
                            <li key={c.id} onClick={() => handleClientSelect(c)}>
                              {c.name}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <label>Date de début</label>
                    <input
                      type="date"
                      name="start_date"
                      defaultValue={selectedProject?.start_date?.slice(0, 10) || ''}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Date de fin</label>
                    <input
                      type="date"
                      name="end_date"
                      defaultValue={selectedProject?.end_date?.slice(0, 10) || ''}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Montant (TND)</label>
                    <input
                      type="number"
                      name="amount"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.000"
                      step="0.001"
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Remise (%)</label>
                    <input
                      type="number"
                      name="remise"
                      value={remise}
                      onChange={(e) => setRemise(e.target.value)}
                      placeholder="0"
                      min="0"
                      max="100"
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Prix Final (TND)</label>
                    <input
                      type="number"
                      name="final_amount"
                      value={finalAmount}
                      readOnly
                      className={styles.readonlyInput}
                    />
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label>Description</label>
                  <textarea
                    name="description"
                    defaultValue={selectedProject?.description || ''}
                    rows={3}
                    placeholder="Description du projet..."
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Commentaire</label>
                  <textarea
                    name="commentaire"
                    defaultValue={selectedProject?.commentaire || ''}
                    rows={2}
                    placeholder="Commentaires supplémentaires..."
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
                    {selectedProject ? 'Mettre à jour' : 'Créer le projet'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
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
                    <p>Êtes-vous sûr de vouloir supprimer le projet <strong>"{selectedProject?.name}"</strong> ?</p>
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

        {/* Project Details Modal */}
        {viewOpen && viewData && (
          <div className={styles.modalOverlay}>
            <div className={styles.modal}>
              <div className={styles.modalHeader}>
                <h3>Détails du Projet</h3>
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
                    <div className={styles.detailItem}>
                      <strong>Client:</strong>
                      <span>{clients.find((c) => c.id === viewData.client_id)?.name || '-'}</span>
                    </div>
                    <div className={styles.detailItem}>
                      <strong>Statut:</strong>
                      <StatutBadge statut={viewData.statut} />
                    </div>
                    <div className={styles.detailItem}>
                      <strong>Prix final:</strong>
                      <span>{viewData.final_amount || '0'} TND</span>
                    </div>
                  </div>
                </div>

                <div className={styles.detailSection}>
                  <h4>Dates</h4>
                  <div className={styles.detailGrid}>
                    <div className={styles.detailItem}>
                      <strong>Début:</strong>
                      <span>{viewData.start_date?.slice(0, 10) || 'Non définie'}</span>
                    </div>
                    <div className={styles.detailItem}>
                      <strong>Fin:</strong>
                      <span>{viewData.end_date?.slice(0, 10) || 'Non définie'}</span>
                    </div>
                  </div>
                </div>

                {viewData.description && (
                  <div className={styles.detailSection}>
                    <h4>Description</h4>
                    <p>{viewData.description}</p>
                  </div>
                )}

                {viewData.commentaire && (
                  <div className={styles.detailSection}>
                    <h4>Commentaire</h4>
                    <p>{viewData.commentaire}</p>
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