export type Role = "ADMIN" | "EMPLOYEE";

export function getSessionRole(): Role | null {
  try {
    const token = sessionStorage.getItem("accessToken");
    if (!token || token.split(".").length !== 3) return null;
    const payload = JSON.parse(
      atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")),
    );
    if (
      typeof payload.sub !== "string" ||
      !payload.sub.trim() ||
      typeof payload.exp !== "number" ||
      !Number.isFinite(payload.exp) ||
      payload.exp * 1000 <= Date.now() ||
      (payload.role !== "ADMIN" && payload.role !== "EMPLOYEE")
    )
      return null;
    return payload.role;
  } catch {
    return null;
  }
}

export function portalPath(role: Role) {
  return role === "ADMIN" ? "/hrd-portal" : "/employee-portal";
}
