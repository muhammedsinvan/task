import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './UserModal.module.css';

const UserModal = ({ 
  isOpen, 
  onClose, 
  onSave, 
  apiErrors, 
  companyId, 
  token,
  mode = 'add', // 'add' or 'edit'
  userData = null, // For edit mode
  roles = [],
  designations = [],
  loadingRoles = false,
  loadingDesignations = false,
  rolesError = null,
  designationsError = null
}) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    title: '',
    initials: '',
    role: '',
    responsibilities: []
  });



  const [profileImage, setProfileImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageChanged, setImageChanged] = useState(false);

  // Initialize form with user data for edit mode
  useEffect(() => {
   if (mode === 'edit' && userData) {
    setFormData({
      name: userData.name || '',
      email: userData.email || '',
      phone: userData.phone === 'N/A' ? '' : (userData.phone || ''),
      title: userData.title === 'N/A' ? '' : (userData.title || ''),
      initials: userData.initials === 'N/A' ? '' : (userData.initials || ''),
      role: userData.role || '',
      responsibilities: userData.responsibilities || []
    });
      
      if (userData.profile_image_url && userData.profile_image_url.includes('storage/')) {
        setPreviewImage(userData.profile_image_url);
      }
    } else {
      // Reset form for add mode
      resetForm();
    }
  }, [mode, userData, isOpen]);

  // Initialize with API errors if provided
  useEffect(() => {
    if (apiErrors) {
      setFormErrors(apiErrors);
    }
  }, [apiErrors]);

  // Clear errors when modal closes
  useEffect(() => {
    if (!isOpen) {
      setFormErrors({});
    }
  }, [isOpen]);

  // Frontend validation rules
  const validateForm = () => {
    const errors = {};
    
    // Name validation
    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    } else if (formData.name.length < 2) {
      errors.name = 'Name must be at least 2 characters';
    }
    
    // Email validation
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    // Phone validation (optional but validate if provided)
    if (formData.phone && !/^[\d\s\-\+\(\)]+$/.test(formData.phone)) {
      errors.phone = 'Please enter a valid phone number';
    }
    
    // Initials validation
    if (formData.initials && formData.initials.length > 5) {
      errors.initials = 'Initials cannot exceed 5 characters';
    }
    
    // Role validation
    if (!formData.role) {
      errors.role = 'Role is required';
    } else if (!roles.some(r => r.id === formData.role)) {
      errors.role = 'Please select a valid role';
    }
    
    return errors;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Clear error for this field when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: null }));
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDesignationChange = (designationId) => {
    setFormData(prev => {
      const newResponsibilities = prev.responsibilities.includes(designationId)
        ? prev.responsibilities.filter(id => id !== designationId)
        : [...prev.responsibilities, designationId];
      
      return {
        ...prev,
        responsibilities: newResponsibilities
      };
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        setFormErrors(prev => ({
          ...prev,
          profile_image: 'File size must be less than 5MB'
        }));
        return;
      }
      
      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
      if (!validTypes.includes(file.type)) {
        setFormErrors(prev => ({
          ...prev,
          profile_image: 'Only JPG, PNG and GIF files are allowed'
        }));
        return;
      }
      
      setProfileImage(file);
      setImageChanged(true);
      setFormErrors(prev => ({ ...prev, profile_image: null }));
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setProfileImage(null);
    setPreviewImage(null);
    setImageChanged(true);
    setFormErrors(prev => ({ ...prev, profile_image: null }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Clear previous errors
    setFormErrors({});
    
    // Frontend validation
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setFormErrors(validationErrors);
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Prepare data for API
      const submitData = {
        ...formData,
        profile_image: imageChanged ? profileImage : null,
        overwite_data: mode === 'add' ? 1 : undefined,
        _method: mode === 'edit' ? 'put' : undefined
      };
      
      // For edit mode, add user ID
      if (mode === 'edit' && userData) {
        submitData.id = userData.id;
      }
      
      console.log(`${mode === 'add' ? 'Adding' : 'Updating'} user data:`, submitData);
      
      // Call API through parent handler
      if (onSave) {
        await onSave(submitData, mode);
      }
      
      // If successful, reset form and close
      resetForm();
      onClose();
    } catch (error) {
      console.error(`Error in ${mode} form submission:`, error);
      // Error handling will be done by parent component
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      title: '',
      initials: '',
      role: '',
      responsibilities: []
    });
    setProfileImage(null);
    setPreviewImage(null);
    setImageChanged(false);
    setFormErrors({});
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  // Get error message for a field
  const getFieldError = (fieldName) => {
    return formErrors[fieldName] || formErrors.errors?.[fieldName]?.[0];
  };

  // Check if field has error
  const hasError = (fieldName) => {
    return !!getFieldError(fieldName);
  };

  if (!isOpen) return null;

  const modalTitle = mode === 'add' ? 'Add new user' : 'Edit user';
  const submitButtonText = mode === 'add' ? 'Add new user' : 'Update user';

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContainer}>
        {/* Modal Header */}
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>{modalTitle}</h2>
          <button className={styles.closeButton} onClick={handleClose}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Modal Content */}
        <div className={styles.modalContent}>
          <form onSubmit={handleSubmit} noValidate>
            {/* Profile Image Upload with error */}
            <div className={styles.profileSection}>
              <div className={styles.profileImageContainer}>
                <div className={styles.profileImageWrapper}>
                  {previewImage ? (
                    <>
                      <img src={previewImage} alt="Profile Preview" className={styles.profilePreview} />
                      <button 
                        type="button" 
                        className={styles.removeImageButton}
                        onClick={handleRemoveImage}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M18 6L6 18M6 6l12 12" />
                        </svg>
                      </button>
                    </>
                  ) : (
                    <div className={styles.profilePlaceholder}>
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                    </div>
                  )}
                </div>
                
                <div className={styles.profileUploadControls}>
                  <input
                    type="file"
                    id="profileImage"
                    accept="image/jpeg,image/png,image/gif"
                    onChange={handleImageChange}
                    className={styles.fileInput}
                  />
                  <label htmlFor="profileImage" className={styles.uploadButton}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="17 8 12 3 7 8" />
                      <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                    {mode === 'add' ? 'Upload Photo' : 'Change Photo'}
                  </label>
                  <p className={styles.uploadHint}>JPG, PNG or GIF, Max 5MB</p>
                </div>
              </div>
              
              {/* Profile image error */}
              {hasError('profile_image') && (
                <div className={styles.fieldError}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  {getFieldError('profile_image')}
                </div>
              )}
            </div>

            {/* Name and Email */}
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  Name<span className={styles.required}>*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`${styles.formInput} ${hasError('name') ? styles.inputError : ''}`}
                  placeholder="Enter full name"
                />
                {hasError('name') && (
                  <div className={styles.fieldError}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    {getFieldError('name')}
                  </div>
                )}
              </div>
              
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  Email<span className={styles.required}>*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`${styles.formInput} ${hasError('email') ? styles.inputError : ''}`}
                  placeholder="Enter email address"
                />
                {hasError('email') && (
                  <div className={styles.fieldError}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    {getFieldError('email')}
                  </div>
                )}
              </div>
            </div>

            {/* Phone and Title */}
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className={`${styles.formInput} ${hasError('phone') ? styles.inputError : ''}`}
                  placeholder="Enter phone number"
                />
                {hasError('phone') && (
                  <div className={styles.fieldError}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    {getFieldError('phone')}
                  </div>
                )}
              </div>
              
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Title</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className={`${styles.formInput} ${hasError('title') ? styles.inputError : ''}`}
                  placeholder="Enter job title"
                />
                {hasError('title') && (
                  <div className={styles.fieldError}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    {getFieldError('title')}
                  </div>
                )}
              </div>
            </div>

            {/* Initials and Role */}
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Initials</label>
                <input
                  type="text"
                  name="initials"
                  value={formData.initials}
                  onChange={handleInputChange}
                  className={`${styles.formInput} ${hasError('initials') ? styles.inputError : ''}`}
                  placeholder="e.g., JD"
                  maxLength="5"
                />
                {hasError('initials') && (
                  <div className={styles.fieldError}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    {getFieldError('initials')}
                  </div>
                )}
              </div>
              
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  Role<span className={styles.required}>*</span>
                  {loadingRoles && (
                    <span className={styles.loadingText}>Loading...</span>
                  )}
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  className={`${styles.formSelect} ${hasError('role') ? styles.inputError : ''} ${loadingRoles ? styles.loadingSelect : ''}`}
                  disabled={loadingRoles}
                >
                  <option value="">{loadingRoles ? 'Loading roles...' : 'Select Role'}</option>
                  {roles.map((role, index) => (
                    <option key={index} value={role.id}>
                      {role.title}
                    </option>
                  ))}
                </select>
                {rolesError && !loadingRoles && (
                  <div className={styles.fieldWarning}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                      <line x1="12" y1="9" x2="12" y2="13" />
                      <line x1="12" y1="17" x2="12.01" y2="17" />
                    </svg>
                    {rolesError} (using default roles)
                  </div>
                )}
                {hasError('role') && (
                  <div className={styles.fieldError}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    {getFieldError('role')}
                  </div>
                )}
              </div>
            </div>

            {/* Designations */}
            <div className={styles.formSection}>
              <div className={styles.sectionHeader}>
                <label className={styles.sectionLabel}>Designation</label>
                {loadingDesignations && (
                  <span className={styles.loadingTextSmall}>Loading designations...</span>
                )}
              </div>
              
              {designationsError && !loadingDesignations && (
                <div className={styles.fieldWarning}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                    <line x1="12" y1="9" x2="12" y2="13" />
                    <line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                  {designationsError} (using default designations)
                </div>
              )}
              
              {designations.length > 0 ? (
                <div className={styles.designationGrid}>
                  {designations.map(designation => (
                    <div key={designation.id} className={styles.designationItem}>
                      <input
                        type="checkbox"
                        id={`designation-${designation.id}`}
                        checked={formData.responsibilities.includes(designation.id)}
                        onChange={() => handleDesignationChange(designation.id)}
                        className={styles.checkboxInput}
                        disabled={loadingDesignations}
                      />
                      <label 
                        htmlFor={`designation-${designation.id}`}
                        className={`${styles.checkboxLabel} ${loadingDesignations ? styles.disabledLabel : ''}`}
                      >
                        {designation.name}
                      </label>
                    </div>
                  ))}
                </div>
              ) : (
                <div className={styles.noDesignations}>
                  {loadingDesignations ? 'Loading designations...' : 'No designations available'}
                </div>
              )}
              
              {hasError('responsibilities') && (
                <div className={styles.fieldError}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  {getFieldError('responsibilities')}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className={styles.submitSection}>
              <button 
                type="submit" 
                className={styles.submitButton}
                disabled={isSubmitting || loadingRoles || loadingDesignations}
              >
                {isSubmitting ? (
                  <>
                    <span className={styles.spinner}></span>
                    {mode === 'add' ? 'Adding...' : 'Updating...'}
                  </>
                ) : loadingRoles || loadingDesignations ? (
                  <>
                    <span className={styles.spinner}></span>
                    Loading data...
                  </>
                ) : (
                  submitButtonText
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UserModal;