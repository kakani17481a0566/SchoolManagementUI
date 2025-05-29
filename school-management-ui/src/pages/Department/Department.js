import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Department.css';
import Navbar from '../../components/Navbar';

const Department = () => {
  const [departments, setDepartments] = useState([]);
  const [selectedDept, setSelectedDept] = useState(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [organizations, setOrganizations] = useState([]);
  const [deptToDelete, setDeptToDelete] = useState(null);


  const token = localStorage.getItem('token');
  const tenantId = localStorage.getItem('tenantId');
  const userId = localStorage.getItem('userId');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const deptResponse = await axios.get(`https://localhost:7171/api/Department/tenant/${tenantId}`, {
          headers: { Authorization: `${token}` },
        });
        if (deptResponse.data.statusCode === 200) {
          setDepartments(deptResponse.data.data);
        }

        const orgResponse = await axios.get(`https://localhost:7171/api/Organization/tenant/${tenantId}`, {
          headers: { Authorization: `${token}` },
        });
        if (orgResponse.data.statusCode === 200) {
          setOrganizations(orgResponse.data.data);
        }
      } catch (error) {
        console.error('API error:', error);
      }
    };

    fetchData();
  }, [tenantId, token]);

  const handleEditClick = (dept) => {
    setSelectedDept(dept);
    setIsPopupOpen(true);
  };

  const handleSave = async () => {
    const payload = {
      name: selectedDept.name,
      organizationId: parseInt(selectedDept.organizationId),
    };

    try {
      if (selectedDept.id) {
        await axios.put(`https://localhost:7171/api/Department/${selectedDept.id}/tenant/${tenantId}`, {
          ...payload,
          headUserId: parseInt(selectedDept.headUserId),
          updatedBy: userId,
        }, {
          headers: { Authorization: `${token}` },
        });
      } else {
        await axios.post(`https://localhost:7171/api/Department`, {
          ...payload,
          tenantId: tenantId,
          headUserId: 2,
          createdBy: userId,
        }, {
          headers: { Authorization: `${token}` },
        });
      }

      setIsPopupOpen(false);
      // Refresh the data
      const refreshed = await axios.get(`https://localhost:7171/api/Department/tenant/${tenantId}`, {
        headers: { Authorization: `${token}` },
      });
      setDepartments(refreshed.data.data);
    } catch (err) {
      console.error('Save failed:', err);
    }
  };

  const handleAddDepartment = () => {
    setSelectedDept({
      id: null,
      name: '',
      tenantId: tenantId,
      headUserId: '',
      organizationId: '',
    });
    setIsPopupOpen(true);
  };

  const confirmDeletePopup = (dept) => {
    setDeptToDelete(dept);
  };
  const handleConfirmDelete = async () => {
    if (!deptToDelete) return;

    try {
      await axios.delete(`https://localhost:7171/api/Department/${deptToDelete.id}/tenant/${tenantId}`, {
        headers: { Authorization: `${token}` },
      });

      setDepartments(prev => prev.filter(d => d.id !== deptToDelete.id));
    } catch (error) {
      console.error('Delete failed:', error);
      alert('Delete operation failed.');
    } finally {
      setDeptToDelete(null); // close popup
    }
  };

  const handleCancelDelete = () => {
    setDeptToDelete(null);
  };



  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSelectedDept(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div>
      <Navbar />
      <div className="department-container">
        <div className="department-header">
          <h2>Departments</h2>
          <button className="add-button" onClick={handleAddDepartment}>+ Add</button>
        </div>

        <table className="department-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Organization</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {departments.map((dept) => (
              <tr key={dept.id}>
                <td>{dept.id}</td>
                <td>{dept.name}</td>
                <td>{dept.organizationName}</td>
                <td>
                  <div className="action-buttons">
                    <button className="action-btn edit-btn" onClick={() => handleEditClick(dept)}>Edit</button>
                    <button className="action-btn delete-btn" onClick={() => confirmDeletePopup(dept)}>
                      Delete
                    </button>
                  </div>

                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {isPopupOpen && (
          <div className="popup-overlay">
            <div className="popup-content">
              <h3>{selectedDept.id ? 'Edit Department' : 'Add Department'}</h3>
              <input
                name="name"
                value={selectedDept.name}
                onChange={handleInputChange}
                placeholder="Department Name"
              />
              <select
                name="organizationId"
                value={selectedDept.organizationId}
                onChange={handleInputChange}
              >
                <option value="">Select Organization</option>
                {organizations.map((org) => (
                  <option key={org.organizationId} value={org.organizationId}>
                    {org.name}
                  </option>
                ))}
              </select>
              <div className="popup-buttons">
                <button
                  className={`save-btn ${!selectedDept.id ? 'add-mode' : ''}`}
                  onClick={handleSave}
                >
                  Save
                </button>
                {selectedDept.id && (
                  <button onClick={() => setIsPopupOpen(false)}>Cancel</button>
                )}
              </div>
            </div>
          </div>
        )}
        {deptToDelete && (
  <div className="popup-overlay">
    <div className="popup-content">
      <h3>Confirm Delete</h3>
      <p>Are you sure you want to delete department "<strong>{deptToDelete.name}</strong>"?</p>
      <div className="popup-buttons">
        <button onClick={handleConfirmDelete} className="save-btn" style={{ backgroundColor: '#dc3545' }}>
          Yes
        </button>
        <button onClick={handleCancelDelete} className="save-btn" style={{ backgroundColor: '#6c757d' }}>
          No
        </button>
      </div>
    </div>
  </div>
)}

      </div>
    </div>
  );
};

export default Department;

