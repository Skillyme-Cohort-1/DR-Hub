import { useState, useEffect } from "react";
import { apiFetch } from "../config/api";
import { extractSlots } from "../utils/helpers";

export function useSlots(token) {
  const [allSlots, setAllSlots] = useState([]);

  useEffect(() => {
    if (!token) {
      setAllSlots([]);
      return;
    }

    let cancelled = false;
    const run = async () => {
      try {
        const data = await apiFetch("/api/slots", { token });
        if (!cancelled) setAllSlots(extractSlots(data));
      } catch {
        if (!cancelled) setAllSlots([]);
      }
    };
    run();
    return () => { cancelled = true; };
  }, [token]);

  return { allSlots };
}