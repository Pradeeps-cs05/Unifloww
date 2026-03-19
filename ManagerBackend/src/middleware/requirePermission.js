// middleware/requirePermission.js
import { PERMISSIONS } from "../config/permissions.js";

export function requirePermission(requiredPermission) {
  return (req, res, next) => {
    const user = req.user; // ✅ make sure this variable exists first

    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // ✅ Root admin can bypass all permission checks
    if (user.role === "root_admin") return next();

    // ✅ If user has the exact required permission
    if (user.permissions.includes(requiredPermission)) return next();

    // ✅ If user has the "own" variant (e.g., READ_OWN, UPDATE_OWN)
    const ownEquivalent = `${requiredPermission}_OWN`;
    if (user.permissions.includes(ownEquivalent)) {
      req.permissionScope = "own"; // mark that this user is limited to "own" data
      return next();
    }

    // ❌ Otherwise, insufficient permissions
    return res.status(403).json({ error: "Forbidden: insufficient permissions" });
  };
}
