import { useQuery } from "@tanstack/react-query";
import { User } from "@shared/schema";

export function usePeers(search: string) {
  return useQuery<User[]>({
    queryKey: [`/api/users/search?query=${search}`],
    enabled: search.length > 0
  });
}
