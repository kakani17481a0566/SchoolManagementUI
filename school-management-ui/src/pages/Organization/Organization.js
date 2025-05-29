import React, { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import "./Organization.css";

const Organization = () => {
  const [organizationList, setOrganizationList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingOrg, setEditingOrg] = useState(null);
  const [editForm, setEditForm] = useState({ name: "", parentId: "" });

  const tenantId = localStorage.getItem("tenantId");
  const updatedBy = localStorage.getItem("userId");

  useEffect(() => {
    if (!tenantId) {
      alert("No tenantId found in localStorage");
      setLoading(false);
      return;
    }

    fetch(`https://localhost:7171/api/Organization/tenant/${tenantId}`, {
      headers: { Accept: "*/*" },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch data");
        return res.json();
      })
      .then((data) => {
        const sorted = (data.data || []).sort((a, b) => a.organizationId - b.organizationId);
        setOrganizationList(sorted);
      })
      .catch((err) => {
        console.error(err);
        alert("Error loading data");
      })
      .finally(() => setLoading(false));
  }, [tenantId]);

  const handleEdit = (org) => {
    setEditingOrg(org);
    setEditForm({ name: org.name, parentId: org.parentId || "" });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!editingOrg) return;

    fetch(`https://localhost:7171/api/Organization/${editingOrg.organizationId}/${tenantId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Accept: "*/*",
      },
      body: JSON.stringify({
        name: editForm.name,
        parentId: editForm.parentId || null,
        updatedBy: Number(updatedBy),
      }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Update failed");
        alert("Organization updated successfully");
        return res.json();
      })
      .then(() => window.location.reload())
      .catch((err) => {
        console.error(err);
        alert("Error updating organization");
      });
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this organization?")) {
      fetch(`https://localhost:7171/api/Organization/${id}/${tenantId}`, {
        method: "DELETE",
        headers: { Accept: "*/*" },
      })
        .then((res) => {
          if (!res.ok) throw new Error("Delete failed");
          setOrganizationList((prev) => prev.filter((org) => org.organizationId !== id));
        })
        .catch((err) => {
          console.error(err);
          alert("Error deleting organization");
        });
    }
  };

  return (
    <div className="page-wrapper">
      <Navbar />
      <header className="page-header">
        <h1>Organization Profile</h1>
        <p>Details about your registered organization</p>
      </header>

      <main>
        {loading ? (
          <p>Loading organization data...</p>
        ) : organizationList.length === 0 ? (
          <p>No organization data found.</p>
        ) : (
          <table className="org-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {organizationList.map((org) => (
                <tr key={org.organizationId}>
                  <td>{org.organizationId}</td>
                  <td>{org.name}</td>
                  <td>
                    <button className="edit-btn" onClick={() => handleEdit(org)}>Edit</button>
                    <button className="delete-btn" onClick={() => handleDelete(org.organizationId)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {editingOrg && (
          <div className="modal-overlay">
            <div className="modal">
              <h3>Edit Organization (ID: {editingOrg.organizationId})</h3>
              <form onSubmit={handleEditSubmit}>
                <input
                  type="text"
                  name="name"
                  placeholder="Organization Name"
                  value={editForm.name}
                  onChange={handleEditChange}
                  required
                />
                <input
                  type="number"
                  name="parentId"
                  placeholder="Parent ID (optional)"
                  value={editForm.parentId}
                  onChange={handleEditChange}
                />
                <div className="modal-actions">
                  <button type="submit" className="edit-btn">Save</button>
                  <button type="button" className="delete-btn" onClick={() => setEditingOrg(null)}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>

      <footer className="page-footer">
        <p>&copy; 2025 MyWebsite. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Organization;
