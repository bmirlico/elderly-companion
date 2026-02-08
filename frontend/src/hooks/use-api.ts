import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, authApi, getStoredToken, type Nudge } from "@/api/client";

export function useMe() {
  return useQuery({
    queryKey: ["auth", "me"],
    queryFn: authApi.me,
    enabled: !!getStoredToken(),
    staleTime: 5 * 60_000,
  });
}

export function useDashboardToday() {
  return useQuery({
    queryKey: ["dashboard", "today"],
    queryFn: api.getDashboardToday,
    refetchInterval: 30_000,
  });
}

export function useDashboardPulse() {
  return useQuery({
    queryKey: ["dashboard", "pulse"],
    queryFn: api.getDashboardPulse,
    refetchInterval: 30_000,
  });
}

export function useNudges() {
  return useQuery<Nudge[]>({
    queryKey: ["dashboard", "nudges"],
    queryFn: api.getNudges,
    refetchInterval: 30_000,
  });
}

export function useCallStatus() {
  return useQuery({
    queryKey: ["call", "status"],
    queryFn: api.getCallStatus,
  });
}

export function useCallTrigger() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.triggerCall,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["call"] });
    },
  });
}

export function useSimulateCall() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (scenario: string) => api.simulateCall(scenario),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useDigestTrigger() {
  return useMutation({
    mutationFn: api.triggerDigest,
  });
}
