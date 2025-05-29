import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Department.css";
import Navbar from "../../components/Navbar";
import Toast from "../../components/Toast";
import useToast from "../../hooks/useToast";
import Spinner from "react-bootstrap/Spinner";

const Department = () => {
  const [departments, setDepartments] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [selectedDept, setSelectedDept] = useState(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [deptToDelete, setDeptToDelete] = useState(null);
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");
  const tenantId = localStorage.getItem("tenantId");
  const userId = localStorage.getItem("userId");

  const { toast, showToast, hideToast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const deptRes = await axios.get(
          `https://localhost:7171/api/Department/tenant/${tenantId}`,
          { headers: { Authorization: `${token}` } }
        );
        if (deptRes.data.statusCode === 200) {
          const sorted = deptRes.data.data.sort((a, b) => a.id - b.id);
          setDepartments(sorted);
        }

        const orgRes = await axios.get(
          `https://localhost:7171/api/Organization/tenant/${tenantId}`,
          { headers: { Authorization: `${token}` } }
        );
        if (orgRes.data.statusCode === 200) {
          setOrganizations(orgRes.data.data);
        }
      } catch (error) {
        console.error("Fetch error:", error);
        showToast("Failed to load departments or organizations.", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [tenantId, token]);

  const handleAdd = () => {
    setSelectedDept({
      id: null,
      name: "",
      organizationId: "",
      tenantId,
      headUserId: "",
    });
    setIsPopupOpen(true);
  };

  const handleEditClick = (dept) => {
    setSelectedDept(dept);
    setIsPopupOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSelectedDept((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!selectedDept.name || !selectedDept.organizationId) {
      showToast("Please enter all required fields.", "error");
      return;
    }

    const payload = {
      name: selectedDept.name,
      organizationId: parseInt(selectedDept.organizationId),
      headUserId: selectedDept.headUserId ? parseInt(selectedDept.headUserId) : 2,
    };

    try {
      if (selectedDept.id) {
        await axios.put(
          `https://localhost:7171/api/Department/${selectedDept.id}/tenant/${tenantId}`,
          { ...payload, updatedBy: userId },
          { headers: { Authorization: `${token}` } }
        );
        showToast(`Department '${selectedDept.name}' updated successfully!`, "success");
      } else {
        await axios.post(
          `https://localhost:7171/api/Department`,
          { ...payload, tenantId, createdBy: userId },
          { headers: { Authorization: `${token}` } }
        );
        showToast(`Department '${selectedDept.name}' created successfully!`, "success");
      }

      const refreshed = await axios.get(
        `https://localhost:7171/api/Department/tenant/${tenantId}`,
        { headers: { Authorization: `${token}` } }
      );
      const sorted = refreshed.data.data.sort((a, b) => a.id - b.id);
      setDepartments(sorted);
      setIsPopupOpen(false);
    } catch (error) {
      console.error("Save failed:", error);
      showToast("Failed to save department.", "error");
    }
  };

  const confirmDeletePopup = (dept) => {
    setDeptToDelete(dept);
  };

  const handleConfirmDelete = async () => {
    try {
      await axios.delete(
        `https://localhost:7171/api/Department/${deptToDelete.id}/tenant/${tenantId}`,
        { headers: { Authorization: `${token}` } }
      );
      setDepartments((prev) =>
        prev.filter((d) => d.id !== deptToDelete.id).sort((a, b) => a.id - b.id)
      );
      showToast(`Department '${deptToDelete.name}' deleted successfully!`, "success");
    } catch (error) {
      console.error("Delete failed:", error);
      showToast("Delete operation failed.", "error");
    } finally {
      setDeptToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setDeptToDelete(null);
  };

  return (
    <div>
      <Navbar />
      <div className="department-container">
        <div className="department-header">
          <h2>Departments</h2>
          <button className="add-button" onClick={handleAdd}>
            <span aria-hidden="true" style={{ marginRight: "6px", fontWeight: "bold" }}>
              Add
            </span>
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", marginTop: "50px" }}>
            <Spinner animation="border" role="status" variant="primary">
              <span className="visually-hidden">Loading...</span>
            </Spinner>
          </div>
        ) : (
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
              {departments.length ? (
                departments.map((dept) => (
                  <tr key={dept.id}>
                    <td>{dept.id}</td>
                    <td>{dept.name}</td>
                    <td>{dept.organizationName}</td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="action-btn edit-btn"
                          onClick={() => handleEditClick(dept)}
                        >
                          Edit
                        </button>
                        <button
                          className="action-btn delete-btn"
                          onClick={() => confirmDeletePopup(dept)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" style={{ textAlign: "center" }}>
                    No departments found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}

        {isPopupOpen && (
          <div className="popup-overlay">
            <div className="popup-content">
              <h3>{selectedDept.id ? "Edit Department" : "Add Department"}</h3>

              <div className="form-group">
                <label htmlFor="dept-name">Department Name</label>
                <input
                  id="dept-name"
                  name="name"
                  type="text"
                  value={selectedDept.name}
                  onChange={handleInputChange}
                  placeholder="Enter department name"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="org-select">Organization</label>
                <select
                  id="org-select"
                  name="organizationId"
                  value={selectedDept.organizationId}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select Organization</option>
                  {organizations.map((org) => (
                    <option key={org.organizationId} value={org.organizationId}>
                      {org.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="popup-buttons">
                <button className="save-btn" onClick={handleSave}>
                  Save
                </button>
                <button type="button" onClick={() => setIsPopupOpen(false)}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {deptToDelete && (
          <div className="popup-overlay">
            <div className="popup-content">
              <h3>Confirm Delete</h3>
              <p>
                Are you sure you want to delete department "<strong>{deptToDelete.name}</strong>"?
              </p>
              <div className="popup-buttons">
                <button
                  className="save-btn"
                  style={{ backgroundColor: "#dc3545" }}
                  onClick={handleConfirmDelete}
                >
                  Yes
                </button>
                <button
                  className="save-btn"
                  style={{ backgroundColor: "#6c757d" }}
                  onClick={handleCancelDelete}
                >
                  No
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Toast Notification */}
      <Toast message={toast.message} type={toast.type} onClose={hideToast} visible={toast.visible} />
    </div>
  );
};

export default Department;
