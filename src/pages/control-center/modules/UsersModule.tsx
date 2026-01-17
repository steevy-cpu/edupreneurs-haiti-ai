import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, ChevronLeft, ChevronRight, BadgeCheck, ExternalLink, Wifi } from "lucide-react";
import { getAvatarUrl } from "@/lib/avatarMap";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { useNavigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { useOnlineUsers } from "../hooks/useOnlineUsers";

interface UserProfile {
  id: string;
  user_id: string;
  full_name: string;
  nickname: string;
  avatar_url: string | null;
  academic_grade: string;
  school: string | null;
  verified: boolean;
  created_at: string;
  last_seen: string | null;
  gold_earned: number;
}

const GRADES = [
  { value: "all", label: "Tous les niveaux" },
  { value: "7AF", label: "7ème AF" },
  { value: "8AF", label: "8ème AF" },
  { value: "9AF", label: "9ème AF" },
  { value: "NS3", label: "NS3" },
  { value: "NS4", label: "NS4" },
  { value: "PHILO", label: "Philo" },
];

const PAGE_SIZE = 20;

export default function UsersModule() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [gradeFilter, setGradeFilter] = useState("all");
  const [onlineFilter, setOnlineFilter] = useState<"all" | "online">("all");
  const [currentPage, setCurrentPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  // Real-time online users tracking
  const { onlineUserIds, onlineCount, isConnected, isOnline } = useOnlineUsers();

  useEffect(() => {
    fetchUsers();
  }, [searchTerm, gradeFilter, currentPage]);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from("profiles")
        .select("id, user_id, full_name, nickname, avatar_url, academic_grade, school, verified, created_at, last_seen, gold_earned", { count: "exact" })
        .order("created_at", { ascending: false })
        .range(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE - 1);

      if (searchTerm) {
        query = query.or(`full_name.ilike.%${searchTerm}%,nickname.ilike.%${searchTerm}%`);
      }

      if (gradeFilter !== "all") {
        query = query.eq("academic_grade", gradeFilter);
      }

      const { data, count, error } = await query;

      if (error) throw error;

      setUsers(data || []);
      setTotalCount(count || 0);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter users by online status (client-side since it's real-time data)
  const displayUsers = onlineFilter === "online"
    ? users.filter(u => isOnline(u.user_id))
    : users;

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Jamais";
    return formatDistanceToNow(new Date(dateString), { addSuffix: true, locale: fr });
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher par nom ou pseudo..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(0);
            }}
            className="pl-9"
          />
        </div>
        <Select value={gradeFilter} onValueChange={(v) => { setGradeFilter(v); setCurrentPage(0); }}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Niveau" />
          </SelectTrigger>
          <SelectContent>
            {GRADES.map((grade) => (
              <SelectItem key={grade.value} value={grade.value}>
                {grade.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={onlineFilter} onValueChange={(v: "all" | "online") => setOnlineFilter(v)}>
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les utilisateurs</SelectItem>
            <SelectItem value="online">
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-green-500" />
                En ligne ({onlineCount})
              </span>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            <span className={`h-2 w-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-muted'}`} />
            <span className={isConnected ? 'text-green-600 dark:text-green-400 font-medium' : ''}>
              {onlineCount} en ligne
            </span>
          </span>
          <span className="text-muted-foreground/50">•</span>
          <span>
            {onlineFilter === "online" 
              ? `${displayUsers.length} affiché${displayUsers.length !== 1 ? 's' : ''}`
              : `${totalCount} utilisateur${totalCount !== 1 ? 's' : ''}`
            }
          </span>
        </div>
        <span>Page {currentPage + 1} sur {totalPages || 1}</span>
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-12"></TableHead>
              <TableHead>Nom</TableHead>
              <TableHead className="hidden md:table-cell">Pseudo</TableHead>
              <TableHead className="hidden lg:table-cell">Niveau</TableHead>
              <TableHead className="hidden xl:table-cell">École</TableHead>
              <TableHead className="hidden md:table-cell">Inscrit</TableHead>
              <TableHead className="hidden lg:table-cell">Dernière visite</TableHead>
              <TableHead className="w-10"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-8 w-8 rounded-full" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell className="hidden lg:table-cell"><Skeleton className="h-4 w-16" /></TableCell>
                  <TableCell className="hidden xl:table-cell"><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell className="hidden lg:table-cell"><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                </TableRow>
              ))
            ) : displayUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  {onlineFilter === "online" 
                    ? "Aucun utilisateur en ligne dans cette page"
                    : "Aucun utilisateur trouvé"
                  }
                </TableCell>
              </TableRow>
            ) : (
              displayUsers.map((user) => (
                <TableRow key={user.id} className="hover:bg-muted/30 cursor-pointer" onClick={() => navigate(`/profile/${user.user_id}`)}>
                  <TableCell>
                    <div className="relative">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={getAvatarUrl(user.avatar_url)} />
                        <AvatarFallback className="bg-primary/10 text-primary text-xs">
                          {user.full_name?.[0] || "?"}
                        </AvatarFallback>
                      </Avatar>
                      {isOnline(user.user_id) && (
                        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <span className="font-medium">{user.full_name}</span>
                      {user.verified && (
                        <BadgeCheck className="h-4 w-4 text-primary fill-primary/20" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-muted-foreground">
                    @{user.nickname}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <Badge variant="secondary" className="font-normal">
                      {user.academic_grade}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden xl:table-cell text-muted-foreground">
                    {user.school || "—"}
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-muted-foreground text-sm">
                    {formatDate(user.created_at)}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-muted-foreground text-sm">
                    {isOnline(user.user_id) ? (
                      <span className="text-green-600 dark:text-green-400 font-medium flex items-center gap-1">
                        <Wifi className="h-3 w-3" />
                        En ligne
                      </span>
                    ) : (
                      formatDate(user.last_seen)
                    )}
                  </TableCell>
                  <TableCell>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/profile/${user.user_id}`);
                      }}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
            disabled={currentPage === 0}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-muted-foreground px-2">
            {currentPage + 1} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
            disabled={currentPage >= totalPages - 1}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
