import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Megaphone, Users, GraduationCap, BadgeCheck, Send, Clock, Loader2, RefreshCw, Calendar, XCircle, CheckCircle } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

const ACADEMIC_GRADES = [
  '7AF', '7e', '8AF', '8e', '9AF', 'NS1', 'NS3', 'NS4', 'Philo', 'S1'
] as const;

interface Announcement {
  id: string;
  title: string;
  message: string;
  target_type: 'all' | 'grade' | 'verified';
  target_grades: string[] | null;
  scheduled_for: string | null;
  sent_at: string | null;
  sent_by: string;
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'cancelled';
  recipients_count: number;
  success_count: number;
  created_at: string;
}

const AnnouncementsModule = () => {
  const queryClient = useQueryClient();
  
  // Form state
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [targetType, setTargetType] = useState<'all' | 'grade' | 'verified'>("all");
  const [selectedGrades, setSelectedGrades] = useState<string[]>([]);
  const [scheduleType, setScheduleType] = useState<'now' | 'later'>("now");
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("08:00");

  // Fetch announcements history
  const { data: announcements, isLoading: loadingAnnouncements, refetch } = useQuery({
    queryKey: ['announcements'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (error) throw error;
      return data as Announcement[];
    }
  });

  // Fetch recipient count estimate
  const { data: recipientCount } = useQuery({
    queryKey: ['recipient-count', targetType, selectedGrades],
    queryFn: async () => {
      let query = supabase.from('push_subscriptions').select('user_id', { count: 'exact', head: true });
      
      if (targetType === 'grade' && selectedGrades.length > 0) {
        // Need to join with profiles - using a workaround
        const { data: userIds } = await supabase
          .from('profiles')
          .select('user_id')
          .in('academic_grade', selectedGrades);
        
        if (userIds && userIds.length > 0) {
          query = supabase
            .from('push_subscriptions')
            .select('user_id', { count: 'exact', head: true })
            .in('user_id', userIds.map(u => u.user_id));
        } else {
          return 0;
        }
      } else if (targetType === 'verified') {
        const { data: userIds } = await supabase
          .from('profiles')
          .select('user_id')
          .eq('verified', true);
        
        if (userIds && userIds.length > 0) {
          query = supabase
            .from('push_subscriptions')
            .select('user_id', { count: 'exact', head: true })
            .in('user_id', userIds.map(u => u.user_id));
        } else {
          return 0;
        }
      }
      
      const { count } = await query;
      return count || 0;
    },
    enabled: targetType === 'all' || (targetType === 'grade' && selectedGrades.length > 0) || targetType === 'verified'
  });

  // Send announcement mutation
  const sendMutation = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Calculate scheduled_for if scheduling
      let scheduledFor: string | null = null;
      if (scheduleType === 'later' && scheduledDate) {
        const dateTime = new Date(`${scheduledDate}T${scheduledTime}`);
        scheduledFor = dateTime.toISOString();
      }

      // Create announcement record
      const { data: announcement, error: createError } = await supabase
        .from('announcements')
        .insert({
          title,
          message,
          target_type: targetType,
          target_grades: targetType === 'grade' ? selectedGrades : null,
          scheduled_for: scheduledFor,
          sent_by: user.id,
          status: scheduledFor ? 'scheduled' : 'sending'
        })
        .select()
        .single();

      if (createError) throw createError;

      // If sending now, invoke the edge function
      if (!scheduledFor) {
        const response = await supabase.functions.invoke('send-announcement', {
          body: { announcementId: announcement.id }
        });

        if (response.error) throw new Error(response.error.message);
        return { announcement, result: response.data };
      }

      return { announcement, scheduled: true };
    },
    onSuccess: (data) => {
      if (data.scheduled) {
        toast.success('Annonce programmée avec succès!');
      } else {
        toast.success(`Annonce envoyée! ${data.result?.successCount || 0} destinataires atteints.`);
      }
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
      resetForm();
    },
    onError: (error: Error) => {
      toast.error(`Erreur: ${error.message}`);
    }
  });

  // Cancel scheduled announcement
  const cancelMutation = useMutation({
    mutationFn: async (announcementId: string) => {
      const { error } = await supabase
        .from('announcements')
        .update({ status: 'cancelled' })
        .eq('id', announcementId)
        .eq('status', 'scheduled');
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Annonce annulée');
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
    },
    onError: (error: Error) => {
      toast.error(`Erreur: ${error.message}`);
    }
  });

  // Send scheduled announcement now
  const sendNowMutation = useMutation({
    mutationFn: async (announcementId: string) => {
      const response = await supabase.functions.invoke('send-announcement', {
        body: { announcementId }
      });

      if (response.error) throw new Error(response.error.message);
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(`Annonce envoyée! ${data?.successCount || 0} destinataires atteints.`);
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
    },
    onError: (error: Error) => {
      toast.error(`Erreur: ${error.message}`);
    }
  });

  const resetForm = () => {
    setTitle("");
    setMessage("");
    setTargetType("all");
    setSelectedGrades([]);
    setScheduleType("now");
    setScheduledDate("");
    setScheduledTime("08:00");
  };

  const handleGradeToggle = (grade: string) => {
    setSelectedGrades(prev => 
      prev.includes(grade) 
        ? prev.filter(g => g !== grade)
        : [...prev, grade]
    );
  };

  const isFormValid = title.trim() && message.trim() && 
    (targetType !== 'grade' || selectedGrades.length > 0) &&
    (scheduleType !== 'later' || scheduledDate);

  const getStatusBadge = (status: Announcement['status']) => {
    switch (status) {
      case 'draft':
        return <Badge variant="secondary">Brouillon</Badge>;
      case 'scheduled':
        return <Badge className="bg-blue-500">Programmé</Badge>;
      case 'sending':
        return <Badge className="bg-yellow-500 text-black">En cours</Badge>;
      case 'sent':
        return <Badge className="bg-green-500">Envoyé</Badge>;
      case 'cancelled':
        return <Badge variant="outline" className="text-muted-foreground">Annulé</Badge>;
    }
  };

  const getTargetLabel = (announcement: Announcement) => {
    switch (announcement.target_type) {
      case 'all':
        return 'Tous les utilisateurs';
      case 'grade':
        return announcement.target_grades?.join(', ') || 'Niveaux sélectionnés';
      case 'verified':
        return 'Utilisateurs vérifiés';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Annonces</h2>
          <p className="text-muted-foreground">Envoyez des notifications à vos utilisateurs</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Actualiser
        </Button>
      </div>

      {/* Create Announcement Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Megaphone className="h-5 w-5" />
            Nouvelle Annonce
          </CardTitle>
          <CardDescription>
            Créez et envoyez une notification push à vos utilisateurs
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Titre</Label>
            <Input
              id="title"
              placeholder="Ex: Examens du Bac cette semaine!"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={100}
            />
            <p className="text-xs text-muted-foreground text-right">{title.length}/100</p>
          </div>

          {/* Message */}
          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              placeholder="Bonne chance à tous pour vos examens! 🍀"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              maxLength={500}
              rows={3}
            />
            <p className="text-xs text-muted-foreground text-right">{message.length}/500</p>
          </div>

          {/* Target Audience */}
          <div className="space-y-3">
            <Label>Audience cible</Label>
            <RadioGroup value={targetType} onValueChange={(v) => setTargetType(v as typeof targetType)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="all" id="all" />
                <Label htmlFor="all" className="flex items-center gap-2 cursor-pointer font-normal">
                  <Users className="h-4 w-4" />
                  Tous les utilisateurs
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="grade" id="grade" />
                <Label htmlFor="grade" className="flex items-center gap-2 cursor-pointer font-normal">
                  <GraduationCap className="h-4 w-4" />
                  Par niveau scolaire
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="verified" id="verified" />
                <Label htmlFor="verified" className="flex items-center gap-2 cursor-pointer font-normal">
                  <BadgeCheck className="h-4 w-4" />
                  Utilisateurs vérifiés uniquement
                </Label>
              </div>
            </RadioGroup>

            {/* Grade Selection */}
            {targetType === 'grade' && (
              <div className="pl-6 pt-2">
                <div className="flex flex-wrap gap-2">
                  {ACADEMIC_GRADES.map((grade) => (
                    <label
                      key={grade}
                      className={`flex items-center gap-2 px-3 py-2 rounded-md border cursor-pointer transition-colors ${
                        selectedGrades.includes(grade)
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'bg-background hover:bg-muted'
                      }`}
                    >
                      <Checkbox
                        checked={selectedGrades.includes(grade)}
                        onCheckedChange={() => handleGradeToggle(grade)}
                        className="hidden"
                      />
                      {grade}
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Recipient Count */}
          <div className="p-3 bg-muted rounded-lg">
            <p className="text-sm flex items-center gap-2">
              <Users className="h-4 w-4" />
              Destinataires estimés: <strong>~{recipientCount ?? '...'}</strong> utilisateurs
            </p>
          </div>

          {/* Schedule */}
          <div className="space-y-3">
            <Label>Programmation</Label>
            <RadioGroup value={scheduleType} onValueChange={(v) => setScheduleType(v as typeof scheduleType)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="now" id="now" />
                <Label htmlFor="now" className="flex items-center gap-2 cursor-pointer font-normal">
                  <Send className="h-4 w-4" />
                  Envoyer maintenant
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="later" id="later" />
                <Label htmlFor="later" className="flex items-center gap-2 cursor-pointer font-normal">
                  <Calendar className="h-4 w-4" />
                  Programmer pour plus tard
                </Label>
              </div>
            </RadioGroup>

            {scheduleType === 'later' && (
              <div className="pl-6 pt-2 flex gap-3">
                <Input
                  type="date"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-auto"
                />
                <Input
                  type="time"
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  className="w-auto"
                />
              </div>
            )}
          </div>

          {/* Send Button */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                className="w-full" 
                disabled={!isFormValid || sendMutation.isPending}
              >
                {sendMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Send className="h-4 w-4 mr-2" />
                )}
                {scheduleType === 'now' ? "Envoyer l'annonce" : "Programmer l'annonce"}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirmer l'envoi</AlertDialogTitle>
                <AlertDialogDescription>
                  {scheduleType === 'now' 
                    ? `Vous êtes sur le point d'envoyer cette annonce à environ ${recipientCount ?? 0} utilisateurs. Cette action ne peut pas être annulée.`
                    : `Cette annonce sera envoyée le ${scheduledDate} à ${scheduledTime} à environ ${recipientCount ?? 0} utilisateurs.`
                  }
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Annuler</AlertDialogCancel>
                <AlertDialogAction onClick={() => sendMutation.mutate()}>
                  Confirmer
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>

      {/* Announcements History */}
      <Card>
        <CardHeader>
          <CardTitle>Historique des annonces</CardTitle>
        </CardHeader>
        <CardContent>
          {loadingAnnouncements ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : !announcements?.length ? (
            <div className="text-center py-8 text-muted-foreground">
              <Megaphone className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Aucune annonce envoyée</p>
            </div>
          ) : (
            <div className="space-y-4">
              {announcements.map((announcement) => (
                <div
                  key={announcement.id}
                  className="p-4 border rounded-lg space-y-2"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-semibold truncate">{announcement.title}</h4>
                        {getStatusBadge(announcement.status)}
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                        {announcement.message}
                      </p>
                    </div>
                    
                    {announcement.status === 'scheduled' && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => sendNowMutation.mutate(announcement.id)}
                          disabled={sendNowMutation.isPending}
                        >
                          {sendNowMutation.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Send className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => cancelMutation.mutate(announcement.id)}
                          disabled={cancelMutation.isPending}
                        >
                          <XCircle className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {getTargetLabel(announcement)}
                    </span>
                    {announcement.sent_at ? (
                      <span className="flex items-center gap-1">
                        <CheckCircle className="h-3 w-3 text-green-500" />
                        Envoyé {format(new Date(announcement.sent_at), 'dd/MM/yyyy HH:mm', { locale: fr })}
                      </span>
                    ) : announcement.scheduled_for ? (
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Prévu {format(new Date(announcement.scheduled_for), 'dd/MM/yyyy HH:mm', { locale: fr })}
                      </span>
                    ) : null}
                    {announcement.status === 'sent' && (
                      <span className="flex items-center gap-1">
                        📊 {announcement.success_count}/{announcement.recipients_count} reçus
                        {announcement.recipients_count > 0 && (
                          <span className="text-green-600">
                            ({Math.round((announcement.success_count / announcement.recipients_count) * 100)}%)
                          </span>
                        )}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AnnouncementsModule;
