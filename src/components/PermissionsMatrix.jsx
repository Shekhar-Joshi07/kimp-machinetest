"use client";
import { useState, useEffect, useCallback } from "react";

export default function PermissionsMatrix() {
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [optimisticUpdates, setOptimisticUpdates] = useState(new Map());

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      await fetch("/api/init");

      const [rolesRes, permissionsRes, assignmentsRes] = await Promise.all([
        fetch("/api/roles"),
        fetch("/api/permissions"),
        fetch("/api/assignments"),
      ]);

      if (!rolesRes.ok || !permissionsRes.ok || !assignmentsRes.ok) {
        throw new Error("Failed to fetch data");
      }

      const rolesData = await rolesRes.json();
      const permissionsData = await permissionsRes.json();
      const assignmentsData = await assignmentsRes.json();

      setRoles(rolesData);
      setPermissions(permissionsData);
      setAssignments(assignmentsData);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredPermissions = permissions.filter((p) =>
    p.name.toLowerCase().includes(filter.toLowerCase())
  );

  const isGranted = useCallback(
    (roleId, permissionId) => {
      const key = `${roleId}-${permissionId}`;

      if (optimisticUpdates.has(key)) {
        return optimisticUpdates.get(key);
      }

      if (!assignments || assignments.length === 0) {
        return false;
      }

      const assignment = assignments.find((a) => {
        const aRoleId = a.roleId?._id || a.roleId;
        const aPermissionId = a.permissionId?._id || a.permissionId;
        return aRoleId === roleId && aPermissionId === permissionId;
      });

      return assignment?.granted || false;
    },
    [assignments, optimisticUpdates]
  );

  const toggleCell = async (roleId, permissionId) => {
    const key = `${roleId}-${permissionId}`;
    const currentValue = isGranted(roleId, permissionId);
    const newValue = !currentValue;

    setOptimisticUpdates((prev) => new Map(prev).set(key, newValue));

    try {
      const response = await fetch("/api/assignments/toggle", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roleId, permissionId, value: newValue }),
      });

      if (!response.ok) {
        throw new Error("Server error");
      }

      setOptimisticUpdates((prev) => {
        const newMap = new Map(prev);
        newMap.delete(key);
        return newMap;
      });

      await fetchData();
    } catch (error) {
      setOptimisticUpdates((prev) => {
        const newMap = new Map(prev);
        newMap.delete(key);
        return newMap;
      });

      console.error("Failed to toggle assignment:", error);
    }
  };

  const getRowState = (roleId) => {
    const roleAssignments = filteredPermissions.map((p) =>
      isGranted(roleId, p._id)
    );
    const granted = roleAssignments.filter(Boolean).length;
    const total = roleAssignments.length;

    if (granted === 0) return "none";
    if (granted === total) return "all";
    return "partial";
  };

  const getColumnState = (permissionId) => {
    const permissionAssignments = roles.map((r) =>
      isGranted(r._id, permissionId)
    );
    const granted = permissionAssignments.filter(Boolean).length;
    const total = permissionAssignments.length;

    if (granted === 0) return "none";
    if (granted === total) return "all";
    return "partial";
  };

  const toggleRow = async (roleId) => {
    const state = getRowState(roleId);
    const newValue = state !== "all";

    filteredPermissions.forEach((permission) => {
      const key = `${roleId}-${permission._id}`;
      setOptimisticUpdates((prev) => new Map(prev).set(key, newValue));
    });

    try {
      const response = await fetch("/api/assignments/row", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roleId,
          permissionIds: filteredPermissions.map((p) => p._id),
          value: newValue,
        }),
      });

      if (!response.ok) {
        throw new Error("Server error");
      }

      setOptimisticUpdates(new Map());
      await fetchData();
    } catch (error) {
      setOptimisticUpdates((prev) => {
        const newMap = new Map(prev);
        filteredPermissions.forEach((permission) => {
          newMap.delete(`${roleId}-${permission._id}`);
        });
        return newMap;
      });

      console.error("Failed to toggle row:", error);
    }
  };

  const toggleColumn = async (permissionId) => {
    const state = getColumnState(permissionId);
    const newValue = state !== "all";

    roles.forEach((role) => {
      const key = `${role._id}-${permissionId}`;
      setOptimisticUpdates((prev) => new Map(prev).set(key, newValue));
    });

    try {
      const response = await fetch("/api/assignments/column", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          permissionId,
          roleIds: roles.map((r) => r._id),
          value: newValue,
        }),
      });

      if (!response.ok) {
        throw new Error("Server error");
      }

      setOptimisticUpdates(new Map());
      await fetchData();
    } catch (error) {
      setOptimisticUpdates((prev) => {
        const newMap = new Map(prev);
        roles.forEach((role) => {
          newMap.delete(`${role._id}-${permissionId}`);
        });
        return newMap;
      });

      console.error("Failed to toggle column:", error);
    }
  };

  const getTriStateIcon = (state) => {
    switch (state) {
      case "all":
        return "✓";
      case "partial":
        return "◐";
      case "none":
      default:
        return "";
    }
  };

  if (loading) {
    return <div className="p-4">Loading...</div>;
  }

  return (
    <div>
      <div className="mb-4">
        <input
          type="text"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Filter permissions..."
          className="px-2 py-1 border border-gray-600 bg-gray-800 text-white"
        />
        <span className="ml-2 text-sm text-gray-400">
          {filteredPermissions.length}/{permissions.length} permissions
        </span>
      </div>

      <div className="overflow-auto">
        <table className="w-full border-collapse border border-gray-600">
          <thead className="bg-gray-700">
            <tr>
              <th className="border border-gray-600 px-2 py-1 text-left text-white">
                Role / Permission
              </th>
              {filteredPermissions.map((permission) => (
                <th
                  key={permission._id}
                  className="border border-gray-600 px-2 py-1 text-center text-white cursor-pointer hover:bg-gray-600"
                  onClick={() => toggleColumn(permission._id)}
                  style={{ transform: "none", writingMode: "horizontal-tb" }}
                >
                  <div className="text-xs" style={{ transform: "none" }}>
                    <div>{permission.name}</div>
                    <div>{getTriStateIcon(getColumnState(permission._id))}</div>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-gray-800">
            {roles.map((role) => (
              <tr key={role._id} className="hover:bg-gray-700">
                <td
                  className="border border-gray-600 px-2 py-1 text-white cursor-pointer"
                  onClick={() => toggleRow(role._id)}
                >
                  {role.name} {getTriStateIcon(getRowState(role._id))}
                </td>
                {filteredPermissions.map((permission) => (
                  <td
                    key={`${role._id}-${permission._id}`}
                    className="border border-gray-600 px-2 py-1 text-center"
                  >
                    <button
                      onClick={() => toggleCell(role._id, permission._id)}
                      className={`w-6 h-6 border ${
                        isGranted(role._id, permission._id)
                          ? "bg-green-600 border-green-600 text-white"
                          : "bg-gray-700 border-gray-500 text-gray-400"
                      }`}
                    >
                      {isGranted(role._id, permission._id) ? "✓" : ""}
                    </button>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
