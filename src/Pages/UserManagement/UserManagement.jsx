import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import styles from './UserManagement.module.css';
import UserModal from '../../Components/AddUserModal/UserModal';

const ITEMS_PER_PAGE = 10;

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState('add');
  const [selectedUser, setSelectedUser] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [roles, setRoles] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [apiErrors, setApiErrors] = useState(null);
  const [loadingRoles, setLoadingRoles] = useState(false);
  const [loadingDesignations, setLoadingDesignations] = useState(false);
  const [rolesError, setRolesError] = useState(null);
  const [designationsError, setDesignationsError] = useState(null);
  const [sortConfig, setSortConfig] = useState({
    key: 'first_name',
    direction: 'asc'
  });
  const [companyId, setCompanyId] = useState('01kfashbm81jr195yza9wfhsna'); 
  const [token, setToken] = useState(''); 

    const handleAddUser = () => {
    setModalMode('add');
    setSelectedUser(null);
    setApiErrors(null);
    fetchRolesAndDesignations();
    setIsModalOpen(true);
  };

  const handleEditUser = (userId) => {
    setModalMode('edit');
    setApiErrors(null);
    
    // Find the user from your users list
    const userToEdit = users.find(user => user.id === userId);
    console.log("edti")
    console.log(userToEdit)
    console.log("edti")

    if (userToEdit) {
      // Transform user data for the form
      const transformedUser = {
        id: userToEdit.id,
        name: userToEdit.name,
        email: userToEdit.email,
        phone: userToEdit.phone || '',
        title: userToEdit.title || '',
        initials: userToEdit.initials || '',
        role:  userToEdit.role, // You may need to adjust this
        responsibilities: userToEdit.responsibilities || [],
        profile_image_url: userToEdit.profile_image_url
      };
      
      setSelectedUser(transformedUser);
      fetchRolesAndDesignations();
      setIsModalOpen(true);
    } else {
      console.error('User not found for editing');
      alert('User not found');
    }
  };


    const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
    setApiErrors(null);
  };


  const fetchRolesAndDesignations = useCallback(async () => {
    setLoadingRoles(true);
    setLoadingDesignations(true);
    
    try {
      // Fetch roles
      const rolesResponse = await axios.post('http://13.210.33.250/api/role/dropdown', {
        type: "0",
        id: ""
      }, {
        headers: {
          'Accept': 'application/json',
          'company_id': companyId,
          'Authorization': `Bearer ${token}`
        }
      });

      if (rolesResponse.data.status === true) {
        const apiRoles = [];
        const responseData = rolesResponse.data.data;
        
        if (responseData && typeof responseData === 'object') {
          Object.entries(responseData).forEach(([title, id]) => {
            apiRoles.push({ id, title });
          });
        }
        
        setRoles(apiRoles);
      } else {
        throw new Error(rolesResponse.data.message || 'Failed to fetch roles');
      }

      // Fetch designations
      const designationsResponse = await axios.get('http://13.210.33.250/api/user/dropdown-responsibility', {
        headers: {
          'Accept': 'application/json',
          'company_id': companyId,
          'Authorization': `Bearer ${token}`
        }
      });

      if (Array.isArray(designationsResponse.data)) {
        const apiDesignations = designationsResponse.data.map(item => ({
          id: item.id,
          name: item.title
        }));
        setDesignations(apiDesignations);
      } else {
        throw new Error('Invalid designations response format');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      
      if (error.response?.status === 401) {
        setRolesError('Unauthorized - Please login again');
        setDesignationsError('Unauthorized - Please login again');
      } else {
        setRolesError(error.response?.data?.message || 'Failed to load roles');
        setDesignationsError(error.response?.data?.message || 'Failed to load designations');
      }
      
      // Set default data
      
    } finally {
      setLoadingRoles(false);
      setLoadingDesignations(false);
    }
  }, [companyId, token]);

  // Get token from localStorage or context (you might have a different auth system)
  useEffect(() => {
    // In real app, get token from your auth context or localStorage
    const savedToken = localStorage.getItem('access_token');
    if (savedToken) {
      setToken(savedToken);
    }
  }, []);

  // Fetch users from API
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://13.210.33.250/api/user', {
        headers: {
          'Accept': 'application/json',
          'company_id': companyId,
          'Authorization': `Bearer ${token}`
        },
        params: {
          status: statusFilter === 'All' ? null : (statusFilter === 'Active' ? 1 : 0)
        }
      });

      if (response.data.status) {
        const apiUsers = response.data.data.map(user => ({
          id: user.id,
          name: `${user.first_name} ${user.last_name || ''}`.trim(),
          email: user.email,
          initials: user.initials || (user.first_name?.[0] || '') + (user.last_name?.[0] || ''),
          phone: user.phone || 'N/A',
          role: user.role?.title || 'N/A',
          status: user.status ? 'Active' : 'Inactive',
          title: user.title || 'N/A',
          profile_image: user.profile_image_url,
          first_name: user.first_name,
          last_name: user.last_name,
          role_type: user.role_type
        }));
        
        setUsers(apiUsers);
        setFilteredUsers(apiUsers);
        setTotalPages(Math.ceil(apiUsers.length / ITEMS_PER_PAGE));
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      // Fallback to mock data if API fails (for development)
      const mockUsers = [
        { id: 1, name: 'Admin 2', email: 'admin2@gmail.com', initials: 'A2', phone: 'N/A', role: 'Admin', status: 'Active', title: 'N/A' },
        { id: 21, name: 'Appu s', email: 'appu@gmail.com', initials: 'RC', phone: '9748555774', role: 'Normal User', status: 'Active', title: 'CS Engineer' },
        { id: 6, name: 'Owner 2', email: 'owner2@gmail.com', initials: 'O2', phone: 'N/A', role: 'Owner', status: 'Active', title: 'N/A' },
        { id: 22, name: 'Raghavan 5', email: 'raghavan1@gmail.com', initials: 'RC', phone: '9748555774', role: 'Normal User', status: 'Active', title: 'Mechanical Engineer' },
        { id: 8, name: 'Sales Rep 2_1', email: 'sales2_1@gmail.com', initials: 'SR', phone: 'N/A', role: 'Normal User', status: 'Active', title: 'N/A' },
        { id: 9, name: 'Sales Rep 2_2', email: 'sales2_2@gmail.com', initials: 'SR', phone: 'N/A', role: 'Normal User', status: 'Active', title: 'N/A' },
        { id: 3, name: 'Test User', email: 'test@example.com', initials: 'TU', phone: '1234567890', role: 'User', status: 'Inactive', title: 'Tester' },
      ];
      setUsers(mockUsers);
      setFilteredUsers(mockUsers);
      setTotalPages(Math.ceil(mockUsers.length / ITEMS_PER_PAGE));
    } finally {
      setLoading(false);
    }
  }, [companyId, token, statusFilter]);

  // Initial data fetch
  useEffect(() => {
    if (token) {
      fetchUsers();
    }
  }, [fetchUsers, token]);

  // Apply filters and sorting
  useEffect(() => {
    let result = [...users];
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(user => 
        user.name.toLowerCase().includes(term) || 
        user.email.toLowerCase().includes(term)
      );
    }
    
    // Apply status filter
    if (statusFilter !== 'All') {
      result = result.filter(user => user.status === statusFilter);
    }
    
    // Apply sorting
    result.sort((a, b) => {
      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];
      
      // Handle case-insensitive string comparison
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
      
      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
    
    setFilteredUsers(result);
    setCurrentPage(1);
    setTotalPages(Math.ceil(result.length / ITEMS_PER_PAGE));
  }, [searchTerm, statusFilter, users, sortConfig]);

  // Handle sorting
  const handleSort = (key) => {
    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Get sort icon
  const getSortIcon = (key) => {
    if (sortConfig.key !== key) {
      return (
        <span className={styles.sortIcon}>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M7 15l5 5 5-5M7 9l5-5 5 5" />
          </svg>
        </span>
      );
    }
    
    return sortConfig.direction === 'asc' ? (
      <span className={styles.sortIcon}>
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M7 15l5 5 5-5" />
        </svg>
      </span>
    ) : (
      <span className={styles.sortIcon}>
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M7 9l5-5 5 5" />
        </svg>
      </span>
    );
  };

  // Get current page data
  const getCurrentPageData = () => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredUsers.slice(startIndex, endIndex);
  };

  const handleSaveUser = async (userData, mode) => {
    setModalLoading(true);
    setApiErrors(null);
    
    try {
      const formData = new FormData();
      
      // Common fields for both add and edit
      formData.append('name', userData.name.trim());
      formData.append('email', userData.email.trim());
      formData.append('phone', userData.phone?.trim() || '');
      formData.append('title', userData.title?.trim() || '');
      formData.append('initials', userData.initials?.trim() || '');
      formData.append('role', userData.role);
      
      // Mode-specific fields
      if (mode === 'add') {
        formData.append('overwite_data', '1');
      } else if (mode === 'edit') {
        formData.append('_method', 'put');
      }
      
      // Append profile image if changed
      if (userData.profile_image) {
        formData.append('user_picture', userData.profile_image);
      }
      
      // Append responsibilities
      if (userData.responsibilities && userData.responsibilities.length > 0) {
        userData.responsibilities.forEach(responsibilityId => {
          formData.append('responsibilities[]', responsibilityId.toString());
        });
      } else {
        formData.append('responsibilities', '');
      }
      
      let url = 'http://13.210.33.250/api/user';
      let method = 'post';
      
      if (mode === 'edit' && userData.id) {
        url = `http://13.210.33.250/api/user/${userData.id}`;
      }
      
      const response = await axios({
        method: mode === 'edit' ? 'post' : 'post', // Use POST with _method for PUT
        url: url,
        data: formData,
        headers: {
          'Accept': 'application/json',
          'company_id': companyId,
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      console.log(`${mode === 'add' ? 'Add' : 'Update'} response:`, response.data);
      
      if (response.data.status === true) {
        alert(`User ${mode === 'add' ? 'added' : 'updated'} successfully!`);
        fetchUsers(); // Refresh user list
        return true;
      } else {
        throw new Error(response.data.message || `Failed to ${mode} user`);
      }
    } catch (error) {
      console.error(`Error ${mode}ing user:`, error);
      
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
        
        if (error.response.data?.errors) {
          setApiErrors({
            message: error.response.data.message || 'Validation failed',
            errors: error.response.data.errors
          });
          
          const errorMessages = [];
          Object.entries(error.response.data.errors).forEach(([field, messages]) => {
            if (Array.isArray(messages)) {
              errorMessages.push(`${field}: ${messages[0]}`);
            }
          });
          
          if (errorMessages.length > 0) {
            alert('Validation errors:\n' + errorMessages.join('\n'));
          }
        } else if (error.response.data?.message) {
          alert(`Error: ${error.response.data.message}`);
          setApiErrors({
            message: error.response.data.message,
            errors: {}
          });
        }
      } else {
        alert('Network error. Please try again.');
      }
      
      return false;
    } finally {
      setModalLoading(false);
    }
  };


  // Handle status toggle
  const handleStatusToggle = async (userId) => {
    try {
      const user = users.find(u => u.id === userId);
      const newStatus = user.status === 'Active' ? 0 : 1;
      
      const response = await axios.post(`http://13.210.33.250/api/user/${userId}/status`, 
        { status: newStatus },
        {
          headers: {
            'Accept': 'application/json',
            'company_id': companyId,
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.data.status) {
        // Update local state
        setUsers(prevUsers => 
          prevUsers.map(user => 
            user.id === userId 
              ? { ...user, status: user.status === 'Active' ? 'Inactive' : 'Active' }
              : user
          )
        );
      }
    } catch (error) {
      console.error('Error updating user status:', error);
      alert('Failed to update user status');
    }
  };

  const handleDelete = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        const response = await axios.delete(`http://13.210.33.250/api/user/${userId}`, {
          headers: {
            'Accept': 'application/json',
            'company_id': companyId,
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        });

        if (response.data.status) {
          setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
          alert('User deleted successfully');
        }
      } catch (error) {
        console.error('Error deleting user:', error);
        alert('Failed to delete user');
      }
    }
  };

  // Render page numbers
  const renderPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          className={`${styles.pageButton} ${currentPage === i ? styles.activePage : ''}`}
          onClick={() => setCurrentPage(i)}
        >
          {i}
        </button>
      );
    }
    
    return pages;
  };

  // Mobile view card
  const renderMobileCard = (user, index) => (
    <div key={user.id} className={styles.mobileCard}>
      <div className={styles.cardHeader}>
        <div className={styles.userAvatar}>
          {user.initials || 'US'}
        </div>
        <div className={styles.userInfo}>
          <h3 className={styles.userName}>{user.name}</h3>
          <span className={`${styles.roleBadge} ${styles[user.role.toLowerCase().replace(' ', '_')]}`}>
            {user.role}
          </span>
        </div>
        <div className={styles.cardActions}>
          <button 
            className={styles.editBtn}
            onClick={() => handleEditUser(user.id)}
            title="Edit"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </button>
          <button 
            className={styles.deleteBtn}
            onClick={() => handleDelete(user.id)}
            title="Delete"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
          </button>
        </div>
      </div>
      
      <div className={styles.cardDetails}>
        <div className={styles.detailRow}>
          <span className={styles.detailLabel}>Email:</span>
          <span className={styles.detailValue}>{user.email}</span>
        </div>
        <div className={styles.detailRow}>
          <span className={styles.detailLabel}>Phone:</span>
          <span className={styles.detailValue}>{user.phone}</span>
        </div>
        <div className={styles.detailRow}>
          <span className={styles.detailLabel}>Title:</span>
          <span className={styles.detailValue}>{user.title}</span>
        </div>
        <div className={styles.detailRow}>
          <span className={styles.detailLabel}>Initials:</span>
          <span className={styles.detailValue}>{user.initials}</span>
        </div>
        <div className={styles.detailRow}>
          <span className={styles.detailLabel}>Status:</span>
          <button
            className={`${styles.toggleButton} ${
              user.status === 'Active' ? styles.toggleOn : styles.toggleOff
            }`}
            onClick={() => handleStatusToggle(user.id)}
          >
            <span className={styles.toggleTrack}>
              <span className={styles.toggleThumb}></span>
            </span>
            <span className={styles.toggleLabel}>
              {user.status === 'Active' ? 'ON' : 'OFF'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>User Management</h1>
          <p className={styles.subtitle}>Manage users and their permissions</p>
        </div>
        <button className={styles.addButton} onClick={handleAddUser}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 5v14M5 12h14" />
          </svg>
          Add User
        </button>
      </div>

      {/* Filters Section */}
      <div className={styles.filters}>
        <div className={styles.searchContainer}>
          <div className={styles.searchIcon}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
          {searchTerm && (
            <button className={styles.clearSearch} onClick={() => setSearchTerm('')}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        <div className={styles.statusFilter}>
          <select
            id="statusFilter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={styles.statusSelect}
          >
            <option value="All">All Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>

        <button className={styles.refreshButton} onClick={fetchUsers}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
          </svg>
          Refresh
        </button>
      </div>

      {/* Users Table - Desktop View */}
      <div className={styles.desktopView}>
        <div className={styles.tableContainer}>
          {loading ? (
            <div className={styles.loading}>
              <div className={styles.spinner}></div>
              <p>Loading users...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className={styles.noData}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="8.5" cy="7" r="4" />
                <line x1="18" y1="8" x2="23" y2="13" />
                <line x1="23" y1="8" x2="18" y2="13" />
              </svg>
              <h3>No users found</h3>
              <p>Try adjusting your search or filter criteria</p>
            </div>
          ) : (
            <>
              <div className={styles.tableWrapper}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th onClick={() => handleSort('id')} className={styles.sortableHeader}>
                        S.No
                        {getSortIcon('id')}
                      </th>
                      <th onClick={() => handleSort('name')} className={styles.sortableHeader}>
                        Name
                        {getSortIcon('name')}
                      </th>
                      <th onClick={() => handleSort('email')} className={styles.sortableHeader}>
                        Email
                        {getSortIcon('email')}
                      </th>
                      <th onClick={() => handleSort('initials')} className={styles.sortableHeader}>
                        Initials
                        {getSortIcon('initials')}
                      </th>
                      <th onClick={() => handleSort('phone')} className={styles.sortableHeader}>
                        Phone
                        {getSortIcon('phone')}
                      </th>
                      <th onClick={() => handleSort('role')} className={styles.sortableHeader}>
                        Role
                        {getSortIcon('role')}
                      </th>
                      <th onClick={() => handleSort('status')} className={styles.sortableHeader}>
                        Status
                        {getSortIcon('status')}
                      </th>
                      <th onClick={() => handleSort('title')} className={styles.sortableHeader}>
                        Title
                        {getSortIcon('title')}
                      </th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getCurrentPageData().map((user, index) => (
                      <tr key={user.id}>
                        <td>{(currentPage - 1) * ITEMS_PER_PAGE + index + 1}</td>
                        <td>
                          <div className={styles.userCell}>
                            <span className={styles.userName}>{user.name}</span>
                          </div>
                        </td>
                        <td className={styles.emailCell}>{user.email}</td>
                        <td>{user.initials}</td>
                        <td>{user.phone}</td>
                        <td>
                          <span className={`${styles.roleBadge} ${styles[user.role.toLowerCase().replace(' ', '_')]}`}>
                            {user.role}
                          </span>
                        </td>
                        <td>
                          <button
                            className={`${styles.toggleButton} ${
                              user.status === 'Active' ? styles.toggleOn : styles.toggleOff
                            }`}
                            onClick={() => handleStatusToggle(user.id)}
                            title={user.status === 'Active' ? 'Click to deactivate' : 'Click to activate'}
                          >
                            <span className={styles.toggleTrack}>
                              <span className={styles.toggleThumb}></span>
                            </span>
                          </button>
                        </td>
                        <td>{user.title}</td>
                        <td>
                          <div className={styles.actionButtons}>
                            <button 
                              className={styles.editBtn}
                              onClick={() => handleEditUser(user.id)}
                              title="Edit"
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                              </svg>
                            </button>
                            <button 
                              className={styles.deleteBtn}
                              onClick={() => handleDelete(user.id)}
                              title="Delete"
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Users Cards - Mobile View */}
      <div className={styles.mobileView}>
        {loading ? (
          <div className={styles.loading}>
            <div className={styles.spinner}></div>
            <p>Loading users...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className={styles.noData}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="8.5" cy="7" r="4" />
              <line x1="18" y1="8" x2="23" y2="13" />
              <line x1="23" y1="8" x2="18" y2="13" />
            </svg>
            <h3>No users found</h3>
            <p>Try adjusting your search or filter criteria</p>
          </div>
        ) : (
          <div className={styles.mobileCards}>
            {getCurrentPageData().map((user, index) => renderMobileCard(user, index))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {filteredUsers.length > 0 && (
        <div className={styles.pagination}>
          <div className={styles.paginationInfo}>
            Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, filteredUsers.length)} of {filteredUsers.length} users
          </div>
          
          <div className={styles.paginationControls}>
            <button
              className={styles.pageButton}
              onClick={() => setCurrentPage(prev => prev - 1)}
              disabled={currentPage === 1}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
            
            {renderPageNumbers()}
            
            <button
              className={styles.pageButton}
              onClick={() => setCurrentPage(prev => prev + 1)}
              disabled={currentPage === totalPages}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          </div>
        </div>
      )}

       <UserModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveUser}
        apiErrors={apiErrors}
        companyId={companyId}
        token={token}
        mode={modalMode}
        userData={selectedUser}
        roles={roles}
        designations={designations}
        loadingRoles={loadingRoles}
        loadingDesignations={loadingDesignations}
        rolesError={rolesError}
        designationsError={designationsError}
      />
    </div>
  );
};

export default UserManagement;