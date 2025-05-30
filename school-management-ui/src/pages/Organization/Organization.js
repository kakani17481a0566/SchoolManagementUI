import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../../components/Navbar";
import { FaEdit } from "react-icons/fa";
import { MdDeleteForever } from "react-icons/md";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Spinner from "react-bootstrap/Spinner";
import "./Organization.css";

const API_BASE_URL = "https://localhost:7171/api/Organization";

const useOrganizations = (tenantId) => {
  const [organizationList, setOrganizationList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchOrganizations = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/tenant/${tenantId}`);
      const sorted = res.data.data.sort((a, b) => a.organizationId - b.organizationId);
      setOrganizationList(sorted);
    } catch (error) {
      console.error("Failed to fetch organizations", error);
      toast.error(error.response?.data?.message || "Failed to load organizations");
    } finally {
      setIsLoading(false);
    }
  };

  const deleteOrganization = async (id) => {
    try {
      await axios.delete(`${API_BASE_URL}/${id}/${tenantId}`);
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete organization");
      return false;
    }
  };

  return {
    organizationList,
    isLoading,
    fetchOrganizations,
    deleteOrganization,
  };
};

const Organization = () => {
  const tenantId = parseInt(localStorage.getItem("tenantId"));
  const userId = parseInt(localStorage.getItem("userId"));

  const {
    organizationList,
    isLoading,
    fetchOrganizations,
    deleteOrganization,
  } = useOrganizations(tenantId);

  const [editingOrg, setEditingOrg] = useState(null);
  const [editForm, setEditForm] = useState({ name: "", parentId: "" });
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [validationError, setValidationError] = useState("");

  const [orgToDelete, setOrgToDelete] = useState(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  useEffect(() => {
    if (!tenantId) {
      toast.error("Tenant ID is missing. Please login again.");
      return;
    }
    fetchOrganizations();
  }, [tenantId]);

  const openEditPopup = (org = null) => {
    setValidationError("");
    if (org) {
      setEditingOrg(org);
      setEditForm({
        name: org.name,
        parentId: org.parentId !== null ? org.parentId.toString() : "",
      });
    } else {
      setEditingOrg(null);
      setEditForm({ name: "", parentId: "" });
    }
    setIsPopupOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
    if (validationError) setValidationError("");
  };

  const validateForm = () => {
    if (!editForm.name.trim()) {
      setValidationError("Organization name is required");
      return false;
    }
    if (
      editingOrg &&
      editForm.parentId &&
      editForm.parentId === editingOrg.organizationId.toString()
    ) {
      setValidationError("Organization cannot be its own parent");
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setIsSaving(true);
    const payload = {
      name: editForm.name.trim(),
      parentId: editForm.parentId ? parseInt(editForm.parentId) : null,
      tenantId,
      ...(editingOrg ? { updatedBy: userId } : { createdBy: userId }),
    };

    try {
      if (editingOrg) {
        await axios.put(
          `${API_BASE_URL}/${editingOrg.organizationId}/${tenantId}`,
          payload
        );
        toast.success("Organization updated successfully");
      } else {
        await axios.post(API_BASE_URL, payload);
        toast.success("Organization created successfully");
      }
      await fetchOrganizations();
      setIsPopupOpen(false);
    } catch (error) {
      const errorMsg =
        error.response?.data?.message ||
        (editingOrg ? "Failed to update organization" : "Failed to create organization");
      toast.error(errorMsg);
    } finally {
      setIsSaving(false);
    }
  };

  const confirmDeletePopup = (org) => {
    setOrgToDelete(org);
    setIsConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!orgToDelete) return;

    setIsSaving(true);
    try {
      const success = await deleteOrganization(orgToDelete.organizationId);
      if (success) {
        await fetchOrganizations();
        toast.success(`Organization "${orgToDelete.name}" deleted successfully`);
      }
    } finally {
      setIsSaving(false);
      setOrgToDelete(null);
      setIsConfirmOpen(false);
    }
  };

  const handleCancelDelete = () => {
    setOrgToDelete(null);
    setIsConfirmOpen(false);
  };

  return (
    <div>
      <Navbar />
      <ToastContainer position="top-right" autoClose={5000} />

      <div className="department-container">
        <div className="department-header">
          <h2>Organizations</h2>
          <button className="add-button" onClick={() => openEditPopup(null)} disabled={isSaving}>
            <span style={{ marginRight: 6, fontWeight: "bold" }}>Add Organization</span>
          </button>
        </div>

        {isLoading ? (
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
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {organizationList.length ? (
                organizationList.map((org) => (
                  <tr key={org.organizationId}>
                    <td>{org.organizationId}</td>
                    <td>{org.name}</td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="action-btn edit-btn"
                          onClick={() => openEditPopup(org)}
                          disabled={isSaving}
                        >
                          <FaEdit className="icon" />
                          <span>Edit</span>
                        </button>
                        <button
                          className="action-btn delete-btn"
                          onClick={() => confirmDeletePopup(org)}
                          disabled={isSaving}
                        >
                          <MdDeleteForever className="icon" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" style={{ textAlign: "center" }}>
                    No organizations found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}

        {isPopupOpen && (
          <div className="popup-overlay">
            <div className="popup-content" role="dialog" aria-modal="true">
              <h3>{editingOrg ? "Edit Organization" : "Add Organization"}</h3>

              <div className="form-group">
                <label htmlFor="org-name">Organization Name *</label>
                <input
                  id="org-name"
                  name="name"
                  type="text"
                  value={editForm.name}
                  onChange={handleInputChange}
                  placeholder="Enter organization name"
                  required
                  autoFocus
                  disabled={isSaving}
                />
              </div>

              <div className="form-group">
                <label htmlFor="parentId">Parent ID (optional)</label>
                <input
                  id="parentId"
                  name="parentId"
                  type="number"
                  min="1"
                  value={editForm.parentId}
                  onChange={handleInputChange}
                  placeholder="Enter parent organization ID"
                  disabled={isSaving}
                />
              </div>

              {validationError && (
                <div className="validation-error">{validationError}</div>
              )}

              <div className="popup-buttons">
                <button className="save-btn" onClick={handleSave} disabled={isSaving}>
                  {isSaving ? "Saving..." : "Save"}
                </button>
                <button className="cancel-btn" onClick={() => setIsPopupOpen(false)} disabled={isSaving}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {isConfirmOpen && orgToDelete && (
          <div className="popup-overlay">
            <div className="popup-content">
              <h3>Confirm Delete</h3>
              <p>
                Are you sure you want to delete organization "<strong>{orgToDelete.name}</strong>" (ID: {orgToDelete.organizationId})?
              </p>
              <div className="popup-buttons">
                <button
                  className="save-btn"
                  style={{ backgroundColor: "#dc3545" }}
                  onClick={handleConfirmDelete}
                  disabled={isSaving}
                >
                  {isSaving ? "Deleting..." : "Yes, Delete"}
                </button>
                <button
                  className="save-btn"
                  style={{ backgroundColor: "#6c757d" }}
                  onClick={handleCancelDelete}
                  disabled={isSaving}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Organization;
