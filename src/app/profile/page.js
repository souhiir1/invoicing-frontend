'use client';
import { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { updateUser, logout } from '../redux/userSlice';
import { useRouter } from 'next/navigation';
import { FaUserCircle, FaArrowLeft, FaEdit, FaCheck, FaTimes, FaLock, FaCog } from 'react-icons/fa';
import styles from './page.module.css';
import Image from 'next/image';
import AuthLayout from '../components/AuthLayout';

export default function ProfilePage() {
  const user = useSelector((state) => state.user.user);
  const token = useSelector((state) => state.user.token);
  const dispatch = useDispatch();
  const router = useRouter();
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    tel: '',
    adresse: '',
    matricule_fiscal: '',
  });
  const [image, setImage] = useState(null);
  const [logo, setLogo] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [previewImage, setPreviewImage] = useState('');
  const [previewLogo, setPreviewLogo] = useState('');
  const fileInputRef = useRef(null);
  const logoInputRef = useRef(null);

  useEffect(() => {
    if (user) {
      setFormData({
        full_name: user.full_name || '',
        email: user.email || '',
        tel: user.tel || '',
        adresse: user.adresse || '',
        matricule_fiscal: user.matricule_fiscal || '',
      });
      if (user.image) setPreviewImage(`${baseUrl}${user.image}`);
      if (user.logo) setPreviewLogo(`${baseUrl}${user.logo}`);
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogo(file);
      setPreviewLogo(URL.createObjectURL(file));
    }
  };

  const triggerFileInput = () => fileInputRef.current?.click();
  const triggerLogoInput = () => logoInputRef.current?.click();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setShowConfirmation(false);

    try {
      const data = new FormData();
      for (const key in formData) {
        data.append(key, formData[key]);
      }

      if (image) data.append('image', image);
      if (logo) data.append('logo', logo);

      const res = await fetch(`${baseUrl}/api/users/profile`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: data,
      });

      const result = await res.json();
      if (result.success) {
        dispatch(updateUser(result.user));
        setSuccess('Profil mis à jour avec succès.');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(result.error || 'Échec de la mise à jour');
      }
    } catch (err) {
      console.error(err);
      setError('Erreur lors de la mise à jour');
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }

    try {
      const res = await fetch(`${baseUrl}/api/users/change-password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ newPassword }),
      });

      const result = await res.json();
      if (result.success) {
        setShowPasswordModal(false);
        setSuccess('Mot de passe mis à jour avec succès.');
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(result.error || 'Échec de la mise à jour du mot de passe');
      }
    } catch (err) {
      console.error(err);
      setError('Erreur lors de la mise à jour du mot de passe');
    }
  };

  const handleCancel = () => setShowConfirmation(false);
  const handlePasswordCancel = () => {
    setShowPasswordModal(false);
    setNewPassword('');
    setConfirmPassword('');
    setError('');
  };

  return (
    <AuthLayout user={user}>
      <div className={styles.wrapper}>
        <h2 className={styles.title}>Mon Profil</h2>

        <form onSubmit={(e) => { e.preventDefault(); setShowConfirmation(true); }} className={styles.form}>
          <div className={styles.avatarSection}>
            <div className={styles.avatarContainer}>
              {previewImage ? (
                <Image
                  src={previewImage}
                  alt="Profile"
                  width={120}
                  height={120}
                  className={styles.avatarImage}
                />
              ) : (
                <FaUserCircle className={styles.avatarPlaceholder} />
              )}
              <button type="button" className={styles.editAvatarButton} onClick={triggerFileInput}>
                <FaEdit />
              </button>
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleImageChange}
                className={styles.hiddenInput}
              />
            </div>

            <div className={styles.logoContainer}>
              <p className={styles.sectionLabel}>Logo:</p>
              <div className={styles.logoPreview}>
                {previewLogo ? (
                  <Image
                    src={previewLogo}
                    alt="Logo"
                    width={100}
                    height={100}
                    className={styles.logoImage}
                  />
                ) : (
                  <div className={styles.logoPlaceholder}>Choisir un logo</div>
                )}
                <button type="button" className={styles.editLogoButton} onClick={triggerLogoInput}>
                  <FaEdit />
                </button>
                <input
                  type="file"
                  ref={logoInputRef}
                  accept="image/*"
                  onChange={handleLogoChange}
                  className={styles.hiddenInput}
                />
              </div>
            </div>
          </div>

          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Nom complet</label>
              <input
                type="text"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                className={styles.input}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={styles.input}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Plan</label>
              <input
                type="text"
                name="plan"
                value={user?.plan || ''}
                className={`${styles.input} ${styles.disabledInput}`}
                disabled
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Téléphone</label>
              <input
                type="text"
                name="tel"
                value={formData.tel}
                onChange={handleChange}
                className={styles.input}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Adresse</label>
              <input
                type="text"
                name="adresse"
                value={formData.adresse}
                onChange={handleChange}
                className={styles.input}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Matricule fiscale</label>
              <input
                type="text"
                name="matricule_fiscal"
                value={formData.matricule_fiscal}
                onChange={handleChange}
                className={styles.input}
              />
            </div>
          </div>

          <div className={styles.passwordSection}>
            <div className={styles.passwordHeader}>
              <h3 className={styles.sectionTitle}>Mot de passe</h3>
              <button
                type="button"
                className={styles.passwordEditButton}
                onClick={() => setShowPasswordModal(true)}
              >
                <FaLock /> <FaCog /> Modifier
              </button>
            </div>
            <input
              type="password"
              value="********"
              className={`${styles.input} ${styles.disabledInput}`}
              disabled
            />
          </div>

          {error && <div className={styles.error}>{error}</div>}
          {success && <div className={styles.success}>{success}</div>}

          <div className={styles.buttonGroup}>
            <button type="submit" className={styles.saveButton}>
              Sauvegarder
            </button>
          </div>
        </form>

        {showConfirmation && (
          <div className={styles.confirmationModal}>
            <div className={styles.modalContent}>
              <h3>Confirmer les modifications</h3>
              <p>{`Êtes-vous sûr de vouloir enregistrer ces modifications ?`}</p>
              <div className={styles.modalButtons}>
                <button
                  type="button"
                  className={styles.modalCancelButton}
                  onClick={handleCancel}
                >
                  <FaTimes /> Annuler
                </button>
                <button
                  type="button"
                  className={styles.modalConfirmButton}
                  onClick={handleSubmit}
                >
                  <FaCheck /> Confirmer
                </button>
              </div>
            </div>
          </div>
        )}

        {showPasswordModal && (
          <div className={styles.confirmationModal}>
            <div className={styles.modalContent}>
              <h3>Modifier le mot de passe</h3>

              <div className={styles.formGroup}>
                <label className={styles.label}>Nouveau mot de passe</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className={styles.input}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Confirmer le mot de passe</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={styles.input}
                />
              </div>

              {error && <div className={styles.error}>{error}</div>}

              <div className={styles.modalButtons}>
                <button
                  type="button"
                  className={styles.modalCancelButton}
                  onClick={handlePasswordCancel}
                >
                  <FaTimes /> Annuler
                </button>
                <button
                  type="button"
                  className={styles.modalConfirmButton}
                  onClick={handlePasswordSubmit}
                >
                  <FaCheck /> Enregistrer
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AuthLayout>
  );
}
