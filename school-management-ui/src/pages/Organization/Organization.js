import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../../components/Navbar";
import { FaEdit } from "react-icons/fa";
import { MdDeleteForever } from "react-icons/md";
import Toast from "../../components/Toast";
import useToast from "../../hooks/useToast";

import "./Organization.css";

const API_BASE_URL = "https://localhost:7171/api/Organization";

const useOrganizations = (tenantId, userId, showToast) => {
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
      showToast("Failed to load organizations.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  // Return a promise so caller can react after deletion
  const deleteOrganization = (id) => {
    return axios
      .delete(`${API_BASE_URL}/${id}/${tenantId}`)
      .then(() => {
        setOrganizationList((prev) => prev.filter((org) => org.organizationId !== id));
      })
      .catch((error) => {
        throw error;
      });
  };

  return {
    organizationList,
    setOrganizationList,
    isLoading,
    fetchOrganizations,
    deleteOrganization,
  };
};

const Organization = () => {
  const tenantId = parseInt(localStorage.getItem("tenantId"));
  const userId = parseInt(localStorage.getItem("userId"));
  const { toast, showToast, hideToast } = useToast();

  const {
    organizationList,
    isLoading,
    fetchOrganizations,
    deleteOrganization,
  } = useOrganizations(tenantId, userId, showToast);

  const [editingOrg, setEditingOrg] = useState(null);
  const [editForm, setEditForm] = useState({ name: "", parentId: "" });
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [validationError, setValidationError] = useState("");

  useEffect(() => {
    if (!tenantId) {
      showToast("Tenant ID is missing.", "error");
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
      setValidationError("Organization name is required.");
      return false;
    }
    if (
      editingOrg &&
      editForm.parentId &&
      editForm.parentId === editingOrg.organizationId.toString()
    ) {
      setValidationError("Parent ID cannot be the organization itself.");
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
        showToast(
          `Organization '${editingOrg.name}' updated to '${payload.name}'!`,
          "success"
        );
      } else {
        await axios.post(API_BASE_URL, payload);
        showToast(`Organization '${payload.name}' created successfully!`, "success");
      }
      await fetchOrganizations();
      setIsPopupOpen(false);
    } catch (error) {
      console.error("Error saving organization", error);
      showToast("Failed to save organization.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = (id) => {
    const orgToDelete = organizationList.find((org) => org.organizationId === id);
    if (!orgToDelete) {
      showToast("Organization not found.", "error");
      return;
    }

    if (!window.confirm(`Are you sure you want to delete organization '${orgToDelete.name}'?`)) return;

    setIsSaving(true);
    deleteOrganization(id)
      .then(() => {
        showToast(`Organization '${orgToDelete.name}' deleted successfully!`, "success");
      })
      .catch(() => {
        showToast("Failed to delete organization.", "error");
      })
      .finally(() => {
        setIsSaving(false);
      });
  };

  return (
    <div>
      <Navbar />
      <div className="department-container">
        <div className="department-header">
          <h2>Organizations</h2>
          <button className="add-button" onClick={() => openEditPopup(null)} disabled={isSaving}>
            <span style={{ marginRight: 6, fontWeight: "bold" }}>Add Organization</span>
          </button>
        </div>

        {isLoading ? (
          <p>Loading organizations...</p>
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
                          onClick={() => handleDelete(org.organizationId)}
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
                    No organizations found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}

        {isPopupOpen && (
          <div className="popup-overlay">
            <div
              className="popup-content"
              role="dialog"
              aria-modal="true"
              aria-labelledby="popup-title"
            >
              <h3 id="popup-title">{editingOrg ? "Edit Organization" : "Add Organization"}</h3>

              <div className="form-group">
                <label htmlFor="org-name">Organization Name</label>
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
                <div className="validation-error" style={{ color: "red", marginBottom: 8 }}>
                  {validationError}
                </div>
              )}

              <div className="popup-buttons">
                <button className="save-btn" onClick={handleSave} disabled={isSaving}>
                  {isSaving ? "Saving..." : "Save"}
                </button>
                <button
                  className="cancel-btn"
                  onClick={() => setIsPopupOpen(false)}
                  disabled={isSaving}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        <Toast
          message={toast.message}
          type={toast.type}
          onClose={hideToast}
          visible={toast.visible}
        />
      </div>
    </div>
  );
};

export default Organization;
