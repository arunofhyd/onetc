export function getClientId(): string {
  try {
    let id = localStorage.getItem("onetc_client_id");
    if (!id) {
      id = (crypto?.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2)) as string;
      localStorage.setItem("onetc_client_id", id);
    }
    return id;
  } catch {
    // Fallback if localStorage unavailable
    return Math.random().toString(36).slice(2);
  }
}

export function getDisplayName(): string {
  try {
    let name = localStorage.getItem("onetc_display_name");
    if (!name) {
      name = `Guest-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
      localStorage.setItem("onetc_display_name", name);
    }
    return name;
  } catch {
    return `Guest-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
  }
}
